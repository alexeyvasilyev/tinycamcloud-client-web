import { Component, OnInit } from '@angular/core';
import { EventCamListComponent } from './event-cam-list.component';
import { LoginService, MainUserGetService, CamListService } from '../services';

@Component({
  styles: [ `
    .login-input {
      max-width: 300px;
    }
  `],
  template: `
    <header [selected]="0"></header>
    <event-cam-list></event-cam-list>
  `
})

export class EventsComponent implements OnInit {

    login = this.loginService.login;

    constructor (
        private loginService: LoginService,
        private mainUserGetService: MainUserGetService) {
    }

    ngOnInit() {
    }

}
