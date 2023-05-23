import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

import { User } from 'src/app/model/user';
import { DatabaseService } from 'src/app/core/database.service';
import { StorageService } from 'src/app/core/session-storage-service';
import { finalize, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { from, Observable, of, Subject } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class UserComponent implements OnInit, OnDestroy {
  user?: User;
  form!: FormGroup;
  isNewUser = true;
  hasChanges = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private afAuth: AngularFireAuth,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const userUid = this.route.snapshot.paramMap.get('uid');
    if (userUid) {
      this.db.isUserExist(userUid).then(exist => {
        this.isNewUser = !exist;
        console.log('isNewUser: ' + this.isNewUser);
      });

      if (!this.storageService.getUsers()?.length) {
        this.db.getUsers().pipe(
          first(),
          map(users => users.find(i => i.uid === userUid)),
          tap(user => this.user = user),
          finalize(() => this.initForm())
        ).subscribe();
      }
      else {
        this.user = this.storageService.getUser(userUid);
        this.initForm();
      }
    }
    else {
      this.initForm();
    }
  }

  submit(): void {
    if (this.hasChanges || this.isNewUser) {
      from(this.db.putUser({...this.form.value} as User, this.isNewUser)).pipe(
        first(),
        switchMap(user => this.createInFirebaseIfNewUser(user)),
        map(user => this.router.navigate(['admin']))
      ).subscribe();
    }
    else if (this.user?.uid) {
      this.router.navigate(['admin']);
    }
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  private initForm() {
    this.form = new FormGroup({
      uid: new FormControl(this.user?.uid ?? ''),
      username: new FormControl(this.user?.username ?? '', [Validators.required]),
      name: new FormControl(this.user?.name ?? '', [Validators.required]),
      email: new FormControl(this.user?.email ?? '', [Validators.required, Validators.email]),
      password: new FormControl(this.user?.password ?? '', [Validators.required]),
    });

    this.form.valueChanges.pipe(
      tap(() => this.hasChanges = true),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private createInFirebaseIfNewUser(user: User): Observable<void> {
    if (this.isNewUser) {
      return from(this.afAuth.createUserWithEmailAndPassword(user.email, user.password)).pipe(
        map(() => void 0)
      );
    }
    else {
      return of(void 0);
    }
  }

  back(): void {
    this.router.navigate(['admin']);
  }

  remove(): void {
    this.db.removeUser({...this.form.value} as User);
    this.router.navigate(['admin']).then(() => window.location.reload());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}