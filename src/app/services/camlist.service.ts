import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse, CameraSettings } from '../models';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CamListService {
//  private headers = new Headers({'Content-Type': 'application/json'});
//  private postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;

    constructor(private http: HttpClient) {
    }

    getCamList(server: Server, login: Login, accountInfo: boolean): Promise<ServerResponse> {
        // console.log('getCamList()');
        var postData = JSON.stringify(login).replace('}', ',') + '"user":{"account_info":' + (accountInfo ? '1' : '0') + '}}';
        let camListUrl = 'https://' + server.server_addr + "/v1/cam_list.php";
        //  var postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;
        return this.http
                .post(camListUrl, postData)
                .toPromise()
                // .then((data) => data)
                .catch(this.handleError);
        //[{"id":10,"cam_id":1444908568,"date":"2015-10-19 13:50:05","image":"2015-10-19_16:50:05_sen786945787.jpg",
        //  "video":"2015-10-19_16:50:05_rec.mp4","video_offset":17183,"duration":null,"has_audio":0,
        //  "has_video":1,"audio_level":0,"video_level":786945787}]
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred in /v1/cam_list.php', error);
        return Promise.reject(error.message || error);
    }

}
