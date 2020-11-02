import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse } from '../models';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ExtCamLoginService {
    constructor(private http: HttpClient) {
    }

    // getExtCamLoginExisting(server: Server, login: Login, camId: number): Promise<ServerResponse> {
    //     // console.log('getExtCamExisting()');
    //     const jsonLogin = login.toJSON();
    //     const jsonCam = {
    //         cam: {
    //             cam_id: camId
    //         }
    //     };
    //     const jsonCombined = Object.assign(jsonLogin, jsonCam);
    //     const postData = JSON.stringify(jsonCombined);
    //     const extCamListUrl = `https://${server.server_addr}/v1/ext_cam_login.php`;
    //     return this.http
    //             .post(extCamListUrl, postData)
    //             .toPromise()
    //             // .then((res:ServerResponse) => res.data as ExtCamera)
    //             .catch(this.handleError);
    // }

// Request 1: New cam - try plain login
// {
//   "cam": {
//     "cam_login":"l1",
//     "cam_pwd":"p1",
//     "cam_proto":"pr1",
//   }
// }

// Response:
// {
//   "code":130,
//   "message":"Need 2fa login",
//   "data": {
//     "cam_payload":"pl1"
//   }
// }

// Request 2: New cam - 2fa login
// {
//   "cam": {
//     "cam_login":"l1",
//     "cam_pwd":"p1",
//     "cam_proto":"pr1",
//     "cam_code":"c1",
//     "cam_payload":"pl1"
//   }
// }

// Response:
// {
//   "code":100,
//   "message":"OK",
//   "data": {
//     "cam_payload":"pl2"
//   }
// }
//    getExtCamLoginNew(server: Server, login: Login, camProto: string, camLogin: string, camPwd: string): Promise<ServerResponse> {
    getExtCamLogin(server: Server, login: Login, camProto: string, camLogin: string, camPwd: string): Promise<ServerResponse> {
            // console.log('getExtCamLoginNew()');
        const jsonLogin = login.toJSON();
        const jsonCam = {
            cam: {
                cam_proto: camProto,
                cam_login: camLogin,
                cam_pwd: camPwd
            }
        };
        const jsonCombined = Object.assign(jsonLogin, jsonCam);
        const postData = JSON.stringify(jsonCombined);
        const extCamListUrl = `https://${server.server_addr}/v1/ext_cam_login.php`;
        return this.http
                .post(extCamListUrl, postData)
                .toPromise()
                // .then((res:ServerResponse) => res.data as ExtCamera)
                .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred in /v1/ext_cam_login.php', error);
        return Promise.reject(error.message || error);
    }

}
