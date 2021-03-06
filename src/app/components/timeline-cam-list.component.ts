import { Component, Input } from '@angular/core';
import { CamListSelectionComponent } from './cam-list-selection.component';
import { CameraSettings } from '../models';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'timeline-cam-list',
  styles: [ `
    .full-width {
      width: 100%;
    }
  `],
  template: `
    <div>
      <mat-card *ngIf="errorMessage != null" class="app-text-center app-card-warning" style="margin-bottom: 30px">
        {{this.errorMessage}}
      </mat-card>
      <div *ngIf="cameras; else loading_content">
        <div *ngIf="cameras.length > 0; else no_cams_content">
          <div *ngIf="cameras.length > 1" style="text-align:right;padding-top:20px;padding-bottom:20px;">
            <mat-checkbox [(ngModel)]="multipleTimeline">Show all cameras on timeline</mat-checkbox>
          </div>
          <div *ngIf="cameras.length > 1 && !multipleTimeline" style="margin-bottom:20px;">
            <mat-card>
              <mat-form-field color="accent" style="padding-top:10px;" class="full-width">
                <mat-select [(value)]="selectedCamId" (selectionChange)="onSelected($event.value)" placeholder="Camera timeline">
                  <mat-option *ngFor="let camera of cameras" [value]="camera.cam_id">
                    {{getCameraName(camera)}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </mat-card>
          </div>
          <archive-timeline [selectedCamId]="camId" [cameras]="cameras" [multipleTimeline]="multipleTimeline"></archive-timeline>
          <div style="text-align:right;padding:10px;">
            <a routerLink="/oldtimeline" routerLinkActive="active" class="">Switch to old timeline</a>
          </div>
        </div>
      </div>

      <ng-template #no_cams_content><mat-card>No cameras added. Please add cameras via <a routerLink="/account">Account</a> tab or via <a href="https://tinycammonitor.com/">tinyCam Monitor</a> Android app.</mat-card></ng-template>
      <ng-template #loading_content><mat-card>Loading cameras list...</mat-card></ng-template>
    </div>
  `
})

export class TimelineCamListComponent extends CamListSelectionComponent {
    @Input() multipleTimeline: boolean;

    selectedCamId: number = -1;

    camerasLoaded() {
        if (this.cameras && this.cameras.length > 0) {
            this.camId = this.cameras[0].cam_id;
            this.selectedCamId = this.getSelectedCamId();
            this.onSelected(this.selectedCamId);
        }
    }

    getSelectedCamId(): number {
        // Find first enabled camera
        for (let camera of this.cameras) {
            if (camera.cam_enabled)
                return camera.cam_id;
        }
        // No enabled cameras found.
        // Return the first item in the list.
        return this.cameras[0].cam_id;
    }

}
