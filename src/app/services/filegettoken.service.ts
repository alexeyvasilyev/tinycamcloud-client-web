import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse, FileGetToken } from '../models'
import 'rxjs/add/operator/toPromise';

//    http://cloud.tinycammonitor.com/v1/main_user_get.php
//    {"login":"run"}
//    {"code":100,"message":"OK","data":{"user":{"server":"23.101.55.100","server_name":"server1"}}}

@Injectable()
export class FileGetTokenService {

    constructor(private http: HttpClient) {
    }

    // In: {"login":"demo","pwd":"1f107eba6bf65b508d87e2bedafd81612351b20abf95a1e46d34c329093aec4d","cam_id":"15529795618302"}
    // Out: {
    //     "code": 100,
    //     "message": "OK",
    //     "data": {
    //         "token": "e2610c6b77782e2f5778e74fbb6eb6ef78b74a955c32125273a2f30fe5030147_5_1576678109"
    //     }
    // }
    getFileToken(server: Server, login: Login, camId: number): Promise<FileGetToken> {
        // let s = JSON.stringify(login);
        // let postData = s.replace('}', ',') + '"cam_id":' + camId + '}';
        let jsonLogin = login.toJSON();
        let jsonCam = { 
            // cam: {
                cam_id: camId
            // }
        };
        const jsonCombined = Object.assign(jsonLogin, jsonCam); 
        const postData = JSON.stringify(jsonCombined);
        const userUrl = 'https://' + server.server_addr + '/v1/file_token_get.php';
        return this.http
                .post(userUrl, postData)
                .toPromise()
                .then((res:ServerResponse) => res.data as FileGetToken)
                .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
//      console.error('Main user get failed', error);
        return Promise.reject(error.message || error);
    }

}
