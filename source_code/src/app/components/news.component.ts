import { Component, NgZone, OnInit, AfterViewChecked, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/pairwise';

import { NewsService } from '../services/news.service';
import { NewsListService } from '../services/news-list.service';
import { MainService } from '../services/main.service';
import { App as AppService } from '../services/app.service';

@Component({
    selector: 'app-news-view',
    templateUrl: '../views/news.component.html'
})
export class NewsComponent implements OnInit, OnDestroy, AfterViewChecked {

    public listHeight: number = 0;
    public scrollThrottle: number = 0;
    private _subscription: Subscription;

    @ViewChild('scrollList') private _listScroll: ElementRef;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _newsService: NewsService,
        private _mainService: MainService,
        private _ngZone: NgZone,
        private _platformLocation: PlatformLocation,
        public newsListService: NewsListService
    ) {
        Observable.timer(0).subscribe(() => {
            this.listHeight = AppService.getStorage('mainH');
        });
        this.scrollThrottle = 1000;
    }

    ngOnInit() {
        if (this.newsListService.news.length == 0 || this._mainService.prevUrl !== '/news-detail') {
            this.newsListService.news = [];
            this.newsListService.page = AppService.getConfig('page');
            this.newsListService.limit = AppService.getConfig('limit');
            this.newsListService.scrollTop = 0;
            this.loadData();
        }
    }

    ngAfterViewChecked() {
        this._listScroll.nativeElement.scrollTop = this.newsListService.scrollTop;
    }

    ngOnDestroy() {
        //this._subscription.unsubscribe();
    }

    loadData() {
        this._newsService.getList(this.newsListService.limit, this.newsListService.page).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    if (response.data.data.length > 0) {
                        this.newsListService.page = this.newsListService.page + 1;
                        this.newsListService.news = this.newsListService.news.concat(response.data.data);
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
        this.newsListService.scrollTop = event.srcElement.scrollTop;
    }

    onScrollDown() {
        if (!this._mainService.loading) {
            this.loadData();
        }
    }

    onScrollUp() {

    }

    viewDetail(news: any) {
        localStorage.setItem('viewDetailNew', JSON.stringify(news));
        this._router.navigate(['/news-detail']);
    }
}