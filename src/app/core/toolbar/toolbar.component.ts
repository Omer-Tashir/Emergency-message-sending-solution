import { Component, OnInit } from '@angular/core';

import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';

import { AuthService } from '../../auth/auth.service';
import { Admin } from 'src/app/model/admin';
import { SessionStorageService } from '../session-storage-service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class ToolbarComponent implements OnInit {
  logo: string = 'assets/logo.svg';
  loggedIn: boolean = false;
  photoLoaded = false;

  name!: string;
  image!: string;

  constructor(
    private authService: AuthService,
    private sessionStorageService: SessionStorageService
  ) {}

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
