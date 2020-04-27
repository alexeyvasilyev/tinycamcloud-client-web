import { Injectable } from '@angular/core';
import { Login, Server } from '../models'

@Injectable()
export class LoginService {

    public login  = new Login('', '');
    public server = new Server();

    constructor() {
    }

}
