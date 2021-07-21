import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CamDelService, LoginService } from '../services';

@Component({
  // selector: 'cam-del-dialog',
  // styles: [ `
  //   .example-full-width {
  //     width: 100%;
  //     height: 100%;
  //   }
  //   .example-form {
  //     width: 500px;
  //   }
  // `],
  template: `
    <h2 mat-dialog-title>Are you sure you want to delete the camera?</h2>
    <mat-dialog-content>Archive and events will be deleted as well.</mat-dialog-content>
    <mat-dialog-actions align="end">
        <button
            mat-raised-button
            mat-dialog-close>Cancel</button>
        <button
            mat-raised-button
            color="accent"
            (click)="onDeleteClicked()">Delete</button>
    </mat-dialog-actions>
  `
})
export class CamDelDialogComponent {
    @Input() camId: number;

    constructor(
        private loginService: LoginService,
        private camDelService: CamDelService,
        public dialogRef: MatDialogRef<CamDelDialogComponent>) {}

    onDeleteClicked(): void {
        console.log('onDeleteClicked()');
        this.camDelService.getCamDel(this.loginService.server, this.loginService.login, this.camId)
            .then(
                json  => { this.processCamDel(json); },
                error => { this.processCamDelError(error); });
    }

    processCamDelError(error: any) {
        console.error('Error in getCamDel()', error);
    }

    processCamDel(json: any) {
        console.log('processCamDel()');
        this.dialogRef.close(true);
        // Refresh page
        // this.router.navigate(['/account?refresh=1']);
    }

}
