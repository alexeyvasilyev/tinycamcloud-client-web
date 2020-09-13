import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse, ExtCamera } from '../models';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ExtCamListService {
//  private headers = new Headers({'Content-Type': 'application/json'});
//  private postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;

    constructor(private http: HttpClient) {
    }

//IN:
// {"login":"demo","pwd":"12345","cam":{"cam_proto":"p2pwyze","cam_login":"test@gmail.com","cam_pwd":"zzz"}}

//OUT:
//{"code":100,"message":"OK","data":"[{\"name\":\"Demo\",\"mac\":\"A4DA22393429\",\"model\":\"WYZEC1-JZ\"},{\"name\":\"Test\",\"mac\":\"A4DA133746C9\",\"model\":\"WYZECP1_JEF\"}]"}
    getExtCamList(server: Server, login: Login, camProto: string, camLogin: string, camPwd: string): Promise<ExtCamera[]> {
        // console.log('getExtCamList()');
        let jsonLogin = login.toJSON();
        let jsonCam = { 
            cam: {
                cam_proto: camProto,
                cam_login: camLogin,
                cam_pwd: camPwd
            }
        };
        const jsonCombined = Object.assign(jsonLogin, jsonCam); 
        const postData = JSON.stringify(jsonCombined);
        const extCamListUrl = `https://${server.server_addr}/v1/ext_cam_list.php`;
        return this.http
                .post(extCamListUrl, postData)
                .toPromise()
                .then((res:ServerResponse) => res.data as ExtCamera[])
                .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred in /v1/ext_cam_list.php', error);
        return Promise.reject(error.message || error);
    }

}
