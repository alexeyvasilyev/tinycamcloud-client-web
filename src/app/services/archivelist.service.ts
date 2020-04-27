import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, ServerResponse, ArchiveRecord } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ArchiveListService {

    constructor(private http: HttpClient) {
    }

    getArchiveListByDate(server: Server, login: Login, camId: number, date: Date, limit: number): Promise<ArchiveRecord[]> {
        return this.getArchiveList(server, login, camId, -1, date, limit);
    }

    getArchiveListById(server: Server, login: Login, camId: number, fileId: number, limit: number): Promise<ArchiveRecord[]> {
        return this.getArchiveList(server, login, camId, fileId, null, limit);
    }

//{"code":100,"message":"OK","data":
//[{"file_id":1,"cam_id":1,"name":"2016-03-21_14:16:23_111.mp4","date":"2016-03-21T14:16:23+00:00","is_finished":1,"preview":"2016-03-21_14:16:23_111.mp4"},{"file_id":1,"cam_id":1,"name":"2016-03-21_14:16:23_111.mp4","date":"2016-03-21T14:16:23+00:00","is_finished":1,"preview":"1458569814668081_111.jpg"}]}
    private getArchiveList(server: Server, login: Login, camId: number, fileId: number, date: Date, limit: number): Promise<ArchiveRecord[]> {
        // console.log('getArchiveList(camId=' + camId + ', fileId=' + fileId + ', date=' + date + ', limit=' + limit + ')');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","event":{"event_id":0,"limit":25,"is_finished":1}}
        let param = date ?
            ('"date":"' + date.toISOString() + '"') :
            ('"file_id":' + fileId);

        var postData = JSON.stringify(login).replace('}', ',') + '"archive":{' + param + ',"limit":' + limit + '}}';
        if (camId != -1) {
            postData = postData.replace('}}', '},') + '"cam":{"cam_id":' + camId + '}}';
        }
        // console.log(postData);
        var archiveListUrl = 'https://' + server.server_addr + "/v1/archive_list.php";
        //  var postData = `{"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57"}`;
        return this.http
            .post<ServerResponse>(archiveListUrl, postData)
            .toPromise()
            .then(res => res.data as ArchiveRecord[])
            .catch(this.handleError);
        //[{"id":10,"cam_id":1444908568,"date":"2015-10-19 13:50:05","image":"2015-10-19_16:50:05_sen786945787.jpg",
        //  "video":"2015-10-19_16:50:05_rec.mp4","video_offset":17183,"duration":null,"has_audio":0,
        //  "has_video":1,"audio_level":0,"video_level":786945787}]
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}
