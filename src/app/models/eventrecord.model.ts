// OUTPUT: [{"event_id":10,"cam_id":1444908568,"date":"2015-10-19 13:50:05","image":"2015-10-19_16:50:05_sen786945787.jpg",
//           "video":"2015-10-19_16:50:05_rec.mp4","video_offset":17183,"duration":null,"has_audio":0,
//           "has_video":1,"audio_level":0,"video_level":786945787}]

export class EventRecord {
    event_id: number;
    cam_id: number;
    date: string;
    image: string;
    video: string;
    video_offset: number;
    duration: number;
    has_audio: number;
    has_video: number;
    audio_level: number;
    video_level: number;
    is_finished: number;
}
