import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';

import { StorageService } from './core/session-storage-service';
import { AlertService } from './core/alerts/alert.service';
import { Alerts } from './core/alerts/alerts';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class AppComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private alertService: AlertService
  ) {
    Alerts.service = this.alertService;
    moment.locale("he");
  }

  isUserLoggedIn(): boolean {
    return !!this.storageService.getLoggedInUser();
  }

  ngOnInit(): void {
  }
}