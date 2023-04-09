import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { Observable, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WarningNotification } from '../model/warning-notification';
import { WarningNotificationType } from '../model/warning-notification-type';

@Component({
  selector: 'app-warning-notifications-history',
  templateUrl: './warning-notifications-history.component.html',
  styleUrls: ['./warning-notifications-history.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class WarningNotificationsHistoryComponent implements OnInit, AfterViewInit, OnDestroy {

  private refresh$ = new Subject<{}>();
  private destroy$ = new Subject<void>();

  warningNotifications$!: Observable<any>;

  displayedColumns: string[] = ['user_id', 'identify_date', 'warning_type', 'warning_message'];
  dataSource: MatTableDataSource<WarningNotification> = new MatTableDataSource<WarningNotification>([]);

  warningNotificationTypes: WarningNotificationType[] = [];

  sort!: MatSort;
  paginator!: MatPaginator;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
      this.setDataSourceAttributes();
  }

  constructor(
    private cdref: ChangeDetectorRef
  ) { }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getWarningType(warning_id: string): string {
    const warning = this.warningNotificationTypes.find(w => w.warning_id == warning_id);
    if (warning) {
      return `<code class="warning_type">${warning.warning_type}</code>`;
    }

    return warning_id;
  }

  getWarningMessage(warning_id: string): string {
    const warning = this.warningNotificationTypes.find(w => w.warning_id == warning_id);
    if (warning) {
      return `<code class="warning_text">${warning.warning_text}</code>`;
    }

    return warning_id;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a: WarningNotification, b: WarningNotification) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'identify_date': return this.compare(a.identify_date, b.identify_date, isAsc);
        case 'warning_id': return this.compare(a.warning_id, b.warning_id, isAsc);
        case 'warning_type': return this.compare(this.getWarningType(a.warning_id), this.getWarningType(b.warning_id), isAsc);
        case 'warning_message': return this.compare(this.getWarningMessage(a.warning_id), this.getWarningMessage(b.warning_id), isAsc);
        case 'user_id': return this.compare(a.user_id, b.user_id, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  ngOnInit() {
    // this.warningNotifications$ = this.refresh$.pipe(
    //   switchMap(() => this.dataService.getWarningNotifications()),
    //   tap(warnings => this.dataSource.data = warnings),
    //   tap(() => this.sortData({ active: 'id', direction: 'asc' })),
    //   switchMap(() => this.dataService.getWarningNotificationTypes()),
    //   tap(types => this.warningNotificationTypes = types),
    //   takeUntil(this.destroy$),
    //   finalize(() => this.cdref.detectChanges())
    // );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.refresh$.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();

    this.refresh$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refresh$.complete();
  }
}