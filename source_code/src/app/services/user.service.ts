import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';
import { LoginService } from './login.service';

@Injectable()
export class UserService {

    public profileInput = {
        nickname: '',
        comment: '',
        usetxt: ''
    };

    constructor(
        private _http: AppHttpService,
        private _loginService: LoginService
    ) {

    }

    login(data: any): Observable<any> {
        return this._http.post('auth/login', data).map((response: Response) => response.json());
    }

    logout(): Observable<any> {
        let userLogged: any = this._loginService.getUserLogged();
        let data: any = {};
        if(userLogged && userLogged.socialType == 0) {
            data.email = userLogged.email;
            data.password = userLogged.password;
        }
        
        return this._http.get('auth/logout', data).map((response: Response) => response.json());
    }

    socialLogin(data: any): Observable<any> {
        return this._http.post('auth/socialLogin', data).map((response: Response) => response.json());
    }

    signup(data: any): Observable<any> {
        return this._http.post('auth/register', data).map((response: Response) => response.json());
    }

    registerProfileDevice(file: any, data: any, onSuccess = (res) => {}, onError = (err) => {}) {
        return this._http.deviceUpload('user/profile', file, data, onSuccess, onError);
    }

    registerProfileBrowser(data: any): Observable<any> {
        return this._http.post('user/profile', data).map((response: Response) => response.json());
    }

    getProfile(): Observable<any> {
        return this._http.get('user/profile').map((response: Response) => response.json());
    }

    setProfileInput(nickname: string = '', comment: string = '', usetxt: string = '') {
        this.profileInput.nickname = nickname;
        this.profileInput.comment = comment;
        this.profileInput.usetxt = '';
    }

    getSetting(): Observable<any> {
        return this._http.get('user/setting').map((response: Response) => response.json());
    }

    updateSetting(data: any): Observable<any> {
        return this._http.put('user/setting', data).map((response: Response) => response.json());
    }

    forgotPassword(data: any): Observable<any> {
        return this._http.post('auth/forgot', data).map((response: Response) => response.json());
    }

}