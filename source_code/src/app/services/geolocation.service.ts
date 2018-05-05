import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Response} from '@angular/http';
import { App } from '../services/app.service';
import { AppHttpService } from './app-http.service';

@Injectable()
export class GeolocationService {
    constructor(
        protected _http: AppHttpService
    ) {
        this._http.disableShowLoading();
    }

    getGeolocation(params: Object): Observable<any> {
        return this._http.get('user/position', params)
            .map((response: Response) => response.json());
    }

    sendToApi(position): Observable<any> {
        let lastPosition = App.getStorage('geolocation'),
            params = {
                lat: (position.coords && position.coords.latitude) ? position.coords.latitude : 0,
                long: (position.coords && position.coords.longitude) ? position.coords.longitude : 0
            }

        if(!lastPosition
            || (lastPosition && (lastPosition.lat !== params.lat)
                || (lastPosition.long !== params.long))) {

            lastPosition = params;
            App.setStorage('geolocation', lastPosition);
        }
        if(lastPosition.lat && lastPosition.long) {

            return this._http.put('user/position', lastPosition)
                .map((response: Response) => response.json());
        }
        return Observable.of(lastPosition);

    }
}