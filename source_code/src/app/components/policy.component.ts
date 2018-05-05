import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MainService } from '../services/main.service';
import { PageService } from '../services/page.service';
import { App as AppService } from '../services/app.service';

@Component({
    selector: 'app-policy-view',
    templateUrl: '../views/policy.component.html'
})
export class PolicyComponent {
    public content: string = '';
    public mainH: number = 0;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService,
        private _pageService: PageService
    ) {
        this.mainH = AppService.getStorage('mainH');
    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/my-page'])
                }
            }
        });

        this.loadData();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadData() {
        this._pageService.getPage('policy').subscribe(
            (response: any) => {
                if (response.code == 200) {
                    if(response.data) {
                        this.content = response.data.content;
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
}