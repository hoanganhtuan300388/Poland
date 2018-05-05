import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MainService } from '../services/main.service';

@Component({
    selector: 'app-store-detail-view',
    templateUrl: '../views/store-detail.component.html'
})
export class StoreDetailComponent {
    public store: any;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService
    ) {

    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/store'])
                }
            }
        });

        this.store = JSON.parse(localStorage.getItem('viewDetailStore'));
        console.log(this.store);
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}