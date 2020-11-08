import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LoginService } from '../services';

@Component({
    // animations: [animateFactory(150, 0, 'ease-in')],
    styles: [ `
      .subscribe-ok {
        color: white;
        background-color: #0d47a1;
      }
      .my-button {
        margin: 5px;
      }
    `],
    template: `
      <header [selected]="2"></header>
      <mat-card *ngIf="justSubscribed == 1" class="app-text-center subscribe-ok">
        <mat-card-content><i class="fas fa-check fa-lg" style="padding-right:15px;"></i>You have just successfully subscribed. Thank you!</mat-card-content>
      </mat-card>
      <mat-card *ngIf="justSubscribed == -1" class="app-text-center app-card-warning">
        <mat-card-content><i class="fas fa-exclamation-triangle fa-lg" style="padding-right:15px;"></i>Subscription failed!</mat-card-content>
      </mat-card>
      <h2 class="mat-h2" style="padding-top:20px">Account information</h2>
      <mat-card>
        <mat-card-content>
        <div class="app-row">
          <div class="app-column" style="width:80%;height:100%">
            Username: <span style="font-weight: bold; padding-right: 5px;">{{login.username}}</span>
          </div>
          <div class="app-column app-text-right" style="width:20%">
            <a class="my-button" mat-raised-button href="password_reset.html?login={{login.username}}"><i class="fas fa-key fa-lg"></i></a>
          </div>
        </div>
        </mat-card-content>
      </mat-card>
      <account-cam-list [customPlanId]="customPlanId"></account-cam-list>
    `
})

export class AccountComponent {

    login = this.loginService.login;
    justSubscribed = 0; // 0 - n/a, 1 - success, -1 - failed
    customPlanId = -1;

    constructor(
        private activatedRoute: ActivatedRoute,
        private loginService: LoginService) {
    }

    // /account?subscription=success
    // /account?subscription=failed
    ngOnInit() {
        // console.log('account initialized');
        // subscribe to router event
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            // Show message if subscription succeeded or failed
            let status = params['subscription'];
            if (status) {
                switch (status) {
                    case 'success': this.justSubscribed = 1; break;
                    case 'failed': this.justSubscribed = -1; break;
                }
                console.log('subscription=' + status);
            }

            let planId = params['planId'];
            if (planId) {
                this.customPlanId = planId;
                console.log('planId=' + planId);
            }
        });
    }

}
