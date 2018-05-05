import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { MainService } from '../services/main.service';
import { App as AppService } from '../services/app.service';

@Component({
    selector: 'app-news-detail-view',
    templateUrl: '../views/news-detail.component.html'
})
export class NewsDetailComponent {
    public news: any;
    public mainH: number = 0;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService
    ) {
        Observable.timer(0).subscribe(() => {
            this.mainH = AppService.getStorage('mainH');
        });
    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    //this._router.navigate(['/news']);
                    window.history.back();
                }
            }
        });

        this.news = JSON.parse(localStorage.getItem('viewDetailNew'));
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}