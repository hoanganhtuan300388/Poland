import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { App } from '../services/app.service';
import { RankingService } from '../services/ranking.service';
import { CityService } from '../services/city.service';
import { UserService } from '../services/user.service';
import { FriendService } from '../services/friend.service';

@Component({
    selector: 'app-ranking-view',
    templateUrl: '../views/ranking.component.html'
})
export class RankingComponent implements OnInit, OnDestroy {
    public rankings = [];
    public users = [];
    public searchRankingForm: any;
    public dialogDisabled: boolean = true;
    public dialogTitle: string = '';
    public showForm: boolean = false;
    public searchType: string = 'national'; //club,city,national
    public searchTypeAfter: string = 'national'; //club,city,national
    public choises: any = [];
    public wrapHeight: number = 0;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _rankingService: RankingService,
        private _cityService: CityService,
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private _friendService: FriendService
    ) {
        Observable.timer(0).subscribe(()=> {
            this.wrapHeight = parseInt(App.getStorage('mainH'), 10) - 54;
        });
    }

    ngOnInit() {
        this.loadData();
        this.restartForm();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    restartForm() {
        this.searchRankingForm = this._formBuilder.group({
            'choise': ['', [Validators.required]]
        });
    }

    loadData(type: string = null, id: number = null) {
        this._subscription = this._rankingService.getList(type, id).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.rankings = response.data;
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    loadDataCity() {
        this._subscription = this._cityService.getList().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.choises = response.data;
                    this.dialogTitle = '地域を選んでください';
                    this.dialogDisabled = false;
                    this.showForm = true;
                } else {

                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    loadDataStore() {
        this._subscription = this._userService.getProfile().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.choises = response.data.clubs;
                    this.dialogTitle = '店舗を選んでください';
                    this.dialogDisabled = false;
                    this.showForm = true;
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    search(type: string) {
        this.searchType = type;
        if (this.searchType == 'city') {
            this.loadDataCity();
        } else if (this.searchType == 'club') {
            this.loadDataStore();
        } else {
            this.loadData();
        }
        this.searchTypeAfter = this.searchType;
    }

    close() {
        this.dialogDisabled = true;
        this.showForm = false;
    }

    searchRanking() {
        if (this.searchRankingForm.dirty && this.searchRankingForm.valid) {
            this.searchTypeAfter = this.searchType;
            let type: string = this.searchType;
            let id: number = this.searchRankingForm.value.choise;
            this.dialogDisabled = true;
            this.showForm = false;
            this.loadData(type, id);
        }
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
}