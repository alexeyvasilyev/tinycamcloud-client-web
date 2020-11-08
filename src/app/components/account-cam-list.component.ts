import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CameraSettings, ServerResponse } from '../models';
import { UserGetService, CamListService, CamTestService, LoginService, PaymentSubscribeService, PublicAddressService, WindowRefService } from '../services';
import { CamEditDialogComponent } from './cam-edit-dialog.component';
import { CamDelDialogComponent } from './cam-del-dialog.component';
import JsonUtils from '../jsonutils';

// ------------------------------------------------------------------------------------------------
// | Name  | Plan    | Payment      | Payment Information      | Actions
// ------------------------------------------------------------------------------------------------
// | Cam 1 |         | NoPayment    |                          | Subscribe
// ------------------------------------------------------------------------------------------------
// | Cam 3 | 30 Days | Active       | Next billing: dd/mm/YYYY | Cancel subscription
// ------------------------------------------------------------------------------------------------
// | Cam 4 | 30 Days | Failed       | Next retry: dd/mm/YYYY   | Cancel subscription
// ------------------------------------------------------------------------------------------------
// | Cam 5 | 30 Days | Canceled     | Active till: dd/mm/YY    |
// ------------------------------------------------------------------------------------------------
// | Cam 5 | 30 Days | Suspended    |                          | Re-Activate
// ------------------------------------------------------------------------------------------------
// | Cam 6 | 30 Days | Error        | Error details            | Contact Admin
// ------------------------------------------------------------------------------------------------
// |       | 30 Days | Active       | Next payment: dd/mm/YYYY | Cancel subscription
// ------------------------------------------------------------------------------------------------
@Component({
  selector: 'account-cam-list',
  styles: [ `
    .camlist-error {
      margin-top: 50px;
    }
    .test-image {
      width: 300px;
      height: 200px;
      background: #616161;
    }
    .img {
    }
    .img:hover {
      cursor: pointer;
    }
    .my-button {
      margin: 5px;
    }
    .my-card {
      margin-bottom: 20px;
    }
`],
  template: `
    <div>
      <div *ngIf="camerasLoaded; else loading_content">
        <mat-card *ngIf="errorMessage != null" class="app-text-center app-card-warning camlist-error">
          {{this.errorMessage}}
        </mat-card>
        <div *ngIf="!processing">
          <h2 class="mat-h2" style="padding-top: 50px">Cameras added</h2>
          <div *ngIf="cameras.length > 0; else no_cams_content" >
            <mat-card *ngIf="isSpecialPriceMessageAvailable()" class="my-card">
              <mat-card-content>HINT: Have many cameras? <b><a href="mailto:info@masimba.eu?subject=tinyCam Cloud special price">Contact us</a></b> to get a special price.</mat-card-content>
            </mat-card>
            <mat-card *ngIf="cameras.length > 1" class="my-card">
              <mat-card-content>Total bandwidth use: {{getTotalBandwidthUseKB()}} KiB/sec</mat-card-content>
            </mat-card>

            <mat-card *ngFor="let camera of cameras; let i = index" class="my-card">
            <mat-card-content>
              <div style="padding:10px">
                <div style="color:#424242;font-weight:bold;">{{i+1}}.
                  <span *ngIf="camera.cam_enabled">{{getCameraText(camera)}}</span>
                  <span *ngIf="!camera.cam_enabled">{{getCameraText(camera)}}</span>
                </div>

                <!-- <span class="">State: {{camera.state}}</span><br/> -->
                <div style="padding-top:10px" class="app-text-dark-secondary">{{getCameraDescription(camera)}}</div>
                <div *ngIf="camera.state != 'NoCam'">{{camera.info}}</div>
                <mat-card *ngIf="isInError(camera)" class="app-card-warning" style="margin-top:10px">
                  <mat-card-content><i class="fas fa-exclamation-triangle" style="padding-right:10px;"></i>Camera "{{camera.cam_name}}" error: <br/>{{getHumanReadableError(camera)}}</mat-card-content>
                </mat-card>
              </div>

              <div class="app-row" *ngIf="camera.state != 'NoCam'">
                <div class="app-column" style="width:80%">
                  <div *ngIf="camera.cam_storage_use > 0" class="app-text-dark-secondary" style="padding-top: 10px">Storage use: {{camera.cam_storage_use}} GiB</div>
                  <div *ngIf="camera.cam_bandwidth_use > 0" class="app-text-dark-secondary">Bandwidth use: {{camera.cam_bandwidth_use}} KiB/sec</div>
                  <mat-card *ngIf="camera.cam_bandwidth_use > 510" class="app-card-warning" style="margin-top:10px">
                    <mat-card-content><i class="fas fa-exclamation-triangle"></i> High camera bandwidth use! Please decrease bandwidth use to less than 500 KiB/sec by selecting sub-stream or decreasing bitrate of the camera. Otherwise some video can be missed.</mat-card-content>
                  </mat-card>
                  <div style="padding-top:20px;" class="app-text-dark-secondary">{{this.testMessages[i]}}</div>
                  <probe class="img"
                      [imageUrl]="this.testImageUrls[i]"
                      [probing]="this.testings[i]"
                      (click)="onTestClicked(i)"></probe>
                </div>

                <div class="app-column" style="text-align:right;width:20%" *ngIf="camera.state != 'NoCam'">
                  <button
                      mat-raised-button
                      class="my-button"
                      (click)="onEditClicked(i)"><i class="fas fa-cog fa-lg"></i></button>
                  <button
                      mat-raised-button
                      class="my-button"
                      (click)="onDeleteClicked(i)"><i class="fas fa-trash fa-lg"></i></button>
                  <div *ngIf="demoAvailable &amp;&amp; isDemoAvailable(i)">
                    <button
                        mat-raised-button
                        color="accent"
                        class="my-button"
                        (click)="onDemoClicked(i)">Free 7 Days Demo</button>
                  </div>
                  <div *ngIf="customPlanId == -1">
                    <button
                        mat-raised-button
                        color="accent"
                        class="my-button"
                        (click)="onClicked(i)">{{getButtonText(i)}}</button><br/><span class="app-text-dark-secondary">{{getButtonDescription(i)}}</span>
                  </div>
                  <div *ngIf="customPlanId != -1">
                    <button
                        mat-raised-button
                        color="accent"
                        class="my-button"
                        (click)="onCustomClicked(i)">Subscribe via PayPal</button><br/><span class="app-text-dark-secondary">Custom subscription plan</span>
                  </div>
                </div>
              </div>

              <div *ngIf="camera.state == 'NoCam'" style="padding:10px">
                <i class="fas fa-exclamation-circle fa-lg" style="color:#2196F3;padding-right:10px;"></i> <span class="app-text-dark">{{camera.info}}</span>
              </div>
              </mat-card-content>
            </mat-card>

          </div>
          <p>
            <button
                *ngIf="cameras.length < 100"
                mat-raised-button
                color="accent"
                (click)="onAddClicked()"><i class="fas fa-plus"></i> Add camera</button>
          </p>
          <div style="padding-top:20px;padding-bottom:30px;">
             NOTE: You can <b>cancel subscription</b> any time you want via your PayPal account. Check <a href="https://www.paypal.com/us/smarthelp/article/how-do-i-cancel-a-billing-agreement,-automatic-recurring-payment-or-subscription-on-paypal-faq2254">this FAQ</a> how to do that.
          </div>
        </div>
        <div *ngIf="processing">
          <div class="app-text-center" style="margin: 30px;">
            <i class="fas fa-circle-notch fa-spin fa-5x fa-fw"></i>
          </div>
          <div class="app-text-center">Secure processing. Please wait...</div>
        </div>
      </div>
    </div>

    <ng-template #loading_content><br/><mat-card>Loading cameras list...</mat-card></ng-template>
    <ng-template #no_cams_content><mat-card style="margin-bottom:30px;">No cameras added. Please add cameras here or via <a href="https://tinycammonitor.com/">tinyCam Monitor</a> Android app.</mat-card></ng-template>
  `
})

export class AccountCamListComponent implements OnInit {

    cameras: CameraSettings[] = [];
    testMessages: string[] = [];
    testImageUrls: string[] = [];
    testings: boolean[] = [];
    camerasLoaded = false;
    errorMessage: string = null;
    processing: boolean = false;
    demoAvailable: boolean = true;
    private snackBarDurationInSec = 4;
    @Input() customPlanId: number;

    // config: MatDialogConfig = {
        // minWidth: '100',
        // disableClose: false,
        // hasBackdrop: false,
        // backdropClass: '',
        // width: '90%',
        // height: '90%',
        // position: {
        //   top: '',
        //   bottom: '',
        //   left: '',
        //   right: ''
        // },
        // data: {
        //   message: 'Jazzy jazz jazz'
        // }
    // };

    constructor(
        private windowRef: WindowRefService,
        private userGetService: UserGetService,
        private loginService: LoginService,
        private camListService: CamListService,
        private camTestService: CamTestService,
        private publicAddressService: PublicAddressService,
        private paymentSubscribeService: PaymentSubscribeService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) {
    }

    ngOnInit() {
        // console.log('account-cam-list initialized');
        this.userGetService
            .getUser(this.loginService.server, this.loginService.login)
            .then(res => { this.processUser(res); });
        this.loadCameras();
    }

    loadCameras() {
        this.camListService
            .getCamList(this.loginService.server, this.loginService.login, true)
            .then(
                res  => { this.processCamList(res); },
                error => { this.processCamListError(error); });
    }

    onAddClicked(): void {
        // console.log('onAddClicked()');
        let dialog = this.dialog.open(CamEditDialogComponent);
        dialog.componentInstance.camId = -1; // Add dialog
        dialog.componentInstance.camName = 'My camera';
        dialog.componentInstance.camHostname = '<your camera public IP>';
        dialog.componentInstance.camProto = 'p2pwyze';
        dialog.componentInstance.camProtoPort = 1;
        dialog.componentInstance.camMac = '';
        dialog.componentInstance.camPropMask = 0; // main stream, no audio
        dialog.componentInstance.camUsername = '';
        dialog.componentInstance.camPassword = '';
        dialog.componentInstance.camRequestMain = '/videoMain';
        dialog.componentInstance.camVideoMask = CameraSettings.DEFAULT_VIDEO_MASK;
        dialog.componentInstance.camVideoSens = 35;
        dialog.componentInstance.camAudioThreshold = 80;
        this.publicAddressService
            .getPublicAddress()
            .then(
                res => { dialog.componentInstance.camHostname = res['public_address']; });

        dialog.afterClosed().subscribe(result => {
            // console.log('Dialog result: ' + result);
            if (result) {
                this.loadCameras();
                this.snackBar.open('Camera added', null, {
                    duration: this.snackBarDurationInSec * 1000,
                });
            }
        });
    }

    onTestClicked(i: number): void {
        let camera = this.cameras[i];
        console.log('onTestClicked(' + i + '): ' + camera.cam_id);
        if (!this.testings[i]) {
            this.testMessages[i] = "Testing... Please wait.";
            this.testings[i] = true;
            this.testImageUrls[i] = null;
            this.camTestService
                .camTest(this.loginService.server, this.loginService.login, camera.cam_id)
                .then(
                    res  => { this.processCamTest(i, res); },
                    error => { this.processCamTestError(i, error); });
        }
    }

    onEditClicked(i: number): void {
        let camera = this.cameras[i];
        // console.log('onEditClicked(' + i + '): ' + camera.cam_id);
        let dialog = this.dialog.open(CamEditDialogComponent);
        dialog.componentInstance.camId = camera.cam_id;
        dialog.componentInstance.camProto = camera.cam_proto;
        dialog.componentInstance.camPropMask = camera.cam_prop_mask;
        dialog.componentInstance.camEnabled = camera.cam_enabled;
        dialog.componentInstance.camName = camera.cam_name;
        dialog.componentInstance.camHostname = camera.cam_uid;
        dialog.componentInstance.camMac = camera.cam_mac;
        dialog.componentInstance.camProtoPort = camera.cam_proto_port;
        dialog.componentInstance.camUsername = camera.cam_login;
        dialog.componentInstance.camPassword = camera.cam_pwd;
        dialog.componentInstance.camRequestMain = camera.cam_request;
        dialog.componentInstance.camRequestSub = camera.cam_request_sub;
        dialog.componentInstance.camVideoMask = camera.cam_video_mask;
        dialog.componentInstance.camVideoSens = camera.cam_video_sens;
        dialog.componentInstance.camAudioThreshold = 100 - camera.cam_audio_sens;
        dialog.afterClosed().subscribe(result => {
            //console.log(`Dialog result: ${result}`);
            if (result) {
                this.loadCameras();
                this.snackBar.open('Camera saved', null, {
                    duration: this.snackBarDurationInSec * 1000,
                });
            }
        });
    }

    onDeleteClicked(i: number): void {
        let camera = this.cameras[i];
        // console.log('onDeleteClicked(' + i + '): ' + camera.cam_id);
        let dialog = this.dialog.open(CamDelDialogComponent);//, this.config);
        dialog.componentInstance.camId = camera.cam_id;
        dialog.afterClosed().subscribe(result => {
            //console.log(`Dialog result: ${result}`);
            if (result) {
                this.loadCameras();
                this.snackBar.open('Camera deleted', null, {
                    duration: this.snackBarDurationInSec * 1000,
                });
            }
        });
    }

    onDemoClicked(i: number): void {
        let camera = this.cameras[i];
        console.log('onDemoClicked(' + i + '): ' + camera.cam_id);
        this.makeDemoSubscription(camera);
    }

    isDemoAvailable(i: number): boolean {
        let camera = this.cameras[i];
        return camera.state == 'NoPayment';
    }

    onCustomClicked(i: number) {
        let camera = this.cameras[i];
        console.log(`onCustomClicked(${i}): ${camera.cam_id}`);
        this.makeCustomSubscription(camera, this.customPlanId);
    }

    onClicked(i: number): void {
        let camera = this.cameras[i];
        console.log(`onClicked(${i}): ${camera.cam_id}`);
        switch (camera.state) {
            case 'NoPayment':
                this.makeSubscription(camera);
                break;
            case 'Active':
            case 'Failed':
                // this.cancelSubscription(camera);
                // break;
            case 'Suspended':
                // this.reactivateSubscription(camera);
                // break;
            case 'Error':
            case 'Canceled':
            default:
                this.contactSupport(camera);
                break;
        }
    }

    // cancelSubscription(cameraSettings: CameraSettings) {
    //     console.log('Canceling subscription for cam ' + cameraSettings.cam_id);
    //     this.processing = true;
    //     // TODO Code here
    // }

    // reactivateSubscription(cameraSettings: CameraSettings) {
    //     console.log('Re-activating subscription for cam ' + cameraSettings.cam_id);
    //     // TODO Code here
    // }

    private contactSupport(cameraSettings: CameraSettings) {
        console.log('Contacting support for cam ' + cameraSettings.cam_id);
        this.makeRedirection('mailto:info@masimba.eu?subject=tinyCam Cloud issue with camera "' +
            cameraSettings.cam_name + '" (' + cameraSettings.cam_id + ', ' + this.loginService.login.username + ')&body=Hi,');
    }

    private makeSubscription(cameraSettings: CameraSettings) {
        if (CameraSettings.isProtoP2pWyze(cameraSettings) || CameraSettings.isProtoP2pTutk(cameraSettings)) {
            this.makeP2pSubscription(cameraSettings);
        } else if (CameraSettings.isProtoP2pNeos(cameraSettings)) {
            this.makeP2pNeosSubscription(cameraSettings);
        } else {
            this.makeRtspSubscription(cameraSettings);
        }
    }

    private makeRtspSubscription(cameraSettings: CameraSettings) {
        console.log('Making RTSP subscription for cam ' + cameraSettings.cam_id);
        this.processing = true;
        this.paymentSubscribeService
            .subscribe(this.loginService.server, this.loginService.login, cameraSettings.cam_id, 1)
            .then(res => { this.processSubscribe(res); })
    }

    private makeP2pSubscription(cameraSettings: CameraSettings) {
        console.log('Making P2P subscription for cam ' + cameraSettings.cam_id);
        this.processing = true;
        this.paymentSubscribeService
            .subscribe(this.loginService.server, this.loginService.login, cameraSettings.cam_id, 3)
            .then(res => { this.processSubscribe(res); })
    }

    private makeP2pNeosSubscription(cameraSettings: CameraSettings) {
        console.log('Making P2P NEOS subscription for cam ' + cameraSettings.cam_id);
        this.processing = true;
        this.paymentSubscribeService
            .subscribe(this.loginService.server, this.loginService.login, cameraSettings.cam_id, 24)
            .then(res => { this.processSubscribe(res); })
    }

    private makeDemoSubscription(cameraSettings: CameraSettings) {
        console.log('Making demo subscription for cam ' + cameraSettings.cam_id);
        this.processing = true;
        this.paymentSubscribeService
            .subscribe(this.loginService.server, this.loginService.login, cameraSettings.cam_id, 1000)
            .then(res => { this.processSubscribe(res); })
    }

    private makeCustomSubscription(cameraSettings: CameraSettings, planId: number) {
        console.log(`Making custom subscription for cam ${cameraSettings.cam_id} with planId ${planId}`);
        this.processing = true;
        this.paymentSubscribeService
            .subscribe(this.loginService.server, this.loginService.login, cameraSettings.cam_id, planId)
            .then(res => { this.processSubscribe(res); })
    }

    private makeRedirection(url: string) {
        console.log('Redirecting to ' + url);
        this.windowRef.nativeWindow.location.href = url;
    }

    getCameraText(cameraSettings: CameraSettings): string {
        return CameraSettings.getName(cameraSettings);
    }

    getCameraDescription(cameraSettings: CameraSettings): string {
        var text = "";
        if (CameraSettings.isProtoP2pWyze(cameraSettings)) {
            text += "Camera type: Wyze Cam. Camera ";
            if (cameraSettings.cam_mac == null)
                text += "number " + cameraSettings.cam_proto_port;
            else
                text += "MAC: " + cameraSettings.cam_mac;
            text += ".";
        } else if (CameraSettings.isProtoP2pNeos(cameraSettings)) {
                text += "Camera type: Neos SmartCam. Camera number " + cameraSettings.cam_proto_port + ".";
        } else if (CameraSettings.isProtoP2pTutk(cameraSettings)) {
            text += "Camera type: P2P";
        } else if (CameraSettings.isProtoRtsp(cameraSettings)) {
            text += "Camera type: RTSP";
        }
        return text;
    }

    getButtonText(i: number): string {
        let camera = this.cameras[i];
//      console.log('State(' + i + '): ' + camera.state);
        switch (camera.state) {
            case 'NoPayment':
                return 'Subscribe via PayPal';
            case 'Active':
            case 'Failed':
                // return 'Cancel subscription';
            case 'Suspended':
                // return 'Re-Activate';
            case 'Canceled':
            case 'Error':
            default: return 'Contact support';
        }
    }

    // TODO: Info should be obtained from server
    getButtonDescription(i: number): string {
        let camera = this.cameras[i];
        switch (camera.state) {
            case 'NoPayment': {
                if (CameraSettings.isProtoP2pWyze(camera) || CameraSettings.isProtoP2pTutk(camera))
                    return '3.99 USD/EUR per month, 7 days history';
                if (CameraSettings.isProtoP2pNeos(camera))
                    return '2.99 GBP per month, 7 days history';
                return '5.99 USD/EUR per month, 7 days history';
            }
        }
    }

    isSpecialPriceMessageAvailable(): boolean {
        if (this.cameras.length < 3)
            return false;
        for (let camera of this.cameras) {
            if (camera.state == 'NoPayment')
                return true;
        }
        return false;
    }

    getTotalBandwidthUseKB(): number {
        let total = 0;
        for (let camera of this.cameras) {
            if (camera.cam_bandwidth_use != null)
                total += camera.cam_bandwidth_use;
        }
        return Math.floor(total);
    }

    processCamList(res: ServerResponse) {
        if (res.code != 100)
            this.errorMessage = res.message;

        let cameras = res.data as CameraSettings[];
        if (cameras)
            console.log('Cameras: ' + cameras.length);
        else
            console.log('Cameras empty');

        var newCameras = [];
        var newTestMessages = [];
        var newTestImageUrls = [];
        var newTestings = [];
        if (cameras) {
            for (let i = 0; i < cameras.length; i++) {
                newCameras.push(cameras[i]);
                newTestMessages.push("Press to test");
                newTestImageUrls.push(null);
                newTestings.push(false);
            }
        }
        this.cameras = newCameras;
        this.testMessages = newTestMessages;
        this.testImageUrls = newTestImageUrls;
        this.testings = newTestings;
        this.camerasLoaded = true;
        console.log('Filtered cameras: ' + newCameras.length);
    }

    processCamListError(error: string) {
        console.error('Error in getCamList()', error);
        this.errorMessage = error;
    }

    getRandomInt(max): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    processCamTest(i: number, res: ServerResponse) {
        this.testings[i] = false;
        if (res.code != 100) {
            this.testMessages[i] = res.message;// + " (code=" + json.code + ")";
            this.testImageUrls[i] = null;
        } else {
            this.testMessages[i] = "Press to test";
            this.testImageUrls[i] = JsonUtils.getArchiveFilename(
                        this.loginService.server,
                        this.loginService.login,
                        res.data.image,
                        this.cameras[i].cam_id,
                        null)  + "&rnd=" + this.getRandomInt(10000);
            // console.log("URL: " + this.testImageUrls[i]);
        }
    }

    processCamTestError(i: number, error: string) {
        console.error('Error in camTest()', error);
        this.testMessages[i] = error;
    }

    processUser(res: ServerResponse) {
        if (res.code != 100) {
            this.errorMessage = res.message;
        } else {
            this.demoAvailable = (res.data.user.demo_available == 1);
        }
    }

    processSubscribe(res: ServerResponse) {
        if (res.code != 100) {
            this.errorMessage = res.message;
            this.processing = false;
        } else {
            if (res.data.link != null)
                this.makeRedirection(res.data.link);
            else
                this.processing = false;
        }
    }

    isInError(cameraSettings: CameraSettings): boolean {
        return CameraSettings.isInError(cameraSettings);
    }

    getHumanReadableError(cameraSettings: CameraSettings): string {
        return CameraSettings.getHumanReadableError(cameraSettings);
    }

}
