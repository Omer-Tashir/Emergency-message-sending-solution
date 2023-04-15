import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { PapaParseService } from 'ngx-papaparse';
import { Subject } from 'rxjs';
import { DatabaseService } from '../core/database.service';
import { SessionStorageService } from '../core/session-storage-service';
import { Incident } from '../model/incident';
import { User } from '../model/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class DashboardComponent implements OnInit, OnDestroy {
  user?: User;
  incident?: Incident;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private papa: PapaParseService,
    private firestore: AngularFirestore,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
    const incidentUid = this.route.snapshot.paramMap.get('uid');
    if (incidentUid) {
      this.incident = this.sessionStorageService.getIncident(incidentUid);
    }
  }

  complete(): void {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
