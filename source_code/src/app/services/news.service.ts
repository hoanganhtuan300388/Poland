import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class NewsService {

    constructor(
        private _http: AppHttpService
    ) {

    }

    getList(limit: number, page: number): Observable<any> {
        return this._http.get('news', { limit: limit, page: page }).map((response: Response) => response.json());
    }

}