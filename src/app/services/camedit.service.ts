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

        var postData = JSON.stringify(login);
        if (camId != -1) {
            postData = postData.replace('}', ',') + '"cam":{' +
            '"cam_id":' + camId + ',' +
            '"cam_name":"' + camName + '",' +
            '"cam_login":"' + camUsername + '",' +
            '"cam_pwd":"' + camPassword + '",' +
            // '"camProto":"' + camProto + '",' +
            '"cam_uid":"' + camUid + '",' +
            '"cam_request":"' + camRequestMain + '",' +
            '"cam_request_sub":"' + camRequestSub + '",' +
            '"cam_proto_port":' + camProtoPort + ',' +
            '"cam_mac":"' + camMac + '",' +
//            '"camWebPort":' + camWebPort + ',' +
            '"cam_prop_mask":' + camPropMask + ',' +
            '"cam_video_mask":"' + camVideoMask + '",' +
            '"cam_video_sens":' + camVideoSens + ',' +
            '"cam_audio_sens":' + camAudioSens + ',' +
            // schedule
            '"cam_enabled":' + enabled +
             '}}';
            // postData = postData + '",cam":{"cam_id":' + camId + '}}';
        }
        // console.log(postData);
        var camEditUrl = 'https://' + server.server_addr + "/v1/cam_edit.php";
        //  var postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;
        return this.http
            .post(camEditUrl, postData)
            .toPromise()
            //.then(response => response.json().data as ArchiveRecord[])
            .catch(this.handleError);
        //[{"id":10,"cam_id":1444908568,"date":"2015-10-19 13:50:05","image":"2015-10-19_16:50:05_sen786945787.jpg",
        //  "video":"2015-10-19_16:50:05_rec.mp4","video_offset":17183,"duration":null,"has_audio":0,
        //  "has_video":1,"audio_level":0,"video_level":786945787}]
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}
