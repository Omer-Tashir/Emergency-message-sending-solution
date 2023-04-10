import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';

@Component({
  selector: 'app-send-alert',
  templateUrl: './send-alert.component.html',
  styleUrls: ['./send-alert.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class SendAlertComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
