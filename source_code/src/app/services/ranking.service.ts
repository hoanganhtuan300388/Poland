import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class RankingService {

    constructor(
        private _http: AppHttpService
    ) {

    }

    getList(type: string = null, id: number = null): Observable<any> {
        return this._http.get('ranking', { type: type, id: id }).map((response: Response) => response.json());
    }

}