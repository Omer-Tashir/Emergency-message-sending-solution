import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { first, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { AlertService } from '../core/alerts/alert.service';
import { SessionStorageService } from '../core/session-storage-service';
import { Admin } from '../model/user';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class ProfileComponent implements OnInit {

  admin!: Admin;
  sessionUser!: Admin;
  form!: FormGroup;
  isLoading = false;
  disabledFlag = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private sessionStorageService: SessionStorageService
  ) { 
    this.admin = this.sessionStorageService.getAdmin();
    this.sessionUser = this.sessionStorageService.getAdmin();
  }

  submit(): void {
    const admin = {
      username: this.form.get('username')?.value,
      ...this.form.value
    } as Admin;

    this.sessionStorageService.setAdmin(admin);

    this.http.post(`http://localhost/emergency-message-sending-solution/update_admin.php`, admin).pipe(first()).subscribe(() => {
        this.alertService.ok('success', 'your profile has been updated');
    }, error => {
      console.log(error);
        this.alertService.ok('error', 'your profile wasn\'t updated');
    });
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  private initForm() {
    this.form = new FormGroup({
      username: new FormControl({ value: this.admin.username, disabled: true }, [Validators.required]),
      password: new FormControl({ value: this.admin.password, disabled: this.disabledFlag }, [Validators.required]),
      name: new FormControl({ value: this.admin.name, disabled: this.disabledFlag }, [Validators.required]),
    });

    this.isLoading = false;
  }

  private getUserById(id: any): Observable<Admin> {
    return this.http.get(`http://localhost/emergency-message-sending-solution/get_admins.php`).pipe(
      map((admins: any) => admins.find((u: any) => u.id == id)),
    );
  }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe((params: any) => {
      if (params.id !== undefined) {
        this.getUserById(params.id).pipe(first()).subscribe((admin: Admin) => {
          this.sessionStorageService.setAdmin(admin);
          this.disabledFlag = true;
          this.initForm();
        });
      }
      else {
        this.initForm();
      }
    });
  }
}