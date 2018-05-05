import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { App as AppService } from '../services/app.service';

@Injectable()
export class FriendListService {

    public friends: any = [];
    public page: number = AppService.getConfig('page');
    public limit: number = AppService.getConfig('limit');
    public scrollTop: number = 0;
    
    public setIsReadFriend(friendId: number, isRead: number = 0) {
        this.friends.forEach((item: any, index: number) => {
            if (friendId == item.id) {
                this.friends[index].message_flag = isRead;
            }
        });
    }
}