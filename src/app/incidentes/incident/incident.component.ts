import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { User } from 'src/app/model/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Incident, IncidentType, RiskType } from 'src/app/model/incident';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { SessionStorageService } from 'src/app/core/session-storage-service';
import { finalize, first, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { from, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class IncidentComponent implements OnInit, OnDestroy {
  user?: User;
  form!: FormGroup;
  city: any;
  cities: any[] = [];
  selectedCity: any;
  filteredCities!: Observable<any[]>;
  incident?: Incident;
  isNewIncident = true;
  
  riskTypes: string[] = [];
  incidentTypes: string[] = [];
  
  RiskType = RiskType;
  IncidentType = IncidentType;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
    this.db.getCitiesJSON().subscribe(data => {
      this.cities = data;
    });

    for (let type of Object.values(RiskType)) {
      this.riskTypes.push(type);
    }
    for (let type of Object.values(IncidentType)) {
      this.incidentTypes.push(type);
    }

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
    from(this.db.putIncident({...this.form.value} as Incident)).pipe(
      first(),
      map(incident => this.router.navigate(['sendAlert', incident.uid]))
    ).subscribe();
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

    this.filteredCities = this.form.controls['location'].valueChanges.pipe(
      startWith(''), 
      map(value => this._filterCities(value))
    );

    this.form.controls['location'].valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (selectedValue) => {
        if (selectedValue != undefined && selectedValue.length > 0) {
          this.city = this.cities.filter(city => city['name'].toLowerCase() == selectedValue)[0];
        }
      }
    );
  }

  cityClick(event: any) {
    this.selectedCity = event.option.value;
  }

  checkCity() {
    if (this.selectedCity && this.selectedCity == this.form.controls['location'].value) {
      this.form.controls['location'].setErrors(null);
      this.form.controls['location'].setValue(this.selectedCity.trim());
    }
    else {
      this.form.controls['location'].setErrors({ 'incorrect': true });
    }
  }

  private _filterCities(value: string): string[] {
    const filterValue = value;
    let response = this.cities.filter(city => city['name'].includes(filterValue));
    return response;
  }

  back(): void {
    this.router.navigate(['incidents']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}