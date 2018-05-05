import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class CityService {
    
    constructor(
        private _http: AppHttpService
    ) {

    }

    getList(): Observable<any> {
        return this._http.get('city').map((response: Response) => response.json());
    }

    getListCitiesClubs(limit: number, page: number) {
        return this._http.get('city/club', { limit: limit, page: page }).map((response: Response) => response.json());
    }

}