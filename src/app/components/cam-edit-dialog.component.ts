import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServerResponse, ExtCamera } from '../models';
import { CamAddService, ExtCamListService, ExtCamLoginService, CamEditService, EventListService, LoginService } from '../services';
import { CamEditMaskDialogComponent } from './cam-edit-mask-dialog.component';
import JsonUtils from '../jsonutils';
import Utils from '../utils';

@Component({
  // selector: 'cam-edit-dialog',
  styles: [`
    .input-full-width {
        width: 100%;
    }
    .input-90-width {
        width: 90%;
    }
    .hint-text {
      padding-top: 2px;
      padding-bottom: 20px;
    }
`],
  template: `
    <h2 mat-dialog-title>Camera parameters</h2>
    <mat-dialog-content class="mat-body">

        <div *ngIf="isAddingCam()">
          <div class="app-text-dark-hint hint-text">
            Please select camera type you want to add.<br/>Then specify cameras parameters.
          </div>
          <mat-form-field color="accent" style="padding-top:10px;" class="input-full-width">
            <mat-select [value]="camProto" (selectionChange)="onProtoSelected($event.value)" placeholder="Camera type" class="active" >
              <mat-option value="rtsp">RTSP</mat-option>
              <mat-option value="p2pwyze">Wyze Cam</mat-option>
              <mat-option value="p2pneos">Neos SmartCam</mat-option>
              <mat-option value="p2ptutk">P2P</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div *ngIf="!isAddingCam()" style="padding-bottom:10px;">
          <mat-checkbox [(ngModel)]="camEnabled">Enabled</mat-checkbox>
          <div *ngIf="!camEnabled" class="app-text-dark-hint hint-text">
            Camera disabled. No recording or motion detection.
          </div>
        </div>

        <!-- <div class="app-text-center" style="padding:10px">
          <button class="mui-btn mui-btn--raised" (click)="onScheduleClicked()"><i class="fas fa-calendar-alt" style="padding-right: 10px;"></i>Change schedule</button>
        </div> -->

        <div>
          <mat-form-field class="input-full-width">
            <input
              matInput
              required
              placeholder="Name"
              [(ngModel)]="camName"
              name="name">
          </mat-form-field>
        </div>

        <div>
          <mat-form-field class="input-full-width" *ngIf="!isP2pWyze() && !isP2pNeos()">
            <input
              matInput
              required
              placeholder="{{getHostnameText()}}"
              [(ngModel)]="camHostname"
              name="hostname">
          </mat-form-field>
          <mat-card *ngIf="isPrivateIpAddress(camHostname)" class="app-card-warning" style="margin-bottom:15px">
            <mat-card-content><i class="fas fa-exclamation-triangle" style="padding-right:10px;"></i>This is private IP address.<br/>Please specify your public IP address.</mat-card-content>
          </mat-card>
        </div>

        <div *ngIf="!isP2pTutk()">
          <div *ngIf="!isExtCamListSupported()">
            <mat-form-field class="input-full-width">
              <input
                matInput
                required
                type="number"
                placeholder="{{getProtoText()}}"
                [(ngModel)]="camProtoPort"
                name="port">
            </mat-form-field>
          </div>

          <div *ngIf="isRtsp()" class="app-text-dark-hint hint-text">
            Be sure you have enabled RTSP port forwarding <br/>
            on your router. Use <a href="https://portchecker.co/" target="_blank">this</a> service to check that.
          </div>

          <div>
            <mat-form-field class="input-full-width">
              <input
                matInput
                required
                type="text"
                placeholder="{{getUsernameText()}}"
                [(ngModel)]="camUsername"
                name="username"
                autocomplete="nope"
                (blur)="usernamePasswordFocusLost()">
            </mat-form-field>
          </div>
        </div>

        <div>
          <mat-form-field class="input-full-width">
            <input
              matInput
              required
              [type]="show ? 'text' : 'password'"
              placeholder="{{getPasswordText()}}"
              [(ngModel)]="camPassword"
              name="password"
              autocomplete="new-password"
              (blur)="usernamePasswordFocusLost()">
            <button
              *ngIf="isAddingCam() && !show"
              mat-icon-button
              matSuffix
              (click)="show = !show"
              [attr.aria-label]="'show password'" [attr.aria-pressed]="show">
              <mat-icon fontSet="fa" fontIcon="fa-eye-slash"></mat-icon>
            </button>
            <button
              *ngIf="isAddingCam() && show"
              mat-icon-button
              matSuffix
              (click)="show = !show"
              [attr.aria-label]="'show password'" [attr.aria-pressed]="show">
              <mat-icon fontSet="fa" fontIcon="fa-eye"></mat-icon>
            </button>
          </mat-form-field>
        </div>

        <div *ngIf="isExtCamListSupported()">
          <div class="app-text-center" style="padding:10px">
            <button
              mat-raised-button
              matSuffix
              [disabled]="camUsername.length == 0 || camPassword.length == 0"
              style="display:inline-block; margin: 0px 5px;"
              (click)="isAddingCam() ? doExtCamLoginNew() : doExtCamLoginExisting()">
              <i class="fas fa-link"></i> Connect
            </button>
          </div>
          <mat-card *ngIf="extCamErrorMessage != null" class="app-text-center app-card-warning camlist-error">
            {{this.extCamErrorMessage}}
          </mat-card>
          <mat-form-field color="accent" class="input-full-width">
            <mat-select [(value)]="camMac" (selectionChange)="onExtCamSelected($event.value)" placeholder="Wyze device" [disabled]="!extCamListLoaded">
              <mat-option *ngFor="let camera of extCameras" [value]="camera.cam_mac">
                {{camera.cam_name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

        </div>
        <!-- <mat-icon fontSet="fa" fontIcon="fa-sync fa-spin"></mat-icon> -->
        <!-- <mat-icon [ngClass]="!extCamListLoaded ? 'fas fa-sync' : 'fas fa-sync fa-spin'"></mat-icon> -->
        <!-- <i class="fas fa-sync fa-spin"></i> -->

        <div *ngIf="isRtsp()">
          <div style="margin:10px;">
            <mat-radio-group >
              <mat-radio-button style="padding:5px;"
                name="optionsRec"
                id="optionsRecVideoOnly"
                value="videoOnly"
                [checked]="!this.recWithAudio()"
                (change)="onRecWithAudioChange(0)">Rec video only
              </mat-radio-button>
              <mat-radio-button style="padding:5px;"
                name="optionsRec"
                id="optionsRecVideoAudio"
                value="videoAudio"
                [checked]="this.recWithAudio()"
                (change)="onRecWithAudioChange(1)">Rec video and audio
              </mat-radio-button>
            </mat-radio-group>
          </div>

          <div *ngIf="!isAddingCam()" style="margin:10px;margin-bottom:20px;" >
            <mat-radio-group>
              <mat-radio-button style="padding:5px;"
                name="optionsStream"
                id="optionsStreamMain"
                value="streamMain"
                [checked]="!this.isSubstream()"
                (change)="onSubstreamChange(0)">Main-Stream
              </mat-radio-button>
              <mat-radio-button style="padding:5px;"
                name="optionsStream"
                id="optionsStreamSub"
                value="streamSub"
                [checked]="this.isSubstream()"
                (change)="onSubstreamChange(1)">Sub-Stream
              </mat-radio-button>
            </mat-radio-group>
          </div>

          <div>
            <mat-form-field class="input-full-width" *ngIf="isRtsp()">
              <input
                matInput
                required
                type="text"
                placeholder="Main-stream request"
                [(ngModel)]="camRequestMain"
                name="requestMain">
            </mat-form-field>
          </div>

          <div>
            <mat-form-field class="input-full-width" *ngIf="!isAddingCam() && isRtsp()">
              <input
                matInput
                type="text"
                placeholder="Sub-stream request"
                [(ngModel)]="camRequestSub"
                name="requestSub">
            </mat-form-field>
          </div>

          <div *ngIf="!isAddingCam()">
            <mat-checkbox [checked]="this.preferUdp()" (change)="onPreferUdpChange($event)">Prefer UDP instead of TCP</mat-checkbox>
              <div class="app-text-dark-hint hint-text">
                Enable if you want to decrease uploading bandwidth<br/>
                usage. RTSP over UDP should be forwarded on your<br/>
                router. May produce corrupted video. By default, off.
              </div>
          </div>
        </div>
        <div style="padding-top: 10px; padding-bottom: 5px;">
          <div style="padding-bottom: 4px;">Video motion sensitivity ({{camVideoSens}})</div>
          <mat-slider
              class="input-full-width"
              [max]="100"
              [min]="1"
              [step]="1"
              [thumbLabel]="true"
              [(ngModel)]="camVideoSens"
              [disabled]="isExtCamListSupported() && !extCamListLoaded">
          </mat-slider>
          <div class="app-text-dark-hint hint-text">Larger sensitivity value will trigger motion<br/> detection more easily. By default, 35.</div>
        </div>
        <div class="app-text-center" style="padding:10px">
          <button
            mat-raised-button
            (click)="onEditMaskClicked()"
            [disabled]="isExtCamListSupported() && !extCamListLoaded">
            <i class="fas fa-th" style="vertical-align:center"></i> Change mask
          </button>
        </div>

        <div style="padding-top: 10px; padding-bottom: 5px;" *ngIf="isRtsp()">
          <div style="padding-bottom: 4px;">Audio alarm threshold ({{camAudioThreshold}})</div>
          <mat-slider
              class="input-full-width"
              [max]="100"
              [min]="1"
              [step]="1"
              [thumbLabel]="true"
              [(ngModel)]="camAudioThreshold">
          </mat-slider>
          <div class="app-text-dark-hint hint-text">Lower audio threshold value will trigger motion<br/> detection more easily. By default, 80.</div>
        </div>
        <div style="padding:10px;"></div>

    </mat-dialog-content>
    <div class="app-text-center">
    <mat-dialog-actions align="end">
        <button
          mat-raised-button
          mat-dialog-close>Cancel</button>
        <button
          *ngIf="!isAddingCam()"
          mat-raised-button
          color="accent"
          (click)="onSaveClicked()">Save</button>
        <button
          *ngIf="isAddingCam()"
          mat-raised-button
          color="accent"
          [disabled]="isExtCamListSupported() && !extCamListLoaded"
          (click)="onAddClicked()">Add</button>
    </mat-dialog-actions></div>
  `
})
export class CamEditDialogComponent {
    @Input() camId: number;
    @Input() camEnabled: boolean;
    @Input() camName: string;
    @Input() camHostname: string;
    @Input() camMac: string;
//  @Input() camWebPort: number;
    @Input() camProtoPort: number;
    @Input() camPropMask: number;
    @Input() camUsername: string;
    @Input() camPassword: string;
    @Input() camRequestMain: string;
    @Input() camRequestSub: string;
    @Input() camVideoMask: string;
    @Input() camVideoSens: number;
    @Input() camAudioThreshold: number;
    @Input() camProto: string;
    show = false;
    extCamListSupported = true;
    extCamListLoaded = false;
    extCameras: ExtCamera[] = null;
    extCamPayload: string = null;
    extCamErrorMessage: string = null;


    // 1st bit - sub stream. 0 - main, 1 - sub stream.
    // 2nd bit - prefer UDP over TCP.
    // 9th bit - rec audio.  0 - rec video only, 1 - rec video+audio.
    // 00000001 00000011
    private PARAM_CAM_PROP_MASK_REQUEST_SUB    = 1;
    private PARAM_CAM_PROP_MASK_PREFER_UDP     = 1 << 1;
    private PARAM_CAM_PROP_MASK_REC_WITH_AUDIO = 1 << 8;

    constructor(
        private router: Router,
        private loginService: LoginService,
        private camAddService: CamAddService,
        private camEditService: CamEditService,
        private extCamListService: ExtCamListService,
        private extCamLoginService: ExtCamLoginService,
        private eventListService: EventListService,
        public dialogRef: MatDialogRef<CamEditDialogComponent>,
        private dialog: MatDialog) {}

    ngOnInit() {
        // if (this.isExtCamListSupported() && !this.isAddingCam())
        //     this.loadExtCamList();
    }

    onProtoSelected(proto): void {
       switch(proto) {
           case "rtsp": this.camProto = "rtsp"; this.camProtoPort = 554; break;
           case "p2ptutk": this.camProto = "p2ptutk"; this.camHostname = ''; break;
           case "p2pwyze": this.camProto = "p2pwyze"; this.camProtoPort = 1; break;
           case "p2pneos": this.camProto = "p2pneos"; this.camProtoPort = 1; break;
       }
       // console.log('Proto selected: "' + target.value + '"');
    }

    onExtCamSelected(mac): void {
      console.log('Mac selected: "' + mac + '"');
    }

    getHostnameText(): string {
        if (this.isP2pTutk()) {
            return "UID (20 characters)";
        } else {
            return "Hostname";
        }
    }

    getProtoText(): string {
        if (this.isP2pWyze()) {
            return "Wyze camera number";
        } else if (this.isP2pNeos()) {
            return "Neos camera number";
        } else {
            return "RTSP Port";
        }
    }

    getUsernameText(): string {
      if (this.isP2pWyze()) {
          return "Wyze login"
      } else if (this.isP2pNeos()) {
          return "Neos login";
      } else {
          return "Username";
      }
    }

    getPasswordText(): string {
      if (this.isP2pWyze()) {
          return "Wyze password"
      } else if (this.isP2pNeos()) {
          return "Neos password";
      } else {
          return "Password";
      }
    }

    isExtCamListSupported(): boolean {
      return this.isP2pWyze() && this.extCamListSupported;// && this.camMac != null;
    }

    isAddingCam(): boolean {
        return this.camId == -1;
    }

    isP2pTutk(): boolean {
        return "p2ptutk" == this.camProto;
    }

    isP2pWyze(): boolean {
        return "p2pwyze" == this.camProto;
    }

    isP2pNeos(): boolean {
        return "p2pneos" == this.camProto;
    }

    isRtsp(): boolean {
          return "rtsp" == this.camProto;
    }

    isSubstream(): boolean {
        return (this.camPropMask & this.PARAM_CAM_PROP_MASK_REQUEST_SUB) > 0;
    }

    recWithAudio(): boolean {
        return (this.camPropMask & this.PARAM_CAM_PROP_MASK_REC_WITH_AUDIO) > 0;
    }

    preferUdp(): boolean {
        return (this.camPropMask & this.PARAM_CAM_PROP_MASK_PREFER_UDP) > 0;
    }

    onRecWithAudioChange(entry): void {
        if (entry)
            this.camPropMask |= this.PARAM_CAM_PROP_MASK_REC_WITH_AUDIO;
        else
            this.camPropMask &= ~this.PARAM_CAM_PROP_MASK_REC_WITH_AUDIO;
    }

    onSubstreamChange(entry): void {
      if (entry)
          this.camPropMask |= this.PARAM_CAM_PROP_MASK_REQUEST_SUB;
      else
          this.camPropMask &= ~this.PARAM_CAM_PROP_MASK_REQUEST_SUB;
    }

    onPreferUdpChange(value:any): void {
        let entry = value.checked ? 1 : 0;
        if (entry)
            this.camPropMask |= this.PARAM_CAM_PROP_MASK_PREFER_UDP;
        else
            this.camPropMask &= ~this.PARAM_CAM_PROP_MASK_PREFER_UDP;
    }

    onAddClicked(): void {
        // console.log('onAddClicked()');
        this.camAddService.getCamAdd(
                this.loginService.server,
                this.loginService.login,
                this.camName,
                this.camUsername,
                this.camPassword,
                this.camProto,
                this.camHostname,
                this.camRequestMain,
                this.camProtoPort,
                this.camMac,
                this.camPropMask,
                this.camVideoMask,
                this.camVideoSens,
                100 - this.camAudioThreshold,
                this.extCamPayload
            )
            .then(
                res  => { this.processCamAdd(res); },
                error => { this.processCamAddError(error); });
    }

    doExtCamLoginNew(): void {
        console.log('doExtCamLoginNew()');
        this.extCamListLoaded = false;
        this.extCameras = null;
        this.extCamErrorMessage = null;
        this.extCamLoginService.getExtCamLoginNew(
                this.loginService.server,
                this.loginService.login,
                this.camProto,
                this.camUsername,
                this.camPassword
            )
            .then(
                res => { this.processExtCamLogin(res); },
                error => { this.processExtCamListError(error); });
    }

    doExtCamLoginExisting(): void {
        console.log('doExtCamLoginExisting()');
        this.extCamListLoaded = false;
        this.extCameras = null;
        this.extCamErrorMessage = null;
        this.extCamLoginService.getExtCamLoginExisting(
                this.loginService.server,
                this.loginService.login,
                this.camId
            )
            .then(
                res => { this.processExtCamLogin(res); },
                error => { this.processExtCamListError(error); });
    }

    processExtCamLogin(res: ServerResponse) {
        console.log('processExtCamLogin(): ' + res);
        if (res.code != 100)
            this.extCamErrorMessage = res.message;

        let camera = res.data as ExtCamera;
        this.extCamPayload = camera.cam_payload;
        this.extCamListService.getExtCamListWithPayload(
            this.loginService.server,
            this.loginService.login,
            this.extCamPayload
        )
        .then(
            res => { this.processExtCamList(res); },
            error => { this.processExtCamListError(error); });
    }

    loadExtCamList(): void {
        // console.log('loadExtCamList()');
        this.extCamListLoaded = false;
        this.extCameras = null;
        this.extCamListService.getExtCamList(
                this.loginService.server,
                this.loginService.login,
                this.camProto,
                this.camUsername,
                this.camPassword
            )
            .then(
                res  => { this.processExtCamList(res); },
                error => { this.processExtCamListError(error); });
    }

    onSaveClicked(): void {
        // console.log('onSaveClicked()');
        // this.loadExtCamList();
        this.camEditService.getCamEdit(
                this.loginService.server,
                this.loginService.login,
                this.camId,
                this.camName,
                this.camUsername,
                this.camPassword,
                this.camHostname,
                this.camRequestMain,
                this.camRequestSub,
                this.camProtoPort,
                this.camMac,
                this.camPropMask,
                this.camVideoMask,
                this.camVideoSens,
                100 - this.camAudioThreshold,
                this.camEnabled
            )
            .then(
                res  => { this.processCamEdit(res); },
                error => { this.processCamEditError(error); });
    }

    onEditMaskClicked() {
        // console.log('onEditMaskClicked()');
        let dialog = this.dialog.open(CamEditMaskDialogComponent);
        dialog.componentInstance.camVideoMask = this.camVideoMask;
        dialog.afterClosed().subscribe(result => {
            // console.log('Dialog result: ' + result);
            if (result)
                this.camVideoMask = dialog.componentInstance.camVideoMask ;
//            console.log('Mask: ' + this.camVideoMask);
        });
        this.eventListService.getEventListById(
            this.loginService.server,
            this.loginService.login,
            this.camId,
            0,
            1)
                .then(events => {
                    // console.log(events);
                    if (events && events.length > 0) {
                        var imageSrc = JsonUtils.getArchiveFilename(
                            this.loginService.server,
                            this.loginService.login,
                            events[0].image,
                            events[0].cam_id,
                            events[0].date);
                        //  console.log(imageSrc);
                        dialog.componentInstance.setBackgroundImage(imageSrc);
                    }
                });
    }

    onScheduleClicked() {
//         console.log('onScheduleClicked()');
//         let dialog = this.dialog.open(CamScheduleDialogComponent);
//         dialog.componentInstance.camVideoMask = this.camVideoMask;
//         dialog.afterClosed().subscribe(result => {
//             // console.log('Dialog result: ' + result);
//             if (result)
//                 this.camVideoMask = dialog.componentInstance.camVideoMask ;
// //            console.log('Mask: ' + this.camVideoMask);
//         });
    }

    usernamePasswordFocusLost() {
        // console.log('usernamePasswordFocusLost()');
        // if (this.isExtCamListSupported() && this.camUsername.length > 0 && this.camPassword.length > 0) {
        //     this.loadExtCamList();
        // }
    }

    processCamAdd(res: ServerResponse) {
        // console.log('processCamAdd()');
        this.dialogRef.close(true);
        // Refresh page
        // this.router.navigate(['/account?refresh=1']);
    }

    processCamAddError(error: string) {
      console.error('Error in getCamAdd()', error);
    }

    processCamEdit(res: ServerResponse) {
        // console.log('processCamEdit()');
        this.dialogRef.close(true);
        // Refresh page
        // this.router.navigate(['/account?refresh=1']);
    }

    processCamEditError(error: string) {
        console.error('Error in getCamEdit()', error);
    }

    processExtCamList(res: ServerResponse) {
        console.log('processExtCamList(): ' + res);
        if (res.code != 100)
            this.extCamErrorMessage = res.message;

        let cameras = res.data as ExtCamera[];
        this.extCameras = cameras;
        this.extCamListLoaded = true;
        if (this.isAddingCam() && cameras != null && cameras.length > 0) {
            this.camMac = cameras[0].cam_mac;
        }
        // this.dialogRef.close(true);
        // Refresh page
        // this.router.navigate(['/account?refresh=1']);
    }

    processExtCamListError(error: string) {
        console.error('Error in getExtCamList()', error);
        this.extCamListLoaded = true;
        this.extCamListSupported = false;
    }

    isPrivateIpAddress(ip: string): boolean {
        return Utils.isPrivateIpAddress(ip);
    }
}
