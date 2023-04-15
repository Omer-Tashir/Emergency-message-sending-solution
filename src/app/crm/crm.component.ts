import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Subject } from 'rxjs';
import { PapaParseService } from 'ngx-papaparse';
import { SessionStorageService } from '../core/session-storage-service';
import { User } from '../model/user';
import { Trip, TripLocation, TripTutor } from '../model/trip';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class CrmComponent implements OnInit, OnDestroy {
  user?: User;
  trips: Trip[] = [];
  fileUploaded = false;

  private incidentUid!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private papa: PapaParseService,
    private firestore: AngularFirestore,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
    this.incidentUid = this.firestore.createId();
  }

  back(): void {
    this.router.navigate(['incidents']);
  }

  submit(): void {
    this.sessionStorageService.setItem('trips', JSON.stringify(this.trips));
    this.router.navigate(['incident', this.incidentUid]);
  }

  handleFileSelect(evt: any) {
    this.fileUploaded = false;
    var reader = new FileReader();
    var files = evt.target.files; // FileList object
    var file = files[0];
    
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var csv = event.target.result; // Content of CSV file
      this.papa.parse(csv, {
        skipEmptyLines: true,
        header: true,
        complete: (results: any) => {
          for (let row of results.data) {
            this.trips.push({
              uid: row.uid,
              incidentUid: this.incidentUid,
              name: row.name,
              tutor: {
                accountName: row.accountName,
                firstname: row.firstname,
                lastname: row.lastname,
                phone1: row.phone1,
                phone2: row.phone2,
                deliveryType: row.deliveryType,
                maleVoice: row.maleVoice == 1,
              } as TripTutor,
              groupSize: row.groupSize,
              currentLocation: {
                latitude: row.latitude,
                longitude: row.longitude
              } as TripLocation
            } as Trip);
          }
          this.fileUploaded = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
