import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../services/user.service';
import { MainService } from '../services/main.service';
import { LoginService } from '../services/login.service';
import { App as AppService } from '../services/app.service';
import { Message } from '../services/message.service';

@Component({
    selector: 'app-my-page-view',
    templateUrl: '../views/my-page.component.html'
})
export class MyPageComponent implements OnInit, OnDestroy {
    public listHeight: number = 0;
    public userLogged: any = {};
    public showForm: boolean = false;
    public stores: any[] = [];
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _ngZone: NgZone,
        private _userService: UserService,
        private _mainService: MainService,
        private _loginService: LoginService
    ) {
        Observable.timer(0).subscribe(() => {
            this.listHeight = AppService.getStorage('mainH');
        });
    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'right') {
                    this._loginService.userLogged.nickname = this.userLogged.nickname;
                    this._loginService.userLogged.comment = this.userLogged.comment;
                    this._loginService.userLogged.usetxt = this.userLogged.usetxt;
                    this._loginService.userLogged.avatar = this.userLogged.image;
                    this._loginService.userLogged.stores = this.userLogged.clubs;

                    this._router.navigate(['/profile-setting']);
                }
            }
        });

        this.loadData();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadData() {
        this._userService.getProfile().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.userLogged = response.data;

                    let nickname = 'マイページ';

                    if (this.userLogged.nickname != null) {
                        nickname = this.userLogged.nickname + 'さん' + nickname;
                    }

                    this._mainService.notifyOther({
                        option: 'changeTitleAction',
                        value: nickname
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

    logout() {
        this._userService.logout().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this._loginService.logout();
                    this._router.navigate(['login']);
                } else {
                    console.log(JSON.stringify(response));
                }
            },
            (error: any) => {
                console.log(JSON.stringify(error));
            }
        );
    }

    deleteStore(storeDelete: any) {
        this._mainService
            .showConfirmDialog(Message.get('確かに削除店ですか？'))
            .then((result: any) => {
                let storeIds = [];

                this.userLogged.clubs.forEach((store, index) => {
                    if (store.id != storeDelete.id) {
                        storeIds.push(store.id);
                    }
                });

                let data: any = storeIds.length != 0 ? { clubs: storeIds } : { 'clubs[]': '' };

                this._userService.registerProfileBrowser(data).subscribe((response: any) => {
                    if (response.code == 200) {
                        this.userLogged.clubs = this.userLogged.clubs.filter(item => item.id !== storeDelete.id);
                    } else {
                        console.log(response);
                    }
                }, error => {
                    console.log(error);
                });

                this._mainService.setShowDialog(false);
            }).catch(() => {
                this._mainService.setShowDialog(false);
            });
    }
}