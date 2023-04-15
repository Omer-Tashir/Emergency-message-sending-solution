import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Subject } from 'rxjs';
import { DatabaseService } from '../core/database.service';
import { SessionStorageService } from '../core/session-storage-service';
import { User } from '../model/user';

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
  animations: [fadeInOnEnterAnimation()]
})
export class CrmComponent implements OnInit, OnDestroy {
  user?: User;
  fileUploaded = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private sessionStorageService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorageService.getLoggedInUser();
  }

  back(): void {
    this.router.navigate(['incidents']);
  }

  submit(): void {
    // if (this.hasChanges || this.isNewIncident) {
    //   from(this.db.putIncident({...this.form.value} as Incident)).pipe(
    //     first(),
    //     map(incident => this.router.navigate(['sendAlert', incident.uid]))
    //   ).subscribe();
    // }
    // else if (this.incident?.uid) {
    //   this.router.navigate(['sendAlert', this.incident.uid]);
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
