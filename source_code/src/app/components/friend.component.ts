import { Component, OnInit, AfterViewChecked, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { MainService } from '../services/main.service';
import { FriendService } from '../services/friend.service';
import { FriendListService } from '../services/friend-list.service';
import { App as AppService } from '../services/app.service';
import { Message } from '../services/message.service';

@Component({
    selector: 'app-friend-view',
    templateUrl: '../views/friend.component.html'
})
export class FriendComponent implements OnInit, OnDestroy, AfterViewChecked {

    public listHeight: number = 0;
    public scrollThrottle: number = 0;
    private _subscription: Subscription;

    @ViewChild('scrollList') private _listScroll: ElementRef;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService,
        private _friendService: FriendService,
        public friendListService: FriendListService
    ) {
        Observable.timer(0).subscribe(() => {
            this.listHeight = AppService.getStorage('mainH');
        });
        this.scrollThrottle = 1000;
    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/friend-map'])
                }

                if (res.value == 'right') {
                    this._router.navigate(['/friend-search'])
                }
            }
        });

        let prevUrlList: any = ['/friend-map', '/friend-chat'];

        let isBack = false;

        prevUrlList.forEach(url => {
            if (this._mainService.prevUrl && this._mainService.prevUrl.indexOf(url) !== -1) {
                isBack = true;
            }
        });

        if (this.friendListService.friends.length == 0 || isBack === false) {
            this.friendListService.friends = [];
            this.friendListService.page = AppService.getConfig('page');
            this.friendListService.limit = AppService.getConfig('limit');
            this.friendListService.scrollTop = 0;
            this.loadData();
        }
    }

    ngAfterViewChecked() {
        this._listScroll.nativeElement.scrollTop = this.friendListService.scrollTop;
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadData() {
        this._friendService.getList(this.friendListService.limit, this.friendListService.page).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    if (response.data.data.length > 0) {
                        this.friendListService.page = this.friendListService.page + 1;
                        this.friendListService.friends = this.friendListService.friends.concat(response.data.data);
                    }
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    gotoChat(item) {
        AppService.setSession('friend.chat', item);
        this._router.navigate(['/friend-chat/' + item.id]);
    }

    onScroll(event) {
        this.friendListService.scrollTop = event.srcElement.scrollTop;
    }

    onScrollDown() {
        if (!this._mainService.loading) {
            this.loadData();
        }
    }

    onScrollUp() {

    }

    deleteFriend(friend: any) {
        this._mainService
            .showConfirmDialog(Message.get('確かに削除フレンドですか？'))
            .then((result: any) => {
                this._friendService.updateFriend(friend.id, 'delete').subscribe(
                    (response: any) => {
                        if (response.code == 200) {
                            this.friendListService.friends = this.friendListService.friends.filter(item => item.id !== friend.id);
                        } else {
                            console.log(response);
                        }
                    },
                    (error: any) => {
                        console.log(error);
                    }
                );
                this._mainService.setShowDialog(false);
            }).catch(() => {
                this._mainService.setShowDialog(false);
            });
    }
    
    accessFriend(friend: any) {
        this._friendService.updateFriend(friend.id, 'accepted').subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.friendListService.friends.forEach((item: any, index: number) => {
                        if (friend.id == item.id) {
                            this.friendListService.friends[index].status = 1;
                        }
                    });
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    deniedFriend(friend: any) {
        this._friendService.updateFriend(friend.id, 'denied').subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.friendListService.friends = this.friendListService.friends.filter(item => item.id !== friend.id);
                } else {
                    console.log(response);
                }
            }, (error: any) => {
                console.log(error);
            }
        );
    }
}