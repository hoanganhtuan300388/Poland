import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppHttpService } from './app-http.service';

@Injectable()
export class FriendService {

    constructor(
        private _http: AppHttpService
    ) {

    }

    getList(limit: number, page: number): Observable<any> {
        return this._http.get('friend', { limit: limit, page: page }).map((response: Response) => response.json());
    }

    searchFriend(limit: number, page: number, type: number = null): Observable<any> {
        return this._http.get('friend/new', { limit: limit, page: page, type: type }).map((response: Response) => response.json());
    }

    addFriend(friendId: number): Observable<any> {
        return this._http.post('friend/add', { friend_id: friendId }).map((response: Response) => response.json());
    }

    getFriendMap() {
        return this._http.get('friend/map').map((response: Response) => response.json());
    }

    updateFriend(friendId: number, type: string = 'accepted'): Observable<any> {
        return this._http.post('friend/update', { friend_id: friendId, type: type }).map((response: Response) => response.json());
    }

    updateStatusMessage(friendId: number, message_flag: number = 1): Observable<any> {
        return this._http.post('friend/update', { friend_id: friendId, type: 'message', message_flag: message_flag }).map((response: Response) => response.json());
    }
}