import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { User } from 'src/app/model/user';
import { MapsAPILoader } from '@agm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Incident, IncidentType, RiskType } from 'src/app/model/incident';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { StorageService } from 'src/app/core/session-storage-service';
import { finalize, first, map, takeUntil, tap } from 'rxjs/operators';
import { Marker } from 'src/app/model/google-maps';
import { Trip } from 'src/app/model/trip';
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

  trips: Trip[] = [];
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

  labelOptions = {
    color: 'black',
    fontFamily: '',
    fontSize: '14px',
    fontWeight: 'bold',
    className: 'marker-label'
  } as google.maps.MarkerLabel;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private mapsAPILoader: MapsAPILoader,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.storageService.getLoggedInUser();
    this.trips = this.storageService.getTrips();

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
      this.db.isIncidentExist(incidentUid).then(exist => {
        this.isNewIncident = !exist;
        console.log('isNewIncident: ' + this.isNewIncident);
      });

      if (!this.storageService.getIncidents()?.length) {
        this.db.getIncidents().pipe(
          first(),
          map(incidents => incidents.find(i => i.uid === incidentUid)),
          tap(incident => this.incident = incident),
          finalize(() => this.initForm())
        ).subscribe();
      }
      else {
        this.incident = this.storageService.getIncident(incidentUid);
        this.initForm();
      }
    }
    else {
      this.initForm();
    }
  }

  submit(): void {
    const trips = this.getTripsInRadius();
    this.storageService.setItem('tripsInRadius', JSON.stringify(trips));

    if (this.hasChanges || this.isNewIncident) {
      from(this.db.putIncident({...this.form.value} as Incident, this.isNewIncident)).pipe(
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

  private getTripsInRadius(): Trip[] {
    const trips: Trip[] = [];
    Object.values(this.markers).forEach(marker => {
      if (marker.isShown) {
        const trip = this.trips.find(t => t.name === marker.label.text);
        if (trip) {
          trips.push(trip);
        }
      }
    });
    return trips;
  }

  private initForm() {
    this.form = new FormGroup({
      uid: new FormControl(this.incident?.uid ?? ''),
      name: new FormControl(this.incident?.name ?? '', [Validators.required]),
      date: new FormControl(this.incident?.date ?? new Date(), [Validators.required]),
      risk: new FormControl(this.incident?.risk ?? '', [Validators.required]),
      type: new FormControl(this.incident?.type ?? '', [Validators.required]),
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
       
        for (let trip of this.trips) {
          this.markers.push(
            {
              lat: trip.currentLocation.latitude,
              lng: trip.currentLocation.longitude,
              label: {...this.labelOptions, text: trip.name},
              draggable: false,
              content: `
                <h3>${trip.name}</h3>
                <hr>
                <br>
                <p>מדריך: ${trip.tutor.firstname} ${trip.tutor.lastname}</p>
                <p>מספר מטיילים: ${trip.groupSize}</p>
              `,
              isShown: false,
              icon:'./assets/marker.png'
            }
          );
        }

        if (this.storageService.getItem('radius')) {
          this.radius = Number(this.storageService.getItem('radius'));
        }

        if (this.storageService.getItem('radiusLat')) {
          this.radiusLat = Number(this.storageService.getItem('radiusLat'));
        }

        if (this.storageService.getItem('radiusLong')) {
          this.radiusLong = Number(this.storageService.getItem('radiusLong'));
        }
      });
    }
  }

  radiusDragEnd($event: any) {
    this.radiusLat = $event.coords.lat;
    this.radiusLong = $event.coords.lng;
    this.storageService.setItem('radiusLat', ''+this.radiusLat);
    this.storageService.setItem('radiusLong', ''+this.radiusLong);
    this.showHideMarkers();
  }

  event(type: any, $event: any) {
    this.radius = $event;
    this.storageService.setItem('radius', ''+this.radius);
    this.showHideMarkers();
  }

  private showHideMarkers() {
    Object.values(this.markers).forEach(value => {
      value.isShown = this.getDistanceBetween(value.lat, value.lng, this.radiusLat, this.radiusLong);
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