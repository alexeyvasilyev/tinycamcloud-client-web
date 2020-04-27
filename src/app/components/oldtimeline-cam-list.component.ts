import { Component } from '@angular/core';
import { CamListSelectionComponent } from './cam-list-selection.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'oldtimeline-cam-list',
  styles: [ `
    .camlist-error {
      margin-top: 50px;
      color: white;
      background-color: #F44336;
    }
    .full-width {
      width: 100%;
    }
  `],
  template: `
    <div>
      <div *ngIf="errorMessage != null" class="mui-panel mui--text-center mui--text-title camlist-error">
        {{this.errorMessage}}
      </div>
      <div *ngIf="cameras; else loading_content">
        <div *ngIf="cameras.length > 0; else no_cams_content">
          <mat-card *ngIf="cameras.length > 1" style="margin-bottom:20px">
            <mat-form-field color="accent" style="padding-top:10px;" class="full-width">
              <mat-select [(value)]="selectedCamId" (selectionChange)="onSelected($event.value)" placeholder="Camera timeline">
                <mat-option *ngFor="let camera of cameras" [value]="camera.cam_id">
                  {{getCameraName(camera)}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card>
          <archive-list [camId]="camId"></archive-list>
        </div>
      </div>

      <ng-template #no_cams_content><mat-card>No cameras added. Please add cameras via <a routerLink="/account">Account</a> tab or via <a href="https://tinycammonitor.com/">tinyCam Monitor</a> Android app.</mat-card></ng-template>
      <ng-template #loading_content><mat-card>Loading cameras list...</mat-card></ng-template>
    </div>
  `
})

export class OldTimelineCamListComponent extends CamListSelectionComponent {

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
