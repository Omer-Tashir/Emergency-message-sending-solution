import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { fadeInOnEnterAnimation } from 'angular-animations';
import { DatabaseService } from '../core/database.service';
import { SessionStorageService } from '../core/session-storage-service';
import { first, map, tap, finalize } from 'rxjs/operators';
import { Incident } from '../model/incident';
import { User } from '../model/user';
import { Trip } from '../model/trip';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-send-alert',
  templateUrl: './send-alert.component.html',
  styleUrls: ['./send-alert.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class SendAlertComponent implements OnInit, OnDestroy {
  user?: User;
  incident?: Incident;
  trips: Trip[] = [];
  columns: string[] = ['uid', 'name', 'tutor', 'groupSize', 'currentLocation'];
  dataSource!: MatTableDataSource<Trip>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private sessionStorageService: SessionStorageService,
  ) { }

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
    this.loadIncident();
    this.loadTrips();
  }

  private loadIncident(): void {
    const incidentUid = this.route.snapshot.paramMap.get('uid');
    if (incidentUid) {
      if (!this.sessionStorageService.getIncidents()?.length) {
        this.db.getIncidents().pipe(
          first(),
          map(incidents => incidents.find(i => i.uid === incidentUid)),
          tap(incident => this.incident = incident)
        );
      }
      else {
        this.incident = this.sessionStorageService.getIncident(incidentUid);
      }
    }
  }

  private loadTrips(): void {
    this.trips = this.sessionStorageService.getTripsInRadius();
    this.dataSource = new MatTableDataSource(this.trips);
  }

  submit(): void {

  }

  back(): void {
    this.router.navigate(['incident', this.route.snapshot.paramMap.get('uid')]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}