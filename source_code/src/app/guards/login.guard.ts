import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { LoginService } from '../services/login.service';

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(
        private _route: Router,
        private _loginService: LoginService
    ) {

    }

    canActivate() {
        let userLogged: any = this._loginService.getUserLogged();
        
        if (userLogged && userLogged.isLogged !== true) {
            this._route.navigate(['login']);
        }

        return userLogged && userLogged.isLogged;
    }

}