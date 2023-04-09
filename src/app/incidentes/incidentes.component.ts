import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { SessionStorageService } from '../core/session-storage-service';
import { User } from '../model/user';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.component.html',
  styleUrls: ['./incidentes.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class IncidentesComponent implements OnInit {
  user?: User;

  constructor(
    private db: DatabaseService,
    private alertService: AlertService,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
    this.initIncidents();
  }

  private initIncidents(): void {
    
  }
}
