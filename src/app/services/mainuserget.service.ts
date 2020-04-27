import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

//    http://cloud.tinycammonitor.com/v1/main_user_get.php
//    {"login":"run"}
//    {"code":100,"message":"OK","data":{"user":{"server":"23.101.55.100","server_name":"server1"}}}

@Injectable()
export class MainUserGetService {

    private mainUserGetUrl = 'https://cloud.tinycammonitor.com/v1/main_user_get.php';  // URL to web api
//  private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: HttpClient) {
    }

    // getOneProspect(input)
    //    .then((data: any[]) => {
    //        const prospect = // filter data here
    //        return prospect;
    // }
    getMainUser(login: Login): Promise<Server> {
        var postData = '{"login":"' + login.getUsername() + '"}';
        return this.http
                .post(this.mainUserGetUrl, postData)
                .toPromise()
//              .then(response => response.json().data.user.server_addr as string)
                // .then(response => response.data.user as Server)
                .then((data:ServerResponse) => data.data.user as Server)
                // .then(data => {
                //     return data.user as Server;
                // })
                // .then((data => {
                //     return data.user as Server;
                // })
                .catch(this.handleError);
        // {"code":100,"message":"OK","data":{"user":{"server_addr":"52.178.37.238","server_name":"server2"}}}
    }

    private handleError(error: any): Promise<any> {
//      console.error('Main user get failed', error);
        return Promise.reject(error.message || error);
    }

}
