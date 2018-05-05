import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class ScoreService {

    constructor(
        private _http: AppHttpService
    ) {

    }

    getListScore(params: Object): Observable<any> {
        return this._http.get('game', params)
            .map((response: Response) => response.json());
    }
}