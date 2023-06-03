import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { catchError, first, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { MatPaginator } from '@angular/material/paginator';
import { merge, Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router';

import { User } from '../model/user';
import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { StorageService } from '../core/session-storage-service';

import * as moment from "moment/moment";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class AdminComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  columns: string[] = ['uid', 'username', 'name', 'email'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);

  users?: User[];
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

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.getUsers(
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
        tap(data => this.users = data),
        tap(data => this.dataSource.data = data),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.cdref.detectChanges());
  }

  private getUsers(sort: string, order: SortDirection, page: number): Observable<User[]> {
    if (!this.storageService.getUsers()?.length) {
      return this.db.getUsers().pipe(
        first(),
        map(res => this.sortUsers(res, sort, order, page))
      );
    }
    else {
      return of(this.storageService.getUsers()).pipe(
        map(res => this.sortUsers(res, sort, order, page))
      );
    }
  }

  private sortUsers(users: User[], sort: string, order: SortDirection, page: number): User[] {
    switch (sort) {
      case 'uid':
        this.dataSource.data = users.sort(
          (a, b) => order === 'asc' ? a.uid.localeCompare(b.uid) : b.uid.localeCompare(a.uid)
        );
        break;

      case 'name':
        this.dataSource.data = users.sort(
          (a, b) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
        break;

      case 'email':
        this.dataSource.data = users.sort(
          (a, b) => order === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
        );
        break;

      case 'username':
        this.dataSource.data = users.sort(
          (a, b) => order === 'asc' ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username)
        );
        break;
    }

    return users;
  }

  openUser(uid: string): void {
    this.router.navigate(['user', uid]);
  }

  createNewUser(): void {
    this.router.navigate(['user', '']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

