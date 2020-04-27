import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent, EventsComponent, LoginComponent, PageNotFoundComponent, OldTimelineComponent, TimelineComponent } from './components';
import { AuthGuard } from './guards';

const routes: Routes = [
  { path: '',        redirectTo: 'events', pathMatch: 'full' },
  { path: 'login',   component: LoginComponent },
  { path: 'events',  component: EventsComponent,  canActivate: [AuthGuard] },
  { path: 'oldtimeline',component: OldTimelineComponent,canActivate: [AuthGuard] },
  { path: 'timeline',component: TimelineComponent,canActivate: [AuthGuard] },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: '**',      component: PageNotFoundComponent }
// { path: 'signup', component: SignupComponent },
// { path: '**',      component: LoginComponent },
// { path: '', redirectTo: '/events', pathMatch: 'full' },
// { path: 'events',  component: MainComponent },
// { path: '', component: MainComponent },
// { path: 'account', component: AccountComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
