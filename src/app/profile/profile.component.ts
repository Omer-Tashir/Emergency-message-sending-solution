import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { delay, first, map, tap } from 'rxjs/operators';
import { from } from 'rxjs';

import { User } from '../model/user';
import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { StorageService } from '../core/session-storage-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class ProfileComponent implements OnInit {
  user?: User;
  form!: FormGroup;

  constructor(
    private db: DatabaseService,
    private alertService: AlertService,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.storageService.getLoggedInUser();
    this.initForm();
  }

  submit(): void {
    const user = {
      uid: this.user?.uid,
      username: this.form.get('username')?.value,
      ...this.form.value
    } as User;

    from(this.db.putUser(user, false)).pipe(
      first(),
      tap(() => this.alertService.ok('השינויים נשמרו בהצלחה', 'המערכת טוענת את הנתונים המעודכנים')),
      delay(3_000),
      map(() => window.location.reload())
    ).subscribe();
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  private initForm() {
    this.form = new FormGroup({
      username: new FormControl({ value: this.user?.username, disabled: true }, [Validators.required]),
      password: new FormControl(this.user?.password, [Validators.required, Validators.minLength(6)]),
      name: new FormControl(this.user?.name, [Validators.required]),
      email: new FormControl(this.user?.email, [Validators.required, Validators.email]),
    });
  }
}