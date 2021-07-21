// cam_enabled: 1
// cam_id: "14994518606566"
// cam_last_error: "dvr_62"
// cam_login: "root"
// cam_name: "Chi Drive"
// cam_prop_mask: 1
// cam_proto: "rtsp"
// cam_proto_port: 88
// cam_pwd: "pwd"
// cam_request: "/videoMain"
// cam_request_sub: "/videoSub"
// cam_schedule: ""
// cam_uid: "chichesterm.tgs-secure.co"
// cam_video_mask: "ffff,8001,8001,8001,8001,8001,8001,8001,ffff"
// cam_video_sens: 35
// cam_web_port: -1
// info: "You have 7 free demo days since: 2017-07-08T15:20:45Z"
// state: "Active"

export class CameraSettings {
    cam_enabled: boolean;
    cam_id: number;
    cam_last_error: string;
    cam_name: string;
    cam_proto: string;
    cam_proto_port: number;
    cam_prop_mask: number;
    cam_login: string;
    cam_pwd: string;
    cam_request: string;
    cam_request_sub: string;
    cam_uid: string;
    cam_mac: string;
    cam_video_mask: string;
    cam_video_sens: number;
    cam_audio_sens: number;
    cam_storage_use: number;
    cam_bandwidth_use: number;
    state: string;
    info: string;

    // isSubstream: boolean;
    // requestMain: string;
    // requestSub: string;

    public static readonly DEFAULT_VIDEO_MASK = 'ffff,8001,8001,8001,8001,8001,8001,8001,ffff';
    public static readonly DEFAULT_VIDEO_MASK_COLUMNS = 16;
    public static readonly DEFAULT_VIDEO_MASK_ROWS = 9;

    static getName(cameraSettings: CameraSettings): string {
        if (cameraSettings.state == 'NoCam')
            return "";
        var text = cameraSettings.cam_name;
        if (text == null)
            text = "";
        if (!cameraSettings.cam_enabled)
            text += " (Disabled)";
        return text;
    }

    static isProtoRtsp(cameraSettings: CameraSettings): boolean {
        return "rtsp" == cameraSettings.cam_proto;
    }

    static isProtoP2pTutk(cameraSettings: CameraSettings): boolean {
        return "p2ptutk" == cameraSettings.cam_proto;
    }

    static isProtoP2pWyze(cameraSettings: CameraSettings): boolean {
        return "p2pwyze" == cameraSettings.cam_proto;
    }

    static isProtoP2pNeos(cameraSettings: CameraSettings): boolean {
        return "p2pneos" == cameraSettings.cam_proto;
    }

    static isInError(cameraSettings: CameraSettings): boolean {
        if (cameraSettings.cam_last_error == null || cameraSettings.cam_last_error.length == 0)
            return false;
        return !cameraSettings.cam_last_error.startsWith("info");
    }

    static getHumanReadableError(cameraSettings: CameraSettings): string {
        if (cameraSettings.cam_last_error == null || cameraSettings.cam_last_error.length == 0)
            return null;
        let model = CameraSettings.isProtoP2pNeos(cameraSettings) ? "Neos" : "Wyze";
        switch (cameraSettings.cam_last_error) {
            case "dvr_50":
                return "[Internal error] Invalid number of parameters."; // Bug between DVR and controller
            case "dvr_51":
                return "[Internal error] Unexpected.";
            case "dvr_52":
                return "Request invalid.";
            case "dvr_53":
                return "Port invalid.";
            case "dvr_54":
                return "Hostname invalid.";
            case "dvr_55":
                return "Incorrect username or password.";
            case "dvr_56":
                return "URL error.";
            case "dvr_57":
                return "Protocol invalid.";
            case "dvr_58":
            case "dvr_62":
                return "Timeout. Camera is not responding." +
                  (CameraSettings.isProtoP2pWyze(cameraSettings) || CameraSettings.isProtoP2pNeos(cameraSettings) || CameraSettings.isProtoP2pTutk(cameraSettings) ?
                    "" :
                    " Check public IP address and RTSP port number of the camera.");
            case "dvr_59":
                return "[Internal error] Invalid internal permissions.";
            case "dvr_60":
                return "[Internal error] Process restarted.";
            case "dvr_61":
                return "[Internal error] Database error.";
            // case "dvr_62":
            //     return "[Internal error] Transport timeout.";
            case "dvr_63":
                return "Camera resolution is too high. Max allowed resolution is 2048x1536.";
            case "dvr_65":
                return "Camera is offline.";
            case "dvr_301":
                return "[Internal error] Contact cloud support.";
            case "info_schedule":
                return "Recording and motion stopped by scheduler.";
            case "info_start":
                return "Camera recording started. Please wait.";
            case "info_payment":
                return cameraSettings.state == 'Active' ?
                    "Camera recording is starting. Please wait for a couple minutes." :
                    "No active subscription. Camera is not recording. Go to ACCOUNT tab to make subscription.";

            // Wyze camera specific errors (cam_probe.php only)
            case "ctrl_12":
                return `Device is not a ${model} camera.`;
            case "ctrl_13":
                return `Not such ${model} camera number.`;
            case "ctrl_15":
                return `${model} user is locked.`;
            case "ctrl_16":
                return `${model} login is not successful.`;
            case "ctrl_18":
                return `2FA ${model} via SMS is not supported. Switch to 2FA TOTP or switch off 2FA in ${model} app.`;
            case "ctrl_19":
                return "Incorrect username or password.";
            case "ctrl_114":
                return `Both access and refresh token expired. Need to relogin.`;
            case "ctrl_115":
                return `2FA ${model} TOTP code required.`;

            default:
                return cameraSettings.cam_last_error;
        }
    }

}
