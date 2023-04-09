import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { AuthService } from '../auth.service';

/**
 * Login page component.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeInOnEnterAnimation()],
})
export class LoginComponent implements OnInit {
  logo: string = 'assets/logo.png';
  newUser: boolean = false;
  formGroup!: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      name: new FormControl('', [Validators.nullValidator]),
      email: new FormControl('', [Validators.nullValidator]),
    });
  }
  
  toggleNewUser(): void {
    this.newUser = !this.newUser;
    this.formGroup.reset();

    if (this.newUser) {
      this.formGroup.get('name')?.setValidators(Validators.required);
      this.formGroup.get('email')?.setValidators([Validators.required, Validators.email]);
    }
    else {
      this.formGroup.get('name')?.setValidators(Validators.nullValidator);
      this.formGroup.get('email')?.setValidators(Validators.nullValidator);
    }

    this.formGroup.updateValueAndValidity({ emitEvent: true });
    this.cdref.detectChanges();
  }

  hasError = (controlName: string, errorName: string) => {
    return this.formGroup?.controls[controlName].hasError(errorName);
  };

  submit() {
    if (this.formGroup.invalid) {
      return;
    }

    if (this.newUser) {
      const user = this.formGroup.value;
      this.authService.register(user.username, user.password, user.name, user.email);
    }
    else {
      this.authService.login(
        this.formGroup.get('username')?.value,
        this.formGroup.get('password')?.value
      );
    }
  }
}