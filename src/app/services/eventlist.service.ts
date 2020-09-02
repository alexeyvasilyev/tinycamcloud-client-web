import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login, Server, EventRecord, ServerResponse } from '../models'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class EventListService {

    private MIN_DURATION_EVENT_MSEC = 3000;

    constructor(private http: HttpClient) {
    }

    getEventListByDate(server: Server, login: Login, camId: number, date: Date, limit: number): Promise<EventRecord[]> {
        return this.getEventList(server, login, camId, -1, date, limit, this.MIN_DURATION_EVENT_MSEC);
    }

    getEventListById(server: Server, login: Login, camId: number, eventId: number, limit: number): Promise<EventRecord[]> {
        return this.getEventList(server, login, camId, eventId, null, limit, this.MIN_DURATION_EVENT_MSEC);
    }

    private getEventList(server: Server, login: Login, camId: number, eventId: number, date: Date, limit: number, minDuration: number): Promise<EventRecord[]> {
        // console.log('getEventList(camId=' + camId + ', eventId=' + eventId + ', date=' + date + ', limit=' + limit + ')');
        // {"login":"eu","pwd":"9fd858c200d2cad1d6b5e587e96e6dfb1e6a8bd9de359861608800f052327f57","event":{"event_id":0,"limit":25,"is_finished":1}}

        let jsonLogin = login.toJSON();
        var jsonEvent: any;
        if (eventId < 0) {
            jsonEvent = {
                event: {
                    date: date.toISOString(),
                    limit: limit,
                    min_duration: minDuration
                }
            };
        } else {
            jsonEvent = {
                event: {
                    event_id: eventId,
                    limit: limit,
                    min_duration: minDuration
                }
            };
        }

        var jsonCam = {};
        if (camId != -1) {
            jsonCam = { 
                cam: {
                    cam_id: camId
                }
            };
        }

        const jsonCombined = Object.assign(jsonLogin, jsonEvent, jsonCam);
        const postData = JSON.stringify(jsonCombined);
        const camListUrl = 'https://' + server.server_addr + "/v1/event_list.php";
        return this.http
            .post<ServerResponse>(camListUrl, postData)
            .toPromise()
            .then((res:ServerResponse) => res.data as EventRecord[])
            .catch(this.handleError);
        //[{"id":10,"cam_id":1444908568,"date":"2015-10-19 13:50:05","image":"2015-10-19_16:50:05_sen786945787.jpg",
        //  "video":"2015-10-19_16:50:05_rec.mp4","video_offset":17183,"duration":null,"has_audio":0,
        //  "has_video":1,"audio_level":0,"video_level":786945787}]
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
