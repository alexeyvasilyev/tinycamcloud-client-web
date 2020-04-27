import { Component, Input, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CameraSettings } from '../models';

declare const Mask: any;

@Component({
  // selector: 'cam-edit--mask-dialog',
  styles: [`
  `],
  template: `
    <h2 mat-dialog-title>Camera motion detection mask</h2>
    <mat-dialog-content>
      <!-- <div style="padding-bottom: 4px;">Mask: {{camVideoMask}}</div> -->
      <div style="padding:5px;"
        (mousemove)="handleMouseMoveEvent($event)" (mousedown)="handleMouseDownEvent($event)"
        (touchmove)="handleTouchMoveEvent($event)">
        <canvas #canvasMask style="cursor: pointer;"></canvas>
      </div>
      <div style="padding:5px;">
        <img src="assets/img/mask_legend_selected.png" style="vertical-align: middle;"> - motion detection enabled
        <img src="assets/img/mask_legend_empty.png" style="vertical-align: middle; padding-left: 20px;"> - no motion detection
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-raised-button
        (click)="onDefaultClicked()"
        style="margin-right:30px;"><i class="fas fa-undo" style="margin-right:10px;"></i>Default</button>
      <button
        mat-raised-button
        mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="accent"
        (click)="onSaveClicked()">Save</button>
    </mat-dialog-actions>
  `
})
export class CamEditMaskDialogComponent {
    @Input() camVideoMask: string;

    @ViewChild('canvasMask', { static: true }) canvasMaskEl: ElementRef;

    private mask = null;

    constructor(
        public dialogRef: MatDialogRef<CamEditMaskDialogComponent>) {}

    setBackgroundImage(imageSrc: string) {
        this.mask.setBackgroundImage(imageSrc);
    }

    ngOnInit() {
        var options = {
            patternImageSrc : 'assets/img/mask_pattern.png'
        }
        this.mask = new Mask(options);
        this.mask.setCanvas(this.canvasMaskEl.nativeElement);
        this.updateMask();
        // this.mask.setRequestMoreMajor1DataCallback(this.requestMoreMajor1Data.bind(this));

        this.resizeCanvas();

        // const ro = new ResizeObserver((entries, observer) => {
        //     this.resizeCanvas();
        // });
        // ro.observe(this.componentEl.nativeElement);
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     console.log('ngOnChanges(camVideoMask="' + changes.camVideoMask.currentValue + '")');
    //     console.log('ngOnChanges(camImageSrc="' + changes.camImageSrc.currentValue + '")');
    //     // this.updateMask();
    // }

    private updateMask() {
      this.mask.setMask(
          this.makeMaskFromString(
              this.camVideoMask,
              CameraSettings.DEFAULT_VIDEO_MASK_COLUMNS,
              CameraSettings.DEFAULT_VIDEO_MASK_ROWS));
    }

    handleMouseDownEvent(event: MouseEvent) {
        this.mask.onTapDown(event);
    }

    handleMouseMoveEvent(event: MouseEvent) {
        if (event.buttons == 1) {
            this.mask.onTapMove(event);
        }
    }

    // handleTouchStartEvent(event: TouchEvent) {
    //     if (event.targetTouches.length == 1) {
    //         this.firstTouch = event.targetTouches[0].pageX;
    //     }
    // }

    handleTouchMoveEvent(event: TouchEvent) {
        // if (event.targetTouches.length == 1) {
        //     this.mask.onTapMove(event);
        // }
    }

    onSaveClicked(): void {
        // console.log('onSaveClicked()');
        var maskArray = this.mask.getMask();
        var maskString = this.makeMaskFromArray(maskArray);
        // console.log("mask: " + maskString);
        this.camVideoMask = maskString;
        this.dialogRef.close(true);
    }

    onDefaultClicked(): void {
        // console.log('onDefaultClicked()');
        this.camVideoMask = CameraSettings.DEFAULT_VIDEO_MASK;
        this.updateMask();
        this.mask.draw();
    }

    private fitToContainerWidth(canvas) {
        // canvas.style.width = '100%';
        canvas.style.minWidth = '700px';
        canvas.height = canvas.offsetWidth / 1.77; // 16:9
        canvas.width = canvas.offsetWidth;
    }

    private resizeCanvas() {
        // console.log('resizeCanvas()');
        this.fitToContainerWidth(this.canvasMaskEl.nativeElement);
        this.mask.updateResize();
        this.mask.draw();
    }

    private booleansToInt(srcArray1D: boolean[]): number {
        // arr.length should be max 32
        var n = 0;
        for (var i = 0; i < srcArray1D.length; i++)
            n = (n << 1) | (srcArray1D[i] ? 1 : 0);
        return n;
    }

    private intToBooleans(n: number, dstArray1D: boolean[]) {
        for (var i = 0; i < dstArray1D.length; i++) {
            dstArray1D[dstArray1D.length - i - 1] = ((n >> i) & 0x01) == 1;
        }
    }

    private makeMaskFromString(mask: string, width: number, height: number): boolean[][] {
        if (mask == null)
            return null;
        var array2DMask = [];
        for (var y = 0; y < height; y++) {
            var array1DMask = [];
            for (var x = 0; x < width; x++) {
                array1DMask.push(false);
            }
            array2DMask.push(array1DMask);
        }
        var tokens = mask.split(",");
        for (var i = 0; i < tokens.length; i++) {
            var k = parseInt(tokens[i], 16);
            this.intToBooleans(k, array2DMask[i]);
        }
        return array2DMask;
    }

    private makeMaskFromArray(array2D: boolean[][]): string {
        if (array2D == null)
            return null;
        var s = "";
        for (var i = 0; i < array2D.length; i++) {
            var k = this.booleansToInt(array2D[i]);
            s += k.toString(16) + ',';
        }
        return s.substring(0, s.length - 1); // remove last ','
    }


}
