import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { isLoggedInGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IncidentesComponent } from './incidentes/incidentes.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [isLoggedInGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [isLoggedInGuard] },
  { path: 'incidents', component: IncidentesComponent, canActivate: [isLoggedInGuard] },
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