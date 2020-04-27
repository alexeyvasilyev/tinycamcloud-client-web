import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CamAddService {

    // DEFAULT_VIDEO_SENSITIVITY = 35;
    // DEFAULT_AUDIO_SENSITIVITY = 20;
    DEFAULT_SCHEDULE = '';
    // 1st bit - sub stream. 0 - main, 1 - sub stream.
    // 9th bit - has audio.  0 - no audio, 1 - has audio.
    // 00000001 00000001
    DEFAULT_PROP_MASK = 0;
    DEFAULT_WEB_PORT = 80;
    DEFAULT_REQUEST_SUB = '';

    constructor(private http: HttpClient) {
    }

//{"code":100,"message":"OK","data":
//[{"file_id":1,"cam_id":1,"name":"2016-03-21_14:16:23_111.mp4","date":"2016-03-21T14:16:23+00:00","is_finished":1,"preview":"2016-03-21_14:16:23_111.mp4"},{"file_id":1,"cam_id":1,"name":"2016-03-21_14:16:23_111.mp4","date":"2016-03-21T14:16:23+00:00","is_finished":1,"preview":"1458569814668081_111.jpg"}]}
    public getCamAdd(
        server: Server,
        login: Login,
        camName: string,
        camUsername: string,
        camPassword: string,
        camProto: string,
        camUid: string,
        // isSubstream: boolean,
        // hasAudio: boolean,
        camRequestMain: string,
        // camRequestSub: string,
        camProtoPort: number,
        camMac: string,
        camPropMask: number,
        // camWebPort: number,
        camVideoMask: string,
        camVideoSens: number,
        camAudioSens: number,
        // schedule: string,
        //enabled: boolean
      ): Promise<ServerResponse> {

        // console.log('getCamAdd()');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","cam":{"cam_id":12345}}

        var postData = JSON.stringify(login);
            postData = postData.replace('}', ',') + '"cam":{' +
            '"cam_name":"' + camName + '",' +
            '"cam_login":"' + camUsername + '",' +
            '"cam_pwd":"' + camPassword + '",' +
            '"cam_proto":"' + camProto + '",' +
            '"cam_uid":"' + camUid + '",' +
            '"cam_prop_mask":' + this.DEFAULT_PROP_MASK + ',' +
            '"cam_request":"' + camRequestMain + '",' +
            '"cam_request_sub":"' + this.DEFAULT_REQUEST_SUB + '",' +
            '"cam_web_port":' + this.DEFAULT_WEB_PORT + ',' +
            '"cam_proto_port":' + camProtoPort + ',' +
            '"cam_mac":"' + camMac + '",' +
            '"cam_prop_mask":' + camPropMask + ',' +
            '"cam_video_mask":"' + camVideoMask + '",' +
            '"cam_video_sens":' + camVideoSens + ',' +
            '"cam_audio_sens":' + camAudioSens + ',' +
            '"cam_schedule":"' + this.DEFAULT_SCHEDULE + '",' +
            '"cam_enabled":' + true + ',' +
            '"cam_add_source":0' + // 0 - web, 1 - Android app, 2 - iOS app
             '}}';
            // postData = postData + '",cam":{"cam_id":' + camId + '}}';
        // console.log(postData);
        var camAddUrl = 'https://' + server.server_addr + "/v1/cam_add.php";
        //  var postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;
        return this.http
            .post(camAddUrl, postData)
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
