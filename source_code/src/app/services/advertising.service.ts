import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';
import { App as AppService } from './app.service';

@Injectable()
export class AdvertisingService {
    
    constructor(
        private _http: AppHttpService
    ) {

    }

    get(): Observable<any> {
        let layoutConfig = AppService.getConfig('layout');
        let params = { w: window.innerWidth, h: layoutConfig.advHeight, page: 1, limit: 1};
        return this._http.get('ads', params).map((response: Response) => response.json());
    }

}