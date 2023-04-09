import { Component, OnInit } from '@angular/core';

import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';
import { User } from 'src/app/model/user';

import { AuthService } from '../../auth/auth.service';
import { SessionStorageService } from '../session-storage-service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class ToolbarComponent implements OnInit {
  logo: string = 'assets/logo.svg';
  user!: User;

  constructor(
    private authService: AuthService,
    private sessionStorageService: SessionStorageService
  ) {}

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    const loadUser = this.sessionStorageService.getItem('user');
    if (!!loadUser) {
      this.user = JSON.parse(loadUser);
    }
  }
}
