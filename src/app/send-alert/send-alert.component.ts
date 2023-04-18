import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { first, map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { fadeInOnEnterAnimation } from 'angular-animations';
import { DatabaseService } from '../core/database.service';
import { StorageService } from '../core/session-storage-service';
import { MessageStatus, OutgoingMessage } from '../model/message';
import { Incident } from '../model/incident';
import { User } from '../model/user';
import { Trip } from '../model/trip';

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
  hints: string[] = ['שם המדריך', 'שם טיול', 'מזהה טיול', 'איזור טיול', 'איזור פינוי', 'סוג התראה'];
  columns: string[] = ['uid', 'name', 'tutor', 'groupSize', 'currentLocation'];
  messagesColumns: string[] = ['toPhone', 'type', 'status'];
  dataSource!: MatTableDataSource<Trip>;
  messagesDataSource!: MatTableDataSource<OutgoingMessage>;
  outgoingMessage!: string;
  sendingMessages = false;

  MessageStatus = MessageStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getLoggedInUser();
    this.loadIncident();
    this.loadTrips();

    this.outgoingMessage = `שלום [שם פרטי],
טיולך [שם טיול] שמספרו [מספר טיול]
נמצא באיזור שעלול להוות סיכון עקב התראת [סוג התראה], הנך נדרש להתפנות במיידית מ [איזור טיול], אל [איזור פינוי].
לאישור קבלת ההודעה יש להשיב ״1״ למספר זה.`;
  }

  private loadIncident(): void {
    const incidentUid = this.route.snapshot.paramMap.get('uid');
    if (incidentUid) {
      if (!this.storageService.getIncidents()?.length) {
        this.db.getIncidents().pipe(
          first(),
          map(incidents => incidents.find(i => i.uid === incidentUid)),
          tap(incident => this.incident = incident)
        );
      }
      else {
        this.incident = this.storageService.getIncident(incidentUid);
      }
    }
  }

  private loadTrips(): void {
    this.trips = this.storageService.getTripsInRadius();
    this.dataSource = new MatTableDataSource(this.trips);
  }

  chipClicked(hint: string): void {
    this.outgoingMessage = this.outgoingMessage.concat(`[${hint}]`);
  }

  submit(): void {
    this.storageService.setItem('outgoingMessage', this.outgoingMessage);
    this.sendingMessages = true;
    this.messagesDataSource = new MatTableDataSource(this.trips.map(trip => {
      return {
        receiver: `${trip.tutor.firstname} ${trip.tutor.lastname}`,
        status: MessageStatus.PENDING,
        toPhone: trip.tutor.phone1,
        type: trip.tutor.deliveryType
      } as OutgoingMessage
    }));

    this.sendMessageSimulatorStart();
  }

  get submitDisabled(): boolean {
    return !this.outgoingMessage?.length || !this.trips?.length;
  }

  private sendMessageSimulatorStart(): void {
    let timeoutArr = [];
    for (let message of this.messagesDataSource.data) {
      let randTimeout = this.randomIntFromInterval(1_000, 10_000);
      timeoutArr.push(randTimeout);
      setTimeout(() => {
        message.status = this.randomIntFromInterval(1, 10) > 4 ? MessageStatus.APPROVED : 
        this.randomIntFromInterval(1, 2) === 1 ? MessageStatus.FAILURE : MessageStatus.DECLINED;
      }, randTimeout);
    }

    setTimeout(() => {
      this.storageService.setItem('outgoingMessageStatuses', JSON.stringify(this.messagesDataSource.data));
      this.router.navigate(['dashboard', this.incident?.uid]);
    }, Math.max(...timeoutArr));
  }

  private randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  back(): void {
    this.router.navigate(['incident', this.route.snapshot.paramMap.get('uid')]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
