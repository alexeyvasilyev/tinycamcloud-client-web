import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { EventRecord, Login, Server, CameraSettings, CameraRecord, FileGetToken } from '../models';
import { EventListService, LoginService, FileGetTokenService } from '../services';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Platform } from '@angular/cdk/platform';
import JsonUtils from '../jsonutils';

// <video> tag is shown only for Chrome/Firefox/Safari browsers. Not shown for IE.
// For Chrome browser only first 5 events are shown as <video>,
// the rest one are <image> (preventing too many active sockets issue).
@Component({
  selector: 'event-list',
  styles: [ `
    .recordings-date-class {
      background: #EEEEEE;
      border-radius: 100%;
    }
  `],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div>
    <div class="app-text-center" style="padding-bottom: 20px">
      <mat-form-field style="padding-top: 20px">
        <input matInput [min]="minus6days" [max]="today" [matDatepicker]="picker" placeholder="Choose a date" (dateChange)="onDateChanged($event)">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker [dateClass]="dateClass" #picker></mat-datepicker>
      </mat-form-field>
    </div>
    <mat-card *ngIf="!eventsLoaded">
      Loading events...
    </mat-card>
    <div *ngIf="eventsLoaded">
      <div *ngIf="events.length > 0; else no_events_content">
        <p *ngIf="autoplayOnHover" class="app-text-dark-secondary" style="padding-top: 5px; padding-bottom: 5px">TIP: Hold mouse cursor on image for a couple seconds to show recorded video.</p>
        <div
            infinite-scroll
            [infiniteScrollDistance]="2"
            [infiniteScrollThrottle]="100"
            (scrolled)="onScroll()">
            <div *ngFor="let event of events; let i = index" style="margin-bottom:20px;">
                <event
                    [number]="i"
                    [title]="getEventTitle(event)"
                    [titleHint]="getEventTitleHint(event)"
                    [imageUrl]="getEventImage(event)"
                    [videoUrl]="getEventVideo(event)"
                    [hasVideo]="event.has_video"
                    [hasAudio]="event.has_audio"
                    [date]="event.date"></event>
            </div>
        </div>
      </div>
      <ng-template #no_events_content>
        <mat-card class="app-text-center" style="padding-bottom: 20px">
          <p class="app-text-dark">No motion events found.</p> If you just added a camera, <b>please wait for 15 minutes</b> to get recordings available.
        </mat-card>
      </ng-template>
    </div>
  `
})

// http://52.178.37.238/v1/archive_file.php?data=%7B%22login%22%3A%22eu%22%2C%22pwd%22%3A%229fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57%22%2C%22file%22%3A%7B%22cam_id%22%3A14716977849097%2C%22name%22%3A%222016-12-26_19h14m29s_28242.jpg%22%2C%22date%22%3A%222016-12-26T21%3A14%3A29%2B02%3A00%22%7D%7D
// http://52.178.37.238/v1/archive_file.php?data=%7B%22login%22%3A%22eu%22%2C%22pwd%22%3A%229fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57%22%2C%22file%22%3A%7B%22name%22%3A%222016-12-26_21h37m07s_29316.jpg%22%2C%22cam_id%22%3A14716977849097%7D%7D
export class EventListComponent implements OnInit {

    private EVENTS_TO_LOAD = 30;

    events: EventRecord[] = [];
    eventsLoaded = false;
    autoplayOnHover = false;
    camerasMap: Map<number, CameraRecord> = new Map();

    constructor(
        private loginService: LoginService,
        private eventListService: EventListService,
        private fileGetTokenService: FileGetTokenService,
        public platform: Platform) {
    }

    @Input() camId: number; // can be -1 for all cameras events
    @Input() cameras: CameraSettings[];

            today: Date = new Date(); // today
    private minus7days: Date = new Date(this.today.getTime() - 604800000 /*7 days*/);
            minus6days: Date = new Date(this.today.getTime() - 518400000 /*6 days*/);

    dateClass = (d: Date) => {
        const date = d.getTime();
        const minus7daysMsec = this.minus7days.getTime();
        return (date <= this.today.getTime() && date >= minus7daysMsec) ? 'recordings-date-class' : undefined;
    }

    ngOnInit() {
        // console.log('ngOnInit())');
        // this.loadLastEvents();
        this.autoplayOnHover = this.platform.FIREFOX;

        // Mapping cam_id to cam_name
        // 15593704483417 - "Cam 1"
        // 15123704434122 - "Cam 2"
        for (let camera of this.cameras) {
            let cameraRecord = new CameraRecord();
            cameraRecord.name = camera.cam_name;
            this.camerasMap.set(camera.cam_id, cameraRecord);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('EventListComponent::ngOnChanges()');
        // for (let propName in changes) {
        //     let chng = changes[propName];
        //     // console.log('ngOnChanges() cur: ' + chng.currentValue);
        // }
        this.getFileTokens();
        this.loadLastEvents();
    }

    private getFileTokens() {
        for (let camera of this.cameras) {
            this.fileGetTokenService.getFileToken(
                this.loginService.server,
                this.loginService.login,
                camera.cam_id)
                    .then(token => { this.processFileToken(token, camera.cam_id); });
        }
    }

    processFileToken(fileGetToken: FileGetToken, camId: number) {
        console.log('Token: ' + fileGetToken.token);
        this.camerasMap.get(camId).token = fileGetToken.token;
    }

    private loadLastEvents() {
        // Clear events
        this.events = [];
        this.eventsLoaded = false;
        // this.eventListService.getEventListByDate(
        //     this.loginService.server,
        //     this.loginService.login,
        //     this.camId,
        //     '2017-02-21T13:30:40+00:00',
        //     this.EVENTS_TO_LOAD)
        //         .then(events => { this.processEventList(events); });
        this.eventListService.getEventListById(
            this.loginService.server,
            this.loginService.login,
            this.camId,
            0,
            this.EVENTS_TO_LOAD)
                .then(events => { this.processEventList(events); });
    }

    onScroll() {
        console.log('Loading more ' + this.EVENTS_TO_LOAD + ' events...');
        let event = this.events[this.events.length - 1];
        this.eventListService.getEventListById(
            this.loginService.server,
            this.loginService.login,
            this.camId,
            event.event_id,
            this.EVENTS_TO_LOAD)
                .then(events => { this.processEventList(events); });
    }

    processEventList(events: EventRecord[]) {
        if (events) {
            // console.log('Events: ' + events.length);
            // var newEvents = [];
            // for (let event of events) {
            //     if (event.duration > this.MIN_DURATION_EVENT_MSEC) {
            //         newEvents.push(event);
            //     }
            // }
            // for (let event of newEvents) {
            //     this.events.push(event);
            // }
            // Concatinate arrays
            for (let event of events) {
                this.events.push(event);
            }
            // console.log('Filtered events: ' + newEvents.length);
            console.log('Loaded ' + events.length + ' events' );
        } else {
            console.log('Events list is empty');
        }

        this.eventsLoaded = true;
    }

    getEventTitle(event: EventRecord): string {
        return 'Motion - ' + (event.duration / 1000).toFixed() + ' sec';
    }

    getEventTitleHint(event: EventRecord): string {
        return (this.camId == -1 && this.cameras.length > 1) ? this.camerasMap.get(event.cam_id).name : null;
    }

    getEventImage(event: EventRecord): string {
      let fileGetToken = new FileGetToken();
      fileGetToken.token = this.camerasMap.get(event.cam_id).token;
      // fileGetToken.cam_id = event.cam_id;
      return JsonUtils.getFile(
          this.loginService.server,
          this.loginService.login,
          event.cam_id,
          fileGetToken,
          event.image);
        // return JsonUtils.getArchiveFilename(
        //     this.loginService.server,
        //     this.loginService.login,
        //     event.image,
        //     event.cam_id,
        //     event.date);
    }

    getEventVideo(event: EventRecord): string {
        let fileGetToken = new FileGetToken();
        fileGetToken.token = this.camerasMap.get(event.cam_id).token;
        let videoUrl = JsonUtils.getFileMp4(
            this.loginService.server,
            this.loginService.login,
            event.cam_id,
            fileGetToken,
            event.video,
            event.date);
        // let videoUrl = JsonUtils.getArchiveFilename(
        //     this.loginService.server,
        //     this.loginService.login,
        //     event.video,
        //     event.cam_id,
        //     event.date);
        videoUrl += '#t=' + ((event.video_offset - 3000) / 1000).toFixed();
        // console.log('Video: ' + videoUrl);
        return videoUrl;
    }

    onDateChanged(event: MatDatepickerInputEvent<Date>) {
        console.log('Date selected "' + new Date(event.value).toISOString() + '"');
        this.eventsLoaded = false;

        // Today selected
        if (event.value == null) {
            this.loadLastEvents();

        // Custom date selected
        } else {
            // Clear events
            this.events = [];

            let selectedDate = new Date(event.value);
            // var tomorrow = new Date();
            selectedDate.setDate(selectedDate.getDate() + 1);
            this.eventListService.getEventListByDate(
                this.loginService.server,
                this.loginService.login,
                this.camId,
                selectedDate,
                this.EVENTS_TO_LOAD)
                    .then(events => { this.processEventList(events); });
        }
    }

    // onDateChangedOld(event: IMyDateModel) {
    //     console.log('Date selected "' + new Date(event.jsdate).toISOString() + '"');
    //
    //     // Today selected
    //     if (event.epoc == 0) {
    //         this.loadLastEvents();
    //
    //     // Custom date selected
    //     } else {
    //         // Clear events
    //         this.events = [];
    //
    //         let selectedDate = new Date(event.jsdate);
    //         // var tomorrow = new Date();
    //         selectedDate.setDate(selectedDate.getDate() + 1);
    //         this.eventListService.getEventListByDate(
    //             this.loginService.server,
    //             this.loginService.login,
    //             this.camId,
    //             selectedDate,
    //             this.EVENTS_TO_LOAD)
    //                 .then(events => { this.processEventList(events); });
    //     }
    // }

    // // http://10.0.1.50/archive_file.php?data={"login":"test2","pwd":"097218ab91e91cd9c7b405b2b26e3a277a80010fc5793f380fb1f0a160c7c14a","file":{"name":"2015-08-31_15:01:32_rec.mp4"}}
    // // data={"login":"test2","pwd":"097218ab91e91cd9c7b405b2b26e3a277a80010fc5793f380fb1f0a160c7c14a","file":{"name":"2015-08-31_15:01:32_rec.mp4", "cam_id":1444908568}}
    // static getArchiveFilename(server: Server, login: Login, filename: string, camId: number, date: string): string {
    //     let getData = JSON.stringify(login).replace('}', ',') + '"file":{"name":"' + filename + '","cam_id":' + camId + ',"date":"' + date + '"}}';
    //     getData = encodeURIComponent(getData);
    //     let request = 'https://' + server.server_addr + '/v1/archive_file.php?data=' + getData;
    //     return request;
    // }

}
