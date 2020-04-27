import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CamTestService {

    constructor(private http: HttpClient) {
    }

// {"code":100,"message":"OK",
//"data":{"has_audio":1,"has_video":1,"err_text":"","image":":previews:15529795618302.jpg"}}
    public camTest(server: Server, login: Login, camId: number): Promise<ServerResponse> {
        console.log('camTest(camId=' + camId + ')');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","cam":{"cam_id":12345}}

        var postData = JSON.stringify(login);
        if (camId != -1) {
            postData = postData.replace('}', ',') + '"cam":{"cam_id":' + camId + '}}';
            // postData = postData + '",cam":{"cam_id":' + camId + '}}';
        }
        // console.log(postData);
        var camTestUrl = 'https://' + server.server_addr + "/v1/cam_probe.php";
        //  var postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;
        return this.http
            .post<ServerResponse>(camTestUrl, postData)
            .toPromise()
            // .then((res:ServerResponse) => res.data)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}
