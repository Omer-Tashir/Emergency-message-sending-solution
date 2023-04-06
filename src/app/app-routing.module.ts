import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { isLoggedInGuard } from './auth/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { WarningNotificationsComponent } from './warning-notifications/warning-notifications.component';
import { WarningNotificationsHistoryComponent } from './warning-notifications-history/warning-notifications-history.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, canActivate: [isLoggedInGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [isLoggedInGuard] },
  { path: 'home', component: HomeComponent, canActivate: [isLoggedInGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [isLoggedInGuard] },
  { path: 'warning-notifications', component: WarningNotificationsComponent, canActivate: [isLoggedInGuard] },
  { path: 'warning-notifications/history', component: WarningNotificationsHistoryComponent, canActivate: [isLoggedInGuard] },
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