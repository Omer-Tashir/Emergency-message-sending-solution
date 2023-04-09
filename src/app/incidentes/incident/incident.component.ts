import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';

import { User } from 'src/app/model/user';

import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/core/database.service';
import { AlertService } from 'src/app/core/alerts/alert.service';
import { SessionStorageService } from 'src/app/core/session-storage-service';

import * as moment from "moment/moment";

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class IncidentComponent implements OnInit {
  user?: User;
  cities: any[] = [];

  constructor(
    private router: Router,
    private db: DatabaseService,
    private alertService: AlertService,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
    this.db.getCitiesJSON().subscribe(data => {
      this.cities = data;
    });
  }
}
