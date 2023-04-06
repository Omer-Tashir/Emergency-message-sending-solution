import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { of } from 'rxjs';
import { delay, first, map, switchMap } from 'rxjs/operators';
import { AlertService } from 'src/app/core/alerts/alert.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [fadeInOnEnterAnimation()],
})
export class ResetPasswordComponent implements OnInit {
  logo: string = 'assets/logo.png';
  formGroup!: FormGroup;

  constructor(
    private router: Router,
    private http: HttpClient,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
    });
  }

  hasError = (controlName: string, errorName: string) => {
    return this.formGroup?.controls[controlName].hasError(errorName);
  };

  submit() {
    this.http.post(`http://localhost/emergency-message-sending-solution/reset_password.php`, {
      username: this.formGroup.controls['username'].value
    }).pipe(
      first(),
      switchMap(() => of(this.router.navigate(['home']))),
      delay(100),
      map(() => this.alert.ok('Your password has been reset!', 'Your temp password is: 123456, Please make sure to change it on the next log in'))
    ).subscribe();
  }
}
