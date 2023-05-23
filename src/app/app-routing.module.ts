import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { isLoggedInGuard } from './auth/auth.guard';
import { CrmComponent } from './crm/crm.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './admin/user/user.component';
import { ProfileComponent } from './profile/profile.component';
import { IncidentesComponent } from './incidentes/incidentes.component';
import { IncidentComponent } from './incidentes/incident/incident.component';
import { SendAlertComponent } from './send-alert/send-alert.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/incidents', pathMatch: 'full' },
  { path: 'crm', component: CrmComponent, canActivate: [isLoggedInGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [isLoggedInGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [isLoggedInGuard] },
  { path: 'incidents', component: IncidentesComponent, canActivate: [isLoggedInGuard] },
  { path: 'user/:uid', component: UserComponent, canActivate: [isLoggedInGuard] },
  { path: 'incident/:uid', component: IncidentComponent, canActivate: [isLoggedInGuard] },
  { path: 'sendAlert/:uid', component: SendAlertComponent, canActivate: [isLoggedInGuard] },
  { path: 'dashboard/:uid', component: DashboardComponent, canActivate: [isLoggedInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private router: Router, private authService: AuthService) {
    this.router.errorHandler = (error: any) => {
      this.authService.logout(error);
    };
  }
}