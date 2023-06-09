// Angular Core Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe, CommonModule } from '@angular/common';
import { PapaParseModule } from 'ngx-papaparse';
import { ChartsModule } from 'ng2-charts';
import { CountUpModule } from 'ngx-countup';

// Angular Material Modules
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './core/custom.mat.paginator.intl';
import { CustomMaterialModule } from './core/material.module';

// Third party library modules
import { AgmCoreModule } from '@agm/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

// Swiper
import { SwiperModule } from "swiper/angular";

// Application modules
import { AppRoutingModule } from './app-routing.module';
import { AuthRoutingModule } from './auth/auth-routing.module';

// Main component
import { AppComponent } from './app.component';

// Pipes
import {
  DateFormatPipe,
  DateTimeFormatPipe,
  YearDateFormatPipe,
  TimeFormatPipe,
} from './core/date-formatter/date-formatter';
import { ArraySortPipe } from './core/sort.pipe';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';

// Core components
import { OkSnackComponent } from './core/alerts/ok-snack.component';
import { BadRequestSnackComponent } from './core/alerts/bad-request-snack.component';
import { HttpErrorSnackComponent } from './core/alerts/http-error-snack.component';
import { HttpDownSnackComponent } from './core/alerts/http-down-snack.component';
import { InvalidRequestSnackComponent } from './core/alerts/invalid-request-snack.component';
import { ConflictSnackComponent } from './core/alerts/conflict-snack.component';
import { NotFoundSnackComponent } from './core/alerts/not-found-snack.component';
import { WarningDialogComponent } from './core/warning-dialog/warning-dialog.component';

// Shared presentation components and supporting services
import { ToolbarComponent } from './core/toolbar/toolbar.component';
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { IncidentesComponent } from './incidentes/incidentes.component';
import { IncidentComponent } from './incidentes/incident/incident.component';
import { SendAlertComponent } from './send-alert/send-alert.component';
import { CrmComponent } from './crm/crm.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './admin/user/user.component';

const CUSTOM_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ToolbarComponent,
    WarningDialogComponent,
    InvalidRequestSnackComponent,
    ConflictSnackComponent,
    NotFoundSnackComponent,
    OkSnackComponent,
    BadRequestSnackComponent,
    HttpDownSnackComponent,
    HttpErrorSnackComponent,
    ArraySortPipe,
    DateFormatPipe,
    YearDateFormatPipe,
    DateTimeFormatPipe,
    TimeFormatPipe,
    ProfileComponent,
    IncidentesComponent,
    IncidentComponent,
    SendAlertComponent,
    CrmComponent,
    DashboardComponent,
    AdminComponent,
    UserComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    SwiperModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleApiKey
    }),
    NgxMaterialTimepickerModule,
    PapaParseModule,
    ChartsModule,
    CountUpModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AuthRoutingModule,
    AppRoutingModule,
  ],
  entryComponents: [
    OkSnackComponent,
    BadRequestSnackComponent,
    HttpDownSnackComponent,
    HttpErrorSnackComponent,
    InvalidRequestSnackComponent,
    ConflictSnackComponent,
    NotFoundSnackComponent,
    WarningDialogComponent,
  ],
  providers: [
    ArraySortPipe,
    DateFormatPipe,
    YearDateFormatPipe,
    DateTimeFormatPipe,
    TimeFormatPipe,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'he' },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT },
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
