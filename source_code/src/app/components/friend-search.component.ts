import { Component, OnInit, OnDestroy, trigger, transition, style, animate, state } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MainService } from '../services/main.service';
import { FriendService } from '../services/friend.service';
import { App as AppService } from '../services/app.service';

@Component({
    selector: 'app-friend-search-view',
    templateUrl: '../views/friend-search.component.html'
})
export class FriendSearchComponent implements OnInit, OnDestroy {
    public users = [];
    public listHeight: number = 0;
    public searchOptions: any;
    public dialogDisabled: boolean = true;
    private _type: number = null;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService,
        private _friendService: FriendService
    ) {
        this.listHeight = window.innerHeight - 105;

        this.searchOptions = [
            { value: 1, label: '登録店が同じ' },
            { value: 2, label: 'プレイレベルが自分と同等' }
        ];
    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/friend']);
                }

                if (res.value == 'right') {
                    this.openDialog();
                }
            }
        });
        
        this.loadData();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadData() {
        this._friendService.searchFriend(50, 1, this._type).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    if(response.data.data.length > 0) {
                        this.users = response.data.data;
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

    addFriend(friendId: number) {
        this._friendService.addFriend(friendId).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.users = this.users.filter(item => item.id !== friendId);
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    openDialog() {
        this.dialogDisabled = false;
    }

    closeDialog() {
        this.dialogDisabled = true;
    }

    searchFriend(from: any) {
        this.users = [];
        this._type = from.value.typeSearch;
        this.loadData();
        this.dialogDisabled = true;
    }
}