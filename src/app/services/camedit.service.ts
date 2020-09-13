import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CamEditService {

    constructor(private http: HttpClient) {
    }

    public getCamEdit(
        server: Server,
        login: Login,
        camId: number,
        camName: string,
        camUsername: string,
        camPassword: string,
        // camProto: string,
        camUid: string,
        // isSubstream: boolean,
        // hasAudio: boolean,
        camRequestMain: string,
        camRequestSub: string,
        camProtoPort: number, // camProtoPort or camMac
        camMac: string,
        // camWebPort: number,
        camPropMask: number,
        camVideoMask: string,
        camVideoSens: number,
        camAudioSens: number,
        // schedule: string,
        enabled: boolean): Promise<ServerResponse> {

        console.log('getCamEdit(camId=' + camId + ')');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","cam":{"cam_id":12345}}

        var postData: string;

        if (camName == null)
            camName = '';
        if (camUsername == null)
            camUsername = '';
        if (camPassword == null)
            camPassword = '';
        if (camUid == null)
            camUid = '';
        if (camMac == null)
            camMac = '';

        if (camId != -1) {
            let jsonLogin = login.toJSON();
            let jsonCam = { 
                cam: {
                    cam_id: camId,
                    cam_name: camName,
                    cam_login: camUsername,
                    cam_pwd: camPassword,
                    cam_uid: camUid,
                    cam_request: camRequestMain,
                    cam_request_sub: camRequestSub,
                    cam_proto_port: camProtoPort,
                    cam_mac: camMac,
                    cam_prop_mask: camPropMask,
                    cam_video_mask: camVideoMask,
                    cam_video_sens: camVideoSens,
                    cam_audio_sens: camAudioSens,
                    cam_enabled: enabled
                }
            };
            const jsonCombined = Object.assign(jsonLogin, jsonCam); 
            postData = JSON.stringify(jsonCombined);
        } else {
            postData = JSON.stringify(login);
        }
        // console.log(postData);
        const camEditUrl = `https://${server.server_addr}/v1/cam_edit.php`;
        return this.http
            .post(camEditUrl, postData)
            .toPromise()
            //.then(response => response.json().data as ArchiveRecord[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}
