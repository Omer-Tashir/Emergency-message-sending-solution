import { BaseChartDirective, Color, MultiDataSet, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { PapaParseService } from 'ngx-papaparse';
import { ChartOptions, ChartType } from 'chart.js';
import { Subject } from 'rxjs';

import { User } from '../model/user';
import { Incident } from '../model/incident';
import { MessageStatus } from '../model/message';
import { DatabaseService } from '../core/database.service';
import { StorageService } from '../core/session-storage-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  user?: User;
  incident?: Incident;

  countUpOptions = {
    duration: 1,
    decimalPlaces: 0,
    useGrouping: true,
    useEasing: true
  }

  contacts: number = 0;
  pending: number = 0;
  failed: number = 0;
  declined: number = 0;
  received: number = 0;
  successRate: number = 0;

  chartLabels: any[] = [];
  chartData: MultiDataSet = [[]];
  chartType: ChartType = 'pie';
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      bodyFontSize: 14,
      titleFontSize: 14,
      footerFontFamily: '"Lato", sans-serif',
      bodyFontFamily: '"Lato", sans-serif',
      titleFontFamily: '"Lato", sans-serif',
      displayColors: false,
      callbacks: {
        title: (tooltipItem: any, data: any) => {
          return "" + data.labels[tooltipItem[0].index];
        },
        label: (tooltipItem: any, data: any) => {
          return data.datasets[0].data[tooltipItem.index];
        }
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      align: 'end',
      labels: {
        padding: 18,
        boxWidth: 14,
        fontSize: 14,
        fontColor: '#95949A',
        fontFamily: '"Lato", sans-serif'
      },
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: '#000000',
        font: {
          family: '"Lato", sans-serif',
          size: 14
        }
      }
    },
    layout: {
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  };

  chartPlugins: PluginServiceGlobalRegistrationAndOptions[] = [{}];
  chartColors: Color[] = [{ backgroundColor: [] }];
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private papa: PapaParseService,
    private firestore: AngularFirestore,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.storageService.getLoggedInUser();
    const incidentUid = this.route.snapshot.paramMap.get('uid');
    if (incidentUid) {
      this.incident = this.storageService.getIncident(incidentUid);
    }

    this.loadStatuses();
  }

  private loadStatuses(): void {
    const statuses = this.storageService.getOutgoingMessageStatuses();
    this.contacts = statuses.reduce((count, status) => count += 1, 0);

    this.pending = statuses.reduce((count, status) => {
      if (status.status === MessageStatus.PENDING) {
        count += 1;
      }
      return count;
    }, 0);

    this.failed = statuses.reduce((count, status) => {
      if (status.status === MessageStatus.FAILURE) {
        count += 1;
      }
      return count;
    }, 0);

    this.declined = statuses.reduce((count, status) => {
      if (status.status === MessageStatus.DECLINED) {
        count += 1;
      }
      return count;
    }, 0);

    this.received = statuses.reduce((count, status) => {
      if (status.status === MessageStatus.APPROVED) {
        count += 1;
      }
      return count;
    }, 0);

    this.successRate = (this.received * 100) / this.contacts;

    this.chartData[0] = [this.pending, this.failed, this.declined, this.received];
    this.chartLabels = ['בתהליך', 'כישלון חיוג', 'דחיית שיחה', 'קבלת הודעה'];
    this.chartColors[0].backgroundColor = ['silver', 'orange', 'red', 'green'];
  }

  complete(): void {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
