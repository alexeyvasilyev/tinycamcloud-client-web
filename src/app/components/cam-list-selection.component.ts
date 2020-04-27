import { Component, OnInit } from '@angular/core';
import { CameraSettings, Login, Server, ServerResponse } from '../models';
import { CamListService, LoginService } from '../services';

@Component({
    template: ``
})

export class CamListSelectionComponent implements OnInit {

    cameras: CameraSettings[] = null;
    warnings: CameraSettings[] = null;
    camId = -1; // all cameras
    errorMessage: string = null;
    responseCode: number = -1;

    constructor(
        protected loginService: LoginService,
        protected camListService: CamListService) {
    }

    ngOnInit() {
        this.camListService.getCamList(this.loginService.server, this.loginService.login, false)
            .then(
                res  => { this.processCamList(res); },
                error => { this.processCamListError(error); });
//                () => {})
            // .catch(this.processCamListError);
    }

    onSelected(camId: number): void {
        this.camId = camId;
        // console.log('Selected: "' + target.value + '", camId: ' + camIdSelected);
    }

    processCamListError(errorMessage: string) {
        console.error('Error in getCamList()', errorMessage);
//        if (!this.isConnected) {
//            this.errorMessage = "Check Internet connection";
//        } else {
            this.errorMessage = errorMessage;
//        }
        this.responseCode = -1;
    }

    processCamList(res: ServerResponse) {
        // console.log('processCamList()');
        this.responseCode = res.code;
        if (res.code != 100) {
            this.errorMessage = res.message;
        }

        let cameras = res.data as CameraSettings[];
        if (cameras) {
            console.log('Total cameras: ' + cameras.length);
        } else {
            console.log('No cameras found.');
        }

        var newCameras = [];
        var newWarnings = [];
        if (cameras) {
            for (let i = 0; i < cameras.length; i++) {
                if (cameras[i].cam_id != null) {
                    newCameras.push(cameras[i]);
                    if (cameras[i].cam_last_error != null && cameras[i].cam_last_error.length > 0) {
                        newWarnings.push(cameras[i]);
                    }
                }
            }
        }
        this.cameras = newCameras;
        this.warnings = newWarnings;
        // console.log('Filtered cameras: ' + newCameras.length + ', warnings: ' + newWarnings.length);

        this.camerasLoaded();
        // this.eventListService.getEventList(this.server, this.login, -1 /*all cameras*/)
        //     .then(events => { this.processEventList(events); });
    }

    camerasLoaded() {
    }

    getCameraName(cameraSettings: CameraSettings): string {
        return CameraSettings.getName(cameraSettings);
    }

}
