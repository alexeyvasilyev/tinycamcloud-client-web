import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, CameraSettings, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PaymentSubscribeService {

    constructor(private http: HttpClient) {
    }

    subscribe(server: Server, login: Login, camId: number, planId: number): Promise<ServerResponse> {
        var postData = JSON.stringify(login).replace('}', ',') + '"cam_id":' + camId + ',"plan_id":' + planId + '}';
        let subscribeUrl = 'https://' + server.server_addr + "/v1/payment_subscribe.php";
        // var postData = '{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","cam_id":"888","plan_id":"1"}'
        return this.http
                .post(subscribeUrl, postData)
                .toPromise()
                // .then((data:Response) => data.data.user as Server)
                // .then(response => response.json())
                .catch(this.handleError);
        // {
        //     "code": 100,
        //     "message": "OK",
        //     "data": {
        //         "link": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-4RE047411H063005S",
        //         "token": "EC-4RE047411H063005S"
        //     }
        // }
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
