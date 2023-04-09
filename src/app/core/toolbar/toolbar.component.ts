import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { User } from 'src/app/model/user';

import { AuthService } from '../../auth/auth.service';
import { SessionStorageService } from '../session-storage-service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  animations: [fadeInOnEnterAnimation()],
})
export class ToolbarComponent implements OnInit {
  logo: string = 'assets/logo.png';
  user?: User;

  constructor(
    private authService: AuthService,
    private sessionStorageService: SessionStorageService
  ) {}

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
  }
}
