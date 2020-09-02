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
        let jsonLogin = login.toJSON();
        let jsonPayload = { 
            user: {
                account_info: (accountInfo ? '1' : '0')
            }
        };
        const jsonCombined = Object.assign(jsonLogin, jsonPayload); 
        const postData = JSON.stringify(jsonCombined);
        const camListUrl = 'https://' + server.server_addr + "/v1/cam_list.php";
        return this.http
                .post(camListUrl, postData)
                .toPromise()
                // .then((data) => data)
                .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred in /v1/cam_list.php', error);
        return Promise.reject(error.message || error);
    }

}
