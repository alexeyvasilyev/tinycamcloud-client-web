import { Component, OnInit, Input } from '@angular/core';
// import { trigger, animate, transition, style, state, keyframes } from '@angular/animations';
import { WindowRefService } from '../services';
import { fadeInAnimation } from '../animations/';

@Component({
  selector: 'probe',
  animations: [fadeInAnimation],
  styles: [ `
    .probe-image {
      width: 355px;
      height: 200px;
      background: #616161;
    }
    .middle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
    }
    .circle:hover {
      opacity: 0;
    }
    .circle {
      position: absolute;
      background-color: #000000;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      transition: .5s ease;
    }
    .probe-image-container:hover {
    }
    .probe-image-container {
      position: relative;
      width: 355px;
      padding: 3px 3px;
      transition: .4s ease;
    }
    .probe-image-container:hover {
      opacity: 0.9;
      box-shadow: 0 0 2px rgba(0,0,0,.12), 0 2px 2px rgba(0,0,0,.2);
    }
    .img {
      position: relative;
      display: block;
    }
    .img:hover {
      cursor: pointer;
    }
  `],
  template: `
  <div [@fadeInAnimation]>

  <div class="probe-image-container">
    <div *ngIf="imageUrl != null">
      <img class="probe-image" alt="Test" src="{{imageUrl}}"/>
    </div>
    <div *ngIf="imageUrl == null" class="probe-image">
    </div>
    <div class="middle circle" style="opacity: 0.5;">
      <div class="middle" *ngIf="!probing" >
        <i class="fas fa-redo-alt fa-3x" style="color:white;"></i>
      </div>
      <div class="middle" *ngIf="probing;">
        <i class="fas fa-circle-notch fa-spin fa-3x fa-fw" style="color:white;"></i>
      </div>
    </div>
  </div>
  `
})

export class ProbeComponent implements OnInit {

    constructor(private windowRef: WindowRefService) {
    }

    @Input() title: string;
    @Input() imageUrl: string;
    @Input() probing: boolean;

    ngOnInit() {
    }

    ngOnDestroy() {
    }

}
