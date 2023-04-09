import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';
;
import { User } from '../model/user';
import { DatabaseService } from '../core/database.service';
import { SessionStorageService } from '../core/session-storage-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class ProfileComponent implements OnInit {
  user!: User;
  form!: FormGroup;

  constructor(
    private db: DatabaseService,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(this.sessionStorageService.getItem('user'));
    this.initForm();
  }

  submit(): void {
    const user = {
      uid: this.user.uid,
      username: this.form.get('username')?.value,
      ...this.form.value
    } as User;

    this.db.putUser(user);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  private initForm() {
    this.form = new FormGroup({
      username: new FormControl({ value: this.user.username, disabled: true }, [Validators.required]),
      password: new FormControl({ value: this.user.password }, [Validators.required]),
      name: new FormControl({ value: this.user.name }, [Validators.required]),
    });
  }
}