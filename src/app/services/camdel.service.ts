import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CamDelService {

    constructor(private http: HttpClient) {
    }

//{"code":100,"message":"OK","data":
//[{"file_id":1,"cam_id":1,"name":"2016-03-21_14:16:23_111.mp4","date":"2016-03-21T14:16:23+00:00","is_finished":1,"preview":"2016-03-21_14:16:23_111.mp4"},{"file_id":1,"cam_id":1,"name":"2016-03-21_14:16:23_111.mp4","date":"2016-03-21T14:16:23+00:00","is_finished":1,"preview":"1458569814668081_111.jpg"}]}
    public getCamDel(server: Server, login: Login, camId: number): Promise<boolean> {
        console.log('getCamDel(camId=' + camId + ')');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","cam":{"cam_id":12345}}

        var postData: string;
        if (camId != -1) {
            let jsonLogin = login.toJSON();
            let jsonCam = { 
                cam: {
                    cam_id: camId
                }
            };
            const jsonCombined = Object.assign(jsonLogin, jsonCam); 
            postData = JSON.stringify(jsonCombined);
        } else {
            postData = JSON.stringify(login);
        }
        // console.log(postData);
        const camDelUrl = `https://${server.server_addr}/v1/cam_del.php`;
        return this.http
            .post(camDelUrl, postData)
            .toPromise()
            //.then(response => response.json().data as ArchiveRecord[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}
