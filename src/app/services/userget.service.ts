import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserGetService {

    constructor(private http: HttpClient) {
    }

    getUser(server: Server, login: Login): Promise<ServerResponse> {
        // console.log('getUser()');
        const postData = JSON.stringify(login);
        const userUrl = 'https://' + server.server_addr + "/v1/user_get.php";
        //  var postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;
        return this.http
                .post(userUrl, postData)
                .toPromise()
                // .then(response => response.json())
                .catch(this.handleError);
// {
//     "code": 100,
//     "message": "OK",
//     "data": {
//         "user": {
//             "demo_available": 1,
//             "notification_key": "",
//             "archive_capacity_days": 7,
//             "archive_duration": 3194155622
//         }
//     }
// }
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred in /v1/user_get.php', error);
        return Promise.reject(error.message || error);
    }

}
