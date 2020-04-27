import { Server, Login, FileGetToken } from "./models";

export default class JsonUtils {

    // http://10.0.1.50/archive_file.php?data={"login":"test2","pwd":"097218ab91e91cd9c7b405b2b26e3a277a80010fc5793f380fb1f0a160c7c14a","file":{"name":"2015-08-31_15:01:32_rec.mp4"}}
    // data={"login":"test2","pwd":"097218ab91e91cd9c7b405b2b26e3a277a80010fc5793f380fb1f0a160c7c14a","file":{"name":"2015-08-31_15:01:32_rec.mp4", "cam_id":1444908568}}
    static getArchiveFilename(server: Server, login: Login, filename: string, camId: number, date: string): string {
        let s = JSON.stringify(login);
        let getData;
        // if (date != null)
            getData = s.replace('}', ',') + '"file":{"name":"' + filename + '","cam_id":' + camId + ',"date":"' + date + '"}}';
        // else
            // getData = s.replace('}', ',') + '"file":{"name":"' + filename + '","cam_id":' + camId + '"}}';
        getData = encodeURIComponent(getData);
        let request = 'https://' + server.server_addr + '/v1/archive_file.php?data=' + getData;
        return request;
    }

    // static getArchiveFilename(server: Server, login: Login, filename: string, camId: number): string {
    //     let getData = JSON.stringify(login).replace('}', ',') + '"file":{"name":"' + filename + '","cam_id":' + camId + '"}}';
    //     getData = encodeURIComponent(getData);
    //     let request = 'https://' + server.server_addr + '/v1/archive_file.php?data=' + getData;
    //     return request;
    // }

    // In: {"login":"demo","pwd":"1f107eba6bf65b508d87e2bedafd81612351b20abf95a1e46d34c329093aec4d","cam_id":"15529795618302"}
    // Out: {
    //     "code": 100,
    //     "message": "OK",
    //     "data": {
    //         "token": "e2610c6b77782e2f5778e74fbb6eb6ef78b74a955c32125273a2f30fe5030147_5_1576678109"
    //     }
    // }
    // static getFileToken(server: Server, login: Login, camId: number): string {
    //     let s = JSON.stringify(login);
    //     let getData = s.replace('}', ',') + '"cam_id":' + camId + '}}';
    //     getData = encodeURIComponent(getData);
    //     let request = 'https://' + server.server_addr + '/v1/file_token_get.php?data=' + getData;
    //     return request;
    // }

    // In: {"login":"demo","cam_id":"15529795618302","name":"live.m3u8","token":"e2610c6b77782e2f5778e74fbb6eb6ef78b74a955c32125273a2f30fe5030147_5_1576678109"}
    // Out: File content
    static getFile(server: Server, login: Login, camId: number, fileGetToken: FileGetToken, filename: string): string {
        let s = JSON.stringify(login);
        let getData = '{"login":"' + login.username + '","cam_id":' + camId + ',"token":"' + fileGetToken.token + '","name":"' + filename + '"}';
        getData = encodeURIComponent(getData);
        let request = 'https://' + server.server_addr + '/v1/file_get.php?data=' + getData;
        return request;
    }

    static getFileMp4(server: Server, login: Login, camId: number, fileGetToken: FileGetToken, filename: string, date: string): string {
        let s = JSON.stringify(login);
        let getData = '{"login":"' + login.username + '","cam_id":' + camId + ',"token":"' + fileGetToken.token + '","name":"' + filename + '","date":"' + date + '"}';
        getData = encodeURIComponent(getData);
        let request = 'https://' + server.server_addr + '/v1/file_get.php?data=' + getData;
        return request;
    }

}
