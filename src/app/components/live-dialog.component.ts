import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileGetToken } from '../models';
import { LoginService, FileGetTokenService } from '../services';
import JsonUtils from '../jsonutils';
import videojs from 'video.js';

@Component({
  selector: 'live-dialog',
  template: `
    <table style="border-spacing:3px;border-collapse:separate;width:100%;">
      <tr>
        <td width="90%">
          <div mat-dialog-title style="margin: auto;">{{title}}
          <span *ngIf="videoError" style="color:red">Video loading error!</span></div>
        </td> 
        <td width="10%" style="text-align:right;">
          <button mat-icon-button mat-dialog-close><i class="fa fa-times" aria-hidden="true"></i></button>
        </td>
      </tr>
    </table>

    <video width="800px" id='hlsvideo' preload="none" class="video-js vjs-default-skin vjs-big-play-centered"
        controls (error)="handleVideoError()" (playing)="handleVideoPlaying()">
    </video>
    <div style="padding:10px;">NOTE: Live view is valid for 5 min with 1 min cool down interval.</div>
  `
})

export class LiveDialogComponent implements AfterViewInit {
    @Input() title: string;
    @Input() camId: number;

    private _elementRef: ElementRef
    private player: any;
    videoError = false;

    constructor(
        elementRef: ElementRef,
        public dialog: MatDialog,
        private loginService: LoginService,
        private fileGetTokenService: FileGetTokenService) {
          this.player = false;
    }

    ngOnInit() {
        // console.log('ngOnInit()');
        this.fileGetTokenService.getFileToken(
            this.loginService.server,
            this.loginService.login,
            this.camId)
                .then(token => { this.processFileToken(token, this.camId); });
    }

    ngAfterViewInit() {
        // console.log('ngAfterViewInit()');
        // const self = this;
        this.player = videojs(document.getElementById('hlsvideo'), {
            liveui: true,
            controlBar: {
                'volumePanel': false,
            }
        });
        // this.player = videojs(document.getElementById('hlsvideo'), {
        //     liveui: true,
        //     controlBar: {
        //     volumePanel: {
        //         inline: false
        //     }
        //   }
        // });
//      this.player.muted(true);
    }

    handleVideoError() {
        console.error('Video loading error');
        this.videoError = true;
    }

    handleVideoPlaying() {
        this.videoError = false;
    }

    processFileToken(fileGetToken: FileGetToken, camId: number) {
        // console.log('Token: ' + fileGetToken.token);

        let liveUrl = JsonUtils.getFile(
            this.loginService.server,
            this.loginService.login,
            camId,
            fileGetToken,
            "live.m3u8");

        // this.liveUrl = "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";
       // console.log('Url: ' + liveUrl);
        this.player.src({
            src: liveUrl,
            type: "application/x-mpegURL"
        });
        this.player.play();
    }

    // getDuration(player) {
    //     var seekable = player.seekable();
    //     return seekable && seekable.length ? seekable.end(0) - seekable.start(0) : 0;
    // }

    // onSeekPercentChange(player, seekPercent, duration) {
    //   var seekable = player.seekable();
    //
    //   if (seekable && seekable.length) {
    //     // constrain currentTime
    //     player.currentTime(Math.max(0, Math.min(seekable.end(0), seekable.start(0) + (seekPercent * duration))));
    //   }
    // }

    // isLive() {
    //   if (!isFinite(this.player.duration())) {
    //     return true;
    //   }
    //
    //   var acceptableDelay = 30;
    //   var seekable = this.player.seekable();
    //   return seekable && seekable.length && seekable.end(0) - this.player.currentTime() < acceptableDelay;
    // }

    // seek(n) {
    //     this.player.currentTime(this.seekTime || 1266);
    // }

    // play(n) {
    //     if (this.player.paused()) {
    //         this.player.play();
    //     } else {
    //         this.player.pause();
    //     }
    // }

    ngOnDestroy() {
      // console.log('onDestroy');
//      this.player.currentTime(0);
        // this.player.src('');
        this.player.pause();
        // Setting fake URL to stop HLS playback when dialog closed (BUG)
        this.player.src({
            src: 'https://cloud.tinycammonitor.com',
            type: "application/x-mpegURL"
        });
        //document.getElementById('hlsvideo').remove();
    }

    // openDialog() {
    //     this.dialog.open(VideoDialogComponent);
    // }

}
