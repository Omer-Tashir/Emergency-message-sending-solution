import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { merge, Observable, of, Subject } from 'rxjs';
import { catchError, first, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { StorageService } from '../core/session-storage-service';
import { Incident } from '../model/incident';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';

import * as moment from "moment/moment";

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.component.html',
  styleUrls: ['./incidentes.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class IncidentesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  columns: string[] = ['uid', 'name', 'date'];
  dataSource: MatTableDataSource<Incident> = new MatTableDataSource<Incident>([]);

  days: string[] = [
    'ראשון',
    'שני',
    'שלישי',
    'רביעי',
    'חמישי',
    'שישי',
    'שבת'
  ];

  user?: User;
  incidents?: Incident[];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(
    private router: Router,
    private db: DatabaseService,
    private alertService: AlertService,
    private storageService: StorageService,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.storageService.getLoggedInUser();
  }

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.getIncidents(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
          ).pipe(catchError(() => of(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.length;
          return data;
        }),
        tap(data => this.incidents = data),
        tap(data => this.dataSource.data = data),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.cdref.detectChanges());
  }

  getDay(deliveryDate: string): string {
    return this.days[moment(deliveryDate).toDate().getDay()];
  }

  private getIncidents(sort: string, order: SortDirection, page: number): Observable<Incident[]> {
    if (!this.storageService.getIncidents()?.length) {
      return this.db.getIncidents().pipe(
        first(),
        map(res => this.sortIncidents(res, sort, order, page))
      );
    }
    else {
      return of(this.storageService.getIncidents()).pipe(
        map(res => this.sortIncidents(res, sort, order, page))
      );
    }
  }

  private sortIncidents(incidents: Incident[], sort: string, order: SortDirection, page: number): Incident[] {
    switch (sort) {
      case 'uid':
        this.dataSource.data = incidents.sort(
          (a, b) => order === 'asc' ? a.uid.localeCompare(b.uid) : b.uid.localeCompare(a.uid)
        );
        break;

      case 'date':
        this.dataSource.data = incidents.sort(
          (a, b) => order === 'asc' ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;

      case 'name':
        this.dataSource.data = incidents.sort(
          (a, b) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
        break;
    }

    return incidents;
  }

  openIncident(uid: string): void {
    this.router.navigate(['incident', uid]);
  }

  createNewIncident(): void {
    this.router.navigate(['crm']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
