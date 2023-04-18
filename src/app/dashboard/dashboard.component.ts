import { BaseChartDirective, Color, MultiDataSet, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { ChartOptions, ChartType } from 'chart.js';
import { Subject } from 'rxjs';

import { User } from '../model/user';
import { Incident } from '../model/incident';
import { MessageStatus, OutgoingMessage } from '../model/message';
import { StorageService } from '../core/session-storage-service';

import * as XLSX from 'xlsx'; 
import * as moment from 'moment/moment';
import { DatabaseService } from '../core/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  today: any;
  user?: User;
  incident?: Incident;
  isLoading = false;

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

  MessageStatus = MessageStatus;
  messagesColumns: string[] = ['toPhone', 'group', 'type', 'status', 'messageCount', 'lastMessageSendDate'];
  messagesDataSource!: MatTableDataSource<OutgoingMessage>;

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
    private storageService: StorageService,
    private db: DatabaseService,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.today = moment().format('LLLL');
    this.user = this.storageService.getLoggedInUser();
    const incidentUid = this.route.snapshot.paramMap.get('uid');
    if (incidentUid) {
      this.incident = this.storageService.getIncident(incidentUid);
    }

    this.loadStatuses();
    this.cdref.detectChanges();
  }

  private loadStatuses(): void {
    const statuses = this.storageService.getOutgoingMessageStatuses();
    this.messagesDataSource = new MatTableDataSource(statuses);
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
    this.chartData = [];
    this.chartData[0] = [this.pending, this.failed, this.declined, this.received];
    this.chartLabels = ['בתהליך', 'כישלון חיוג', 'דחיית שיחה', 'קבלת הודעה'];
    this.chartColors[0].backgroundColor = ['silver', 'orange', 'red', 'green'];
    this.isLoading = false;
    this.cdref.detectChanges();
  }

  complete(): void {
    this.storageService.removeItem('outgoingMessage');
    this.storageService.removeItem('outgoingMessageStatuses');
    this.storageService.removeItem('radiusLong');
    this.storageService.removeItem('radiusLat');
    this.storageService.removeItem('tripsInRadius');

    this.db.removeIncident(this.incident);
    this.router.navigate(['incidents']).then(() => window.location.reload());
  }

  newMessage(): void {
    this.router.navigate(['sendAlert', this.route.snapshot.paramMap.get('uid')]);
  }

  report(): void {
    const fileName = `סטטוס קבלת הודעות - ${this.today}.xlsx`; 
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'סטטוס קבלת הודעות');

    /* save to file */
    XLSX.writeFile(wb, fileName);
  }

  resend(): void {
    this.sendMessageSimulatorStart();
    this.cdref.detectChanges();
  }

  private sendMessageSimulatorStart(): void {
    let timeoutArr = [];
    let statuses = this.storageService.getOutgoingMessageStatuses();
    
    this.isLoading = true;
    this.cdref.detectChanges();

    for (let message of statuses.filter(s => s.status !== MessageStatus.APPROVED)) {
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
      this.storageService.setItem('outgoingMessageStatuses', JSON.stringify(statuses));
      this.loadStatuses();
    }, Math.max(...timeoutArr));
  }

  private randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
