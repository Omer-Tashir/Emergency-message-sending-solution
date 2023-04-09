import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';

import { SessionStorageService } from './core/session-storage-service';
import { AlertService } from './core/alerts/alert.service';
import { Alerts } from './core/alerts/alerts';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    fadeInOnEnterAnimation(),
    fadeOutOnLeaveAnimation()
  ]
})
export class AppComponent implements OnInit {

  constructor(
    private sessionStorageService: SessionStorageService,
    private alertService: AlertService
  ) {
    Alerts.service = this.alertService;
    moment.locale("he");
  }

  isUserLoggedIn(): boolean {
    return !!this.sessionStorageService.getLoggedInUser();
  }

  ngOnInit(): void {
  }
}