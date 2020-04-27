import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ConnectionService } from 'ng-connection-service';

// Declare ga function as ambient
declare var ga:Function;

@Component({
  selector: 'app-root',
  template: `
    <mat-card class="app-text-center" *ngIf="!isConnected" style="color:#b71c1c"><b>OFFLINE</b>. Please check your Internet connection.</mat-card>
    <div [ngStyle]="{'opacity':isConnected?'1.0':'0.5'}">
      <router-outlet></router-outlet>
    </div>
  `
})


// Tracking with Google Analytics
// http://stackoverflow.com/questions/37655898/tracking-google-analytics-page-views-in-angular2
export class AppComponent {
    private currentRoute: string;
    isConnected = true;

    constructor(_router:Router,
                _location:Location,
                private connectionService: ConnectionService) {
        _router.events.subscribe((event:NavigationEvent) => {
            // Send GA tracking on NavigationEnd event. You may wish to add other
            // logic here too or change which event to work with
            if (event instanceof NavigationEnd) {
                // When the route is '/', location.path actually returns ''.
                let newRoute = _location.path() || '/';
                // If the route has changed, send the new route to analytics.
                if (this.currentRoute != newRoute) {
                    ga('send', 'pageview', newRoute);
                    this.currentRoute = newRoute;
                }
            }
        });

        // https://medium.com/@balramchavan/detecting-internet-connection-status-in-angular-application-ng-connection-service-1fa8add3b975
        this.connectionService.monitor().subscribe(isConnected => {
            this.isConnected = isConnected;
            console.log("STATUS: " + (isConnected ? "ONLINE" : "OFFLINE"));
            // if (isConnected) {
            //   _router.navigate(['/events']);
            //   console.log("Route: " + this.currentRoute);
            //   _router.navigate([this.currentRoute]);
            // }
        })
    }
}

//export class AppComponent {
//  title = 'tinyCam Cloud (Beta)';
//}
