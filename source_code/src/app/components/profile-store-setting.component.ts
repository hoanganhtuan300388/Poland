import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { App as AppSerive } from '../services/app.service';
import { UserService } from '../services/user.service';
import { CityService } from '../services/city.service';
import { StoreService } from '../services/store.service';
import { LoginService } from '../services/login.service';
import { MainService } from '../services/main.service';
import { ValidationService } from '../services/validate.service';

declare var navigator;
declare var CameraPopoverOptions;

@Component({
    selector: 'app-profile-store-setting-view',
    templateUrl: '../views/profile-store-setting.component.html'
})
export class ProfileStoreSettingComponent implements OnInit, OnDestroy {
    public profileStoreForm: any;
    public cities: any = [];
    public stores: any = [];
    public user: any;
    private _id: number;
    private _subscription: Subscription;
    private _isSwift: boolean = false;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _cityService: CityService,
        private _storeService: StoreService,
        private _loginService: LoginService,
        private _mainService: MainService,
        private _formBuilder: FormBuilder,
        private _ngZone: NgZone
    ) {

    }

    ngOnInit() {
        this._isSwift = this._mainService.prevUrl === '/profile-setting' ? false : true;

        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    if (this._mainService.prevUrl) {
                        if (this._isSwift == false) {
                            this._router.navigate(['/profile-setting']);
                        } else {
                            this._router.navigate([this._mainService.prevUrl]);
                        }
                    } else {
                        this._router.navigate(['/my-page']);
                    }
                }
            }
        });

        this.profileStoreForm = this._formBuilder.group({
            'city': ['', []],
            'store': ['', []]
        });

        if (this._isSwift === true) {
            this.loadProfile();
        }

        this.loadDataCity();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadDataCity() {
        this._cityService.getList().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.cities = response.data;
                    if (this.cities) {
                        this.loadDataStore(this.cities[0].id);
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

    loadDataStore(cityId: number) {
        this._storeService.getListByCityID(cityId).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.stores = [];
                    response.data.forEach(store => {
                        let chk: boolean = false;
                        this._loginService.userLogged.stores.forEach(choise => {
                            if (store.id == choise.id) {
                                chk = true;
                                return;
                            }
                        });

                        store.isChoise = chk;
                        this.stores.push(store);
                    });

                    if (this.stores) {
                        this.restartForm(cityId, null);
                        console.log(response);
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

    loadProfile() {
        this._userService.getProfile().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this._loginService.userLogged.nickname = response.data.nickname;
                    this._loginService.userLogged.comment = response.data.comment;
                    this._loginService.userLogged.usetxt = '';
                    this._loginService.userLogged.stores = response.data.clubs;
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    restartForm(defaultCityId: number = null, defaultStore: any = null) {
        this.profileStoreForm = this._formBuilder.group({
            'city': [defaultCityId, []],
            'store': [defaultStore, []]
        });
    }

    choiseCity($event) {
        this.loadDataStore($event.target.value);
    }

    choiseStore() {
        this.choiseProfileStore();
    }

    choiseProfileStore() {
        if (this.profileStoreForm.dirty && this.profileStoreForm.valid) {
            if (this._isSwift === false) {
                Observable.timer(0).subscribe(() => {
                    this._loginService.setStoresChoise(this.profileStoreForm.value.store);
                    this._router.navigate(['/profile-setting']);
                });
            } else {
                this.updateStore(this.profileStoreForm.value.store);
            }
        }
    }

    updateStore(store: any) {
        this._loginService.userLogged.stores = this._loginService.userLogged.stores.concat(store);

        let storeIds = [];

        this._loginService.userLogged.stores.forEach((store, index) => {
            storeIds.push(store.id);
        });

        let data: any = {
            nickname: this._loginService.userLogged.nickname,
            comment: this._loginService.userLogged.comment,
            usetxt: '',
            clubs: storeIds
        };

        this._userService.registerProfileBrowser(data).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    AppSerive.setSession('score.club', store);
                    this._router.navigate(['/score-add']);
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