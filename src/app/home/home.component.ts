import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { AuthService } from '../auth/auth.service';
import { SessionStorageService } from '../core/session-storage-service';
import { User } from '../model/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class HomeComponent implements OnInit {
  logo: string = 'assets/logo.png';
  user?: User;

  constructor(
    private authService: AuthService,
    private sessionStorageService: SessionStorageService,
  ) { }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
  }
}
