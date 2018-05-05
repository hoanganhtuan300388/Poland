import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { CityService } from '../services/city.service';
import { StoreService } from '../services/store.service';
import { LoginService } from '../services/login.service';
import { MainService } from '../services/main.service';
import { ValidationService } from '../services/validate.service';

declare var navigator;
declare var CameraPopoverOptions;

@Component({
    selector: 'app-profile-store-view',
    templateUrl: '../views/profile-store.component.html'
})
export class ProfileStoreComponent implements OnInit, OnDestroy {
    public profileStoreForm: any;
    public cities: any = [];
    public stores: any = [];
    public user: any;
    private _id: number;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _cityService: CityService,
        private _storeService: StoreService,
        private _loginService: LoginService,
        private _mainService: MainService,
        private _formBuilder: FormBuilder,
        private _ngZone: NgZone
    ) {

    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/profile']);
                }
            }
        });

        this.profileStoreForm = this._formBuilder.group({
            'city': ['', []],
            'store': ['', []]
        });

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
                    console.log(JSON.stringify(response));
                }
            },
            (error: any) => {
                console.log(JSON.stringify(error));
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
                    console.log(JSON.stringify(response));
                }
            },
            (error: any) => {
                console.log(JSON.stringify(error));
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
            Observable.timer(0).subscribe(() => {
                this._loginService.setStoresChoise(this.profileStoreForm.value.store);
                this._router.navigate(['/profile']);
            });
        }
    }
}