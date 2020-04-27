import { Component } from '@angular/core';
import { LoginService, MainUserGetService } from '../services';

@Component({
  template: `
    <header [selected]="1"></header>
    <oldtimeline-cam-list></oldtimeline-cam-list>
  `
})

export class OldTimelineComponent {

    constructor (
        private loginService: LoginService,
        private mainUserGetService: MainUserGetService) {
    }

}
