import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { first, map, share, takeUntil, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { fadeInOnEnterAnimation } from 'angular-animations';
import { DatabaseService } from '../core/database.service';
import { StorageService } from '../core/session-storage-service';
import { MessageStatus, OutgoingMessage } from '../model/message';
import { Incident } from '../model/incident';
import { User } from '../model/user';
import { Trip } from '../model/trip';
import { MessageTemplate } from '../model/message-template';

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
  messagesColumns: string[] = ['toPhone', 'group', 'type', 'status'];
  messageTemplates$!: Observable<MessageTemplate[]>;
  messageTemplates!: MessageTemplate[];
  dataSource!: MatTableDataSource<Trip>;
  messageTplCtrl!: FormControl;
  messagesDataSource!: MatTableDataSource<OutgoingMessage>;
  outgoingMessage!: string;
  sendingMessages = false;
  selectedMessageId!: any;

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

    this.messageTemplates$ = this.db.getMessageTemplates().pipe(
      share(),
      tap(t => this.messageTemplates = t)
    );

    this.messageTplCtrl = new FormControl('');
    this.messageTplCtrl.valueChanges.pipe(
      tap(value => this.outgoingMessage = value),
      tap(value => this.selectedMessageId = this.messageTemplates.find(m => m.message === value)?.message_id),
      takeUntil(this.destroy$)
    ).subscribe();
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
        group: `${trip.uid} - ${trip.name}, ${trip.groupSize} מטיילים`,
        status: MessageStatus.PENDING,
        toPhone: trip.tutor.phone1,
        type: trip.tutor.deliveryType,
        messageCount: 0,
        message: this.getResolvedMessage(trip),
        event_event_id: this.incident?.uid,
        message_message_id: this.selectedMessageId || ''
      } as OutgoingMessage
    }));

    const promises = this.messagesDataSource.data.map(message => this.db.putOutgoingMessage(message));
    Promise.all(promises).then(() => this.sendMessageSimulatorStart());
  }

  get submitDisabled(): boolean {
    return !this.outgoingMessage?.length || !this.trips?.length;
  }

  private getResolvedMessage(trip: Trip): string {
    return this.outgoingMessage
      .replace('[שם פרטי]', `${trip.tutor.firstname} ${trip.tutor.lastname}`)
      .replace('[שם טיול]', trip.name)
      .replace('[מספר טיול]', trip.uid)
      .replace('[סוג התראה]', `${this.incident?.type}`)
      .replace('[איזור טיול]', `${trip.currentLocation.latitude}, ${trip.currentLocation.longitude}`)
      .replace('[איזור פינוי]', `${trip.currentLocation.latitude}, ${trip.currentLocation.longitude}`);
  }

  private sendMessageSimulatorStart(): void {
    let timeoutArr = [];
    for (let message of this.messagesDataSource.data) {
      let randTimeout = this.randomIntFromInterval(1_000, 10_000);
      timeoutArr.push(randTimeout);
      setTimeout(() => {
        message.messageCount += 1;
        message.lastMessageSendDate = new Date();
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
