import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class StoreService {
    constructor(
        private _http: AppHttpService
    ) {

    }

    getListByCityID(cityId: number): Observable<any> {
        return this._http.get('club/city', { city_id: cityId }).map((response: Response) => response.json());
    }

    getList() {
        return this._http.get('stores').map((response: Response) => response.json());
    }
}