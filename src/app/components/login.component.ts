import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Server } from '../models';
import { LoginService, MainUserGetService } from '../services';
import { LowerCaseDirective } from '../directives';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
// import { ErrorStateMatcher } from '@angular/material/core';
// import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
// import { FormControl, Validators } from '@angular/forms';

/** Error when invalid control is dirty, touched, or submitted. */
// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//     const isSubmitted = form && form.submitted;
//     return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
//   }
// }

@Component({
  selector: 'login',
  styles: [ `
    .login-form {
      padding: 20px;
    }
    .login-screen {
      padding-top: 50px;
      margin: 0 auto;
      max-width: 400px;
    }
    .login-button {
      margin: 10px 0px;
      padding: 5px 40px;
      text-transform: uppercase;
      font-weight: normal;
      letter-spacing: .03em;
    }
    .login-full-width {
      width: 100%;
    }
  `],
  template: `
    <div class="login-screen">
      <div class="app-text-center"><img src="assets/img/app_logo.png"/></div>
      <h3 class="app-text-center mat-display-1">tinyCam Cloud Login</h3>
      <mat-card>
        <mat-card-content>
          <form (ngSubmit)="doLogin()" #loginForm="ngForm" class="login-form">

            <mat-form-field class="login-full-width">
              <input
                matInput
                required
                lowerCase
                type="text"
                placeholder="Username"
                [(ngModel)]="login.username" name="Username">
            </mat-form-field>

            <mat-form-field class="login-full-width" style="padding-top:10px;">
              <input
                matInput
                required
                type="password"
                placeholder="Password"
                [(ngModel)]="login.password" name="Password">
            </mat-form-field>

            <div class="app-text-center">
              <button type="submit" [disabled]="!loginForm.form.valid" mat-raised-button color="accent" class="login-button">LOGIN</button>
              <mat-card *ngIf="error" class="app-card-warning" style="padding: 30px;">
                <mat-card-content>Failed to login. Want to <a href="password_reset.html">reset</a> password?</mat-card-content>
              </mat-card>
              <div class="app-text-right" style="padding-top:30px">
                Want to try our demo? &nbsp; <button mat-raised-button (click)="doLoginDemo()">DEMO</button>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      <div style="padding-top: 40px; padding-bottom: 10px">
        <a href="./">tinyCam Cloud</a> is 24/7 video recording and motion detection service for your H.264 IP camera.<br/>
      </div>
      <div class="app-text-right" style="padding-bottom: 30px">
        Not yet registered? &nbsp; <a mat-raised-button href="register.html">REGISTER</a>
      </div>
    </div>
  `,
})

export class LoginComponent implements OnInit {

    login = this.loginService.login;
    error = false;

    // loginFormControl = new FormControl('', [
    //     Validators.required,
    //     Validators.email,
    //   ]);

    // matcher = new MyErrorStateMatcher();

    constructor(
        private router: Router,
        private loginService: LoginService,
        private mainUserGetService: MainUserGetService) {
    }

    ngOnInit() {
    //   var login = JSON.parse(localStorage.getItem('login'));
    //   if (login != null && login.user != null && login.hash != null) {
    //       console.log('Found previous login. Skipping login screen.');
    //       this.loginService.login.username     = login.user;
    //       this.loginService.login.passwordHash = login.hash;
    //       // Send HTTP request
    //       this.mainUserGetService.getMainUser(this.loginService.login)
    //           .then(
    //               server => {
    //               this.processMainServer(server);}
    //           );
    //   }
    }

    processMainServer(server: Server) {
        console.log('Server: ' + server.server_addr);
        this.loginService.server = server;
        this.loginService.login.succeeded = true;
        // console.log('Pwd: ' + this.loginService.login.password);

        // Save credentials to database
        localStorage.setItem(
            'login',
            JSON.stringify({ user: this.loginService.login.getUsername(), hash: this.loginService.login.getPasswordHash() }));
        // Save server to database
        localStorage.setItem(
            'server',
            JSON.stringify({ server: this.loginService.server.server_addr, name: this.loginService.server.server_name }));

        this.router.navigate(['/events']);
    }

    doLoginDemo() {
        this.login.username = "demo";
        this.login.password = "demo";
    }

    doLogin() {
        console.log('Trying to login...');
        this.error = false;
        this.loginService.login.username = this.loginService.login.username.trim();
        this.loginService.login.updatePasswordHash();
        //console.log('Hash: ' + this.loginService.login.getPasswordHash());

        // Send HTTP request
        this.mainUserGetService.getMainUser(this.loginService.login)
            .then(
                server => { this.processMainServer(server); },
                error => { this.error = true; })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('Failed to login.', error);
        return Promise.reject(error.message || error);
    }

  // login(event, username, password) {
  //   event.preventDefault();
  //   let body = JSON.stringify({ username, password });
  //   // this.http.post('http://localhost:3001/sessions/create', body, { headers: contentHeaders })
  //   //   .subscribe(
  //   //     response => {
  //   //       localStorage.setItem('id_token', response.json().id_token);
  //   //       this.router.navigate(['home']);
  //   //     },
  //   //     error => {
  //   //       alert(error.text());
  //   //       console.log(error.text());
  //   //     }
  //   //   );
  // }

    signup(event) {
        event.preventDefault();
        this.router.navigate(['signup']);
    }
}
