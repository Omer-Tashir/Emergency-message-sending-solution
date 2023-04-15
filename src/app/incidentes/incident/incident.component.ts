import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { User } from 'src/app/model/user';
import { MapsAPILoader } from '@agm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Incident, IncidentType, RiskType } from 'src/app/model/incident';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { SessionStorageService } from 'src/app/core/session-storage-service';
import { finalize, first, map, takeUntil, tap } from 'rxjs/operators';
import { Marker } from 'src/app/model/google-maps';
import { from, Subject } from 'rxjs';

import * as loader from '@googlemaps/js-api-loader';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class IncidentComponent implements OnInit, OnDestroy {
  user?: User;
  form!: FormGroup;
  incident?: Incident;
  isNewIncident = true;
  hasChanges = false;

  riskTypes: string[] = [];
  incidentTypes: string[] = [];
  
  RiskType = RiskType;
  IncidentType = IncidentType;

  // Google Maps
  latitude!: number;
  longitude!: number;
  zoom!: number;
  address!: string;
  radius = 50000;
  radiusLat = 0;
  radiusLong = 0;
  markers: Marker[] = [];
  private geoCoder: any;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private mapsAPILoader: MapsAPILoader,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();

    for (let type of Object.values(RiskType)) {
      this.riskTypes.push(type);
    }
    for (let type of Object.values(IncidentType)) {
      this.incidentTypes.push(type);
    }

    //load Map
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
    });

    this.loadIncident();
  }

  private loadIncident(): void {
    const incidentUid = this.route.snapshot.paramMap.get('uid');
    if (incidentUid) {
      this.isNewIncident = incidentUid === 'new';
      if (!this.isNewIncident) {
        if (!this.sessionStorageService.getIncidents()?.length) {
          this.db.getIncidents().pipe(
            first(),
            map(incidents => incidents.find(i => i.uid === incidentUid)),
            tap(incident => this.incident = incident),
            finalize(() => this.initForm())
          );
        }
        else {
          this.incident = this.sessionStorageService.getIncident(incidentUid);
          this.initForm();
        }
      }
      else {
        this.initForm();
      }
    }
    else {
      this.initForm();
    }
  }

  submit(): void {
    if (this.hasChanges || this.isNewIncident) {
      from(this.db.putIncident({...this.form.value} as Incident)).pipe(
        first(),
        map(incident => this.router.navigate(['sendAlert', incident.uid]))
      ).subscribe();
    }
    else if (this.incident?.uid) {
      this.router.navigate(['sendAlert', this.incident.uid]);
    }
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  private initForm() {
    this.form = new FormGroup({
      uid: new FormControl(this.incident?.uid ?? ''),
      name: new FormControl(this.incident?.name ?? '', [Validators.required]),
      date: new FormControl(this.incident?.date ?? new Date(), [Validators.required]),
      location: new FormControl(this.incident?.location ?? '', [Validators.required]),
      risk: new FormControl(this.incident?.risk ?? '', [Validators.required]),
      type: new FormControl(this.incident?.type ?? '', [Validators.required]),
      successRate: new FormControl(this.incident?.successRate ?? 0),
    });

    this.form.valueChanges.pipe(
      tap(() => this.hasChanges = true),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  back(): void {
    this.router.navigate(['incidents']);
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.radiusLat = this.latitude;
        this.radiusLong = this.longitude;
        this.zoom = 8;
       
        // for (let i=1; i<50; i++) {
        //   this.markers.push(
        //     {
        //       lat: this.latitude+Math.random(),
        //       lng: this.longitude+Math.random(),
        //       label: `${i}`,
        //       draggable: false,
        //       content: `Content no ${i}`,
        //       isShown: false,
        //       icon:'./assets/marker.png'
        //     }
        //   );
        // }
      });
    }
  }

  clickedMarker(label: any, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  radiusDragEnd($event: any) {
    this.radiusLat = $event.coords.lat;
    this.radiusLong = $event.coords.lng;
    this.showHideMarkers();
  }

  event(type: any, $event: any) {
    this.radius = $event;
    this.showHideMarkers();
  }

  private showHideMarkers() {
    Object.values(this.markers).forEach(value => {
      value.isShown = this.getDistanceBetween(value.lat,value.lng, this.radiusLat, this.radiusLong);
    });
  }

  private getDistanceBetween(lat1: number, long1: number, lat2: number, long2: number) {
    var from = new google.maps.LatLng(lat1, long1);
    var to = new google.maps.LatLng(lat2, long2);

    return google.maps.geometry.spherical.computeDistanceBetween(from,to) <= this.radius;  
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}