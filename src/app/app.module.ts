import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { RouterModule, Routes } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MomentModule } from 'ngx-moment';

import { AppComponent } from './app.component';
import {
    AccountComponent,
    AccountCamListComponent,
    ArchiveListComponent,
    ArchiveTimelineComponent,
    CamDelDialogComponent,
    CamEditDialogComponent,
    CamEditMaskDialogComponent,
    CamListSelectionComponent,
    EventCamListComponent,
    EventsComponent,
    EventListComponent,
    EventComponent,
    HeaderComponent,
    LoginComponent,
    LiveDialogComponent,
    OldTimelineComponent,
    OldTimelineCamListComponent,
    PageNotFoundComponent,
    ProbeComponent,
    TimelineCamListComponent,
    TimelineComponent,
    VideoDialogComponent,
} from './components';
import {
    LowerCaseDirective,
} from './directives';
import {
    ArchiveListService,
    CamAddService,
    CamDelService,
    CamEditService,
    CamListService,
    CamTestService,
    EventListService,
    ExtCamListService,
    ExtCamLoginService,
    FileGetTokenService,
    LoginService,
    MainUserGetService,
    UserGetService,
    PaymentSubscribeService,
    PublicAddressService,
    WindowRefService
} from './services';
import { AuthGuard } from './guards';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    // Components
    AppComponent,
    AccountComponent,
    AccountCamListComponent,
    ArchiveListComponent,
    ArchiveTimelineComponent,
    CamDelDialogComponent,
    CamListSelectionComponent,
    CamEditDialogComponent,
    CamEditMaskDialogComponent,
    EventCamListComponent,
    EventListComponent,
    EventComponent,
    EventsComponent,
    HeaderComponent,
    LoginComponent,
    LiveDialogComponent,
    OldTimelineComponent,
    OldTimelineCamListComponent,
    PageNotFoundComponent,
    ProbeComponent,
    TimelineCamListComponent,
    TimelineComponent,
    VideoDialogComponent,
    // Directives
    LowerCaseDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    InfiniteScrollModule,
    HttpClientModule,
    AppRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
    MomentModule,
    FormsModule
    // VgCoreModule,
    // VgControlsModule,
    // VgOverlayPlayModule,
    // VgBufferingModule,
    // VgStreamingModule
  ],
  providers: [
    AuthGuard,
    ArchiveListService,
    CamAddService,
    CamDelService,
    CamEditService,
    CamListService,
    CamTestService,
    EventListService,
    ExtCamListService,
    ExtCamLoginService,
    FileGetTokenService,
    LoginService,
    MainUserGetService,
    UserGetService,
    PaymentSubscribeService,
    PublicAddressService,
    WindowRefService,
  ],
  entryComponents: [
    CamDelDialogComponent,
    CamEditDialogComponent,
    CamEditMaskDialogComponent,
    LiveDialogComponent,
    VideoDialogComponent,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
