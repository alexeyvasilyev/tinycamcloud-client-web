import * as CryptoJS from 'crypto-js';
// See https://github.com/Uisli21/SecureAngularLogin

export class Login {
    username: string;
    password: string;
    passwordHash: string;
    succeeded: boolean;

    constructor(_username: string, _password: string) {
        this.username = _username;
        this.password = _password;
        this.succeeded = false;
        this.updatePasswordHash();
    }

    clear() {
        this.username = '';
        this.password = '';
        this.succeeded = false;
        this.updatePasswordHash();
    }

    updatePasswordHash() {
        // sha256(sha256(pwd)+login+sha256(login))
        this.passwordHash =
            CryptoJS.SHA256(
                CryptoJS.SHA256(this.password).toString() +
                this.username +
                CryptoJS.SHA256(this.username).toString())
            .toString();
    }

    getUsername() {
        return this.username;
    }

    getPasswordHash() {
    //  console.log('Hash is ', this.passwordHash)
        return this.passwordHash;
    }

    toJSON() {
        // {"login":"eu","pwd":"12345"}
        return { login: this.username, pwd: this.passwordHash };
        // return `{"login":"` + this.username + `","pwd":"` + this.passwordHash + `"}`;
    }

}
