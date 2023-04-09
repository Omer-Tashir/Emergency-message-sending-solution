import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation(),
    trigger('fadeInUpAllAnimation', [
      transition(':enter', [
        query('@*', stagger(100, animateChild()), { optional: true })
      ])
    ]),
    trigger('item', [
      state('void', style({ opacity: 0, transform: 'translateY(-5%)' })),
      transition(':enter', [
        animate(`.7s ease`, style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
    ])
  ]
})
export class DashboardComponent implements OnInit {
  dataStartDate!: Date;
  dataEndDate!: Date;
  dateRange: FormGroup = new FormGroup({
    start: new FormControl(moment()),
    end: new FormControl(moment()),
  });

  constructor(
  ) { }

  ngOnInit(): void {
    // this.dataService.getLatestDataDate().subscribe(d => {
    //   const date = Object.values(d[0]).map((value: any) => value)[0];
    //   this.dateRange.controls['end'].setValue(moment(date));
    //   this.dateRange.controls['start'].setValue(moment(date).subtract(1, 'month'));
      
    //   this.dataStartDate = this.dateRange.get('start')?.value.toDate();
    //   this.dataEndDate = this.dateRange.get('end')?.value.toDate();
  
    //   this.dataService.getSuspiciousUsers(
    //       moment(this.dataStartDate).format('YYYY-MM-DD'),
    //       moment(this.dataEndDate).format('YYYY-MM-DD'))
    //     .subscribe();
    // });
  }

  @HostBinding('@fadeInUpAllAnimation')
  get hostAnimation() {
    return true;
  }
}
