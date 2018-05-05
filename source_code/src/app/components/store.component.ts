import { Component, OnInit, AfterViewChecked, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MainService } from '../services/main.service';
import { CityService } from '../services/city.service';
import { StoreListService } from '../services/store-list.service';
import { App as AppService } from '../services/app.service';

@Component({
    selector: 'app-store-view',
    templateUrl: '../views/store.component.html'
})
export class StoreComponent implements OnInit, OnDestroy {
    
    public listHeight: number = 0;
    private _subscription: Subscription;

    @ViewChild('scrollList') private _listScroll: ElementRef;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService,
        private _cityService: CityService,
        public storeListService: StoreListService
    ) {
        this.listHeight = AppService.getStorage('mainH');
    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/my-page'])
                }
            }
        });

        if(this.storeListService.cities.length == 0 || this._mainService.prevUrl !== '/store-detail') {
            this.loadData();
        }
    }

    ngAfterViewChecked() {
        this._listScroll.nativeElement.scrollTop = this.storeListService.scrollTop;
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadData() {
        this._cityService.getListCitiesClubs(200, 1).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    if (response.data) {
                        response.data.data.forEach((city, index) => {
                            city.isShowStore = false;
                            this.storeListService.cities[index] = {
                                id: city.id,
                                name: city.name,
                                isShowStore: false,
                                stores: city.clubs,
                            };
                        });
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

    onScroll(event) {
        this.storeListService.scrollTop = event.srcElement.scrollTop;
    }

    toogleListStore(index) {
        this.storeListService.cities[index].isShowStore = !this.storeListService.cities[index].isShowStore;
    }

    viewDetail(store: any) {
        localStorage.setItem('viewDetailStore', JSON.stringify(store));
        this._router.navigate(['/store-detail']);
    }
}