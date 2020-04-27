import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Login, Server, CameraSettings, ArchiveRecord } from '../models'
import { ArchiveListService, LoginService } from '../services';
import { EventListComponent } from './event-list.component';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import Utils from '../utils'
import JsonUtils from '../jsonutils'

// <video> tag is shown only for Chrome/Firefox/Safari browsers. Not shown for IE.
// For Chrome browser only first 5 events are shown as <video>,
// the rest one are <image> (preventing too many active sockets issue).
@Component({
  selector: 'archive-list',
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
        <input matInput [matDatepicker]="picker" placeholder="Choose a date" (dateChange)="onDateChanged($event)">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker [dateClass]="dateClass" #picker></mat-datepicker>
      </mat-form-field>
    </div>
    <mat-card *ngIf="!archivesLoaded">
      Loading archive...
    </mat-card>
    <div *ngIf="archivesLoaded">
      <div *ngIf="archives.length > 0; else no_archives_content" style="margin-bottom:20px;">
        <p *ngIf="autoplayOnHover" class="app-text-dark-secondary" style="padding-top: 5px; padding-bottom: 5px">TIP: Hold mouse cursor on image for a couple seconds to show recorded video.</p>
        <div
            infinite-scroll
            [infiniteScrollDistance]="2"
            [infiniteScrollThrottle]="100"
            (scrolled)="onScroll()">
            <div *ngFor="let archive of archives; let i = index" style="margin-bottom:20px;">
                <event
                    [number]="i"
                    [imageUrl]="this.getArchiveImage(archive)"
                    [videoUrl]="this.getArchiveVideo(archive)"
                    [date]="archive.date"></event>
            </div>
        </div>
      </div>
      <ng-template #no_archives_content>
        <mat-card class="app-text-center" style="padding-bottom: 20px">
          <p class="app-text-dark">No archives found.</p> If you just added a camera, <b>please wait for 15 minutes</b> to get recordings available.
        </mat-card>
      </ng-template>
    </div>
  `
})

// http://52.178.37.238/v1/archive_file.php?data=%7B%22login%22%3A%22eu%22%2C%22pwd%22%3A%229fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57%22%2C%22file%22%3A%7B%22cam_id%22%3A14716977849097%2C%22name%22%3A%222016-12-26_19h14m29s_28242.jpg%22%2C%22date%22%3A%222016-12-26T21%3A14%3A29%2B02%3A00%22%7D%7D
// http://52.178.37.238/v1/archive_file.php?data=%7B%22login%22%3A%22eu%22%2C%22pwd%22%3A%229fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57%22%2C%22file%22%3A%7B%22name%22%3A%222016-12-26_21h37m07s_29316.jpg%22%2C%22cam_id%22%3A14716977849097%7D%7D
export class ArchiveListComponent implements OnInit {

    private ARCHIVES_TO_LOAD = 30;

    archives: ArchiveRecord[] = [];
    archivesLoaded = false;
    autoplayOnHover = false;
    // startAt = new Date();
    // minDate = new Date(2017, 1, 1);
    // maxDate = new Date();

    dateClass = (d: Date) => {
        const date = d.getTime();
        const today = new Date().getTime();
        const minus7days = new Date(today - 604800000 /*7 days*/).getTime();
        return (date <= today && date >= minus7days) ? 'recordings-date-class' : undefined;
    }

    constructor(
        private loginService: LoginService,
        private archiveListService: ArchiveListService) {
    }

    @Input() camId: number;

    ngOnInit() {
        // console.log('ngOnInit()) asrchive-list');
        // this.loadLastEvents();
        this.autoplayOnHover = Utils.isBrowserFirefox();
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('EventListComponent::ngOnChanges()');
        // for (let propName in changes) {
        //     let chng = changes[propName];
        //     // console.log('ngOnChanges() cur: ' + chng.currentValue);
        // }
        this.loadLastArchives();
    }

    private loadLastArchives() {
        // Clear events
        this.archives = [];
        this.archivesLoaded = false;
        // this.eventListService.getEventListByDate(
        //     this.loginService.server,
        //     this.loginService.login,
        //     this.camId,
        //     '2017-02-21T13:30:40+00:00',
        //     this.EVENTS_TO_LOAD)
        //         .then(events => { this.processEventList(events); });
        this.archiveListService.getArchiveListById(
            this.loginService.server,
            this.loginService.login,
            this.camId,
            -1,
            this.ARCHIVES_TO_LOAD)
                .then(archives => { this.processArchiveList(archives); });
    }

    onScroll() {
        // console.log('EventListComponent::onScroll())');
        console.log('Loading more ' + this.ARCHIVES_TO_LOAD + ' archives...');
        let event = this.archives[this.archives.length - 1];
        this.archiveListService.getArchiveListById(
            this.loginService.server,
            this.loginService.login,
            this.camId,
            event.file_id,
            this.ARCHIVES_TO_LOAD)
                .then(archives => { this.processArchiveList(archives); });
    }

    processArchiveList(archives: ArchiveRecord[]) {
        if (archives)
            console.log('Archives: ' + archives.length);
        else
            console.log('Archive empty');

        var newArchives = [];
        for (let i = 0; i < archives.length; i++) {
            newArchives.push(archives[i]);
        }
        // Concatinate arrays
        for (let i = 0; i < newArchives.length; i++) {
            this.archives.push(newArchives[i]);
        }
        this.archivesLoaded = true;
        // this.events.concat(newEvents);
        console.log('Filtered archives: ' + newArchives.length);

        // this.eventListService.getEventList(this.server, this.login, -1 /*all cameras*/)
        //     .then(events => { this.processEventList(events); });
    }

    getArchiveImage(archive: ArchiveRecord): string {
        return JsonUtils.getArchiveFilename(
            this.loginService.server,
            this.loginService.login,
            archive.image,
            archive.cam_id,
            archive.date);
    }

    getArchiveVideo(archive: ArchiveRecord): string {
        let videoUrl = JsonUtils.getArchiveFilename(
            this.loginService.server,
            this.loginService.login,
            archive.video,
            archive.cam_id,
            archive.date);
        // videoUrl += '#t=' + ((event.video_offset - 3000) / 1000).toFixed();
        return videoUrl;
    }

    onDateChanged(event: MatDatepickerInputEvent<Date>) {
      console.log('Date selected "' + new Date(event.value).toISOString() + '"');
      this.archivesLoaded = false;

        // // Today selected
        if (event.value == null) {
            this.loadLastArchives();

        // Custom date selected
        } else {
            // Clear events
            this.archives = [];

            let selectedDate = new Date(event.value);
            // var tomorrow = new Date();
            selectedDate.setDate(selectedDate.getDate() + 1);
            this.archiveListService.getArchiveListByDate(
                this.loginService.server,
                this.loginService.login,
                this.camId,
                selectedDate,
                this.ARCHIVES_TO_LOAD)
                    .then(archives => { this.processArchiveList(archives); });
        }
    }

    // onDateChanged2(event) {
    //     console.log('onDateChanged2(date="' + new Date(event).toISOString() + '")');
    //
    //     // Today selected
    //     if (event.epoc == 0) {
    //         this.loadLastArchives();
    //
    //     // Custom date selected
    //     } else {
    //         // Clear events
    //         this.archives = [];
    //
    //         let selectedDate = new Date(event);
    //         // var tomorrow = new Date();
    //         selectedDate.setDate(selectedDate.getDate() + 1);
    //         this.archiveListService.getArchiveListByDate(
    //             this.loginService.server,
    //             this.loginService.login,
    //             this.camId,
    //             selectedDate,
    //             this.ARCHIVES_TO_LOAD)
    //                 .then(archives => { this.processArchiveList(archives); });
    //     }
    // }

}
