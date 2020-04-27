import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PublicAddressService {

    constructor(private http: HttpClient) {
    }

    public getPublicAddress(): Promise<any> {
        // console.log('getPublicAddress()');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","cam":{"cam_id":12345}}

        // console.log(postData);
        var camPublicAddressUrl = 'https://tinycammonitor.com/api/v1/public_address.php';
        return this.http
            .get(camPublicAddressUrl)
            .toPromise()
            // .then(response => response.json())
            .catch(this.handleError);
        // {"public_address":"77.219.15.20"}
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
