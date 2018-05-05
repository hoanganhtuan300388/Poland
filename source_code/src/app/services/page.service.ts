import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class PageService {

    constructor(
        private _http: AppHttpService
    ) {

    }

    getPage(alias: string): Observable<any> {
        return this._http.get('page', { alias: alias }).map((response: Response) => response.json());
    }
}