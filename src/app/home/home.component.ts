import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { AuthService } from '../auth/auth.service';
import { SessionStorageService } from '../core/session-storage-service';
import { Admin } from '../model/user';

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
  loggedIn: boolean = false;
  photoLoaded = false;

  name!: string;
  image!: string;

  constructor(
    private authService: AuthService,
    private sessionStorageService: SessionStorageService,
  ) { }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    const loadUser = this.sessionStorageService.getAdmin();
    if (!!loadUser) {
      const admin: Admin = loadUser;
      this.name = admin.name;
      this.image = admin.photo;
      this.photoLoaded = true;
      this.loggedIn = true;
    }
  }
}
