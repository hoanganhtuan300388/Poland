import { Component, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs";
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'underscore';

import { App } from '../services/app.service';
import { MainService } from '../services/main.service';

@Component({
    selector: '',
    template: ''
})
export class BaseComponent implements OnDestroy {
    public listHeight: number = 0;
    public wrapHeight: number = 0;
    public scrollThrottle: number = 0;
    protected page: number = 1;
    protected limit: number = App.getConfig('limit');
    protected loading = false;
	protected disabledLoading = false;

    protected _subscription: Subscription[];
    protected response: any;
    public items: any[];
    public scroller: any;
    protected data: any;

    constructor(
        protected _mainService: MainService
    ) {
        this.data = {};
        this.scrollThrottle = 300;
        this.items = [];
        this.page = 1;
        this._subscription = [];
        this.scroller = {
            //infiniteScrollContainer: 'scrolled',
            infiniteScrollDistance: '2',
            infiniteScrollUpDistance: '1.5',
            infiniteScrollThrottle: '300',
            scrolled: '',
            scrolledUp: '',
            scrollWindow: false,
            immediateCheck: true,
            infiniteScrollDisabled: false,
            horizontal: false,
            alwaysCallback: false,
        };
        Observable.timer(0).subscribe(()=> {
            this.listHeight = parseInt(App.getStorage('mainH'), 10);
            this.wrapHeight = parseInt(App.getStorage('mainH'), 10);
            this.data = {
                'mainH': (parseInt(App.getStorage('mainH'), 10)),
                'contentH': (parseInt(App.getStorage('contentH'), 10))
            }
        });
    }

    ngOnDestroy() {
        console.log('BaseComponent ngOnDestroy');
        if(this._subscription) {
            for(let idx in this._subscription) {
                this._subscription[idx].unsubscribe();
            }
        }
        this.data = {};
        this.items = [];
    }

    /*ngAfterViewInit() {
        console.log(this.subHeaderView.nativeElement.offsetHeight);
        console.log(App.getStorage('mainH'));
        if(this.subHeaderView.nativeElement.offsetHeight) {
            let mainH = parseInt(App.getStorage('mainH'), 10) - this.subHeaderView.nativeElement.offsetHeight;
            App.setStorage('mainH', mainH);
        }
        console.log(App.getStorage('mainH'));
        this.listHeight = parseInt(App.getStorage('mainH'), 10);
        this.wrapHeight = parseInt(App.getStorage('mainH'), 10);
    }

    @ViewChild('subHeaderView') subHeaderView: ElementRef;*/

    protected onSuccess(response: Response): void {
        console.log('Request successful', response);
    }

    protected onError(err: any): void {
        console.log('Error status code', err.status);
        this.loading = false;
        this.hideLoader();
    }

    protected onFinally(): void {
        console.log('BaseComponent onFinally');
        this.hideLoader();
        this.loading = false;
    }

    public showLoader(): void {
        this._mainService.notifyOther({ option: 'loading', value: true });
    }

    public hideLoader(): void {
        this._mainService.notifyOther({ option: 'loading', value: false });
    }

    public loadData(): void {
        console.log('BaseComponent loadData');
    }

    public onScrollDown() {
        console.log('BaseComponent onScrollDown');
        if (this.loading == false && !this.disabledLoading) {
            this.page = this.page + 1;
            this.loadData();
        }
    }

    public onScrollUp() {
        console.log('BaseComponent onScrollUp');
    }

    public getData(name, defaultVal: string = '') {
        if (name.indexOf('.') !== -1) {
            let arrTmp = name.split('.');
            if (arrTmp.length === 2) {
                let tmp = this.data[arrTmp[0]] ? this.data[arrTmp[0]] : {};
                return tmp[arrTmp[1]] ? tmp[arrTmp[1]] : defaultVal;
            } else if (arrTmp.length === 3) {
                let tmp1 = this.data[arrTmp[0]] ? this.data[arrTmp[0]] : {},
                    tmp2 = tmp1[arrTmp[1]] ? tmp1[arrTmp[1]] : {};
                return tmp2[arrTmp[2]] ? tmp2[arrTmp[2]] : defaultVal;
            }
        }


        return this.data[name] ? this.data[name] : defaultVal;
    }

    public setData(name, value:any = null) {
        if(_.isObject(name) || _.isArray(name)) {
            this.data = _.extend(this.data, name);
        }else {
            this.data[name] = value;
        }
    }

    public setTitle(title) {
        if(!this._mainService) {
            return ;
        }
        this._mainService.notifyOther({
            option: 'changeTitleAction',
            value: title
        });
    }

    public getTableFrameWidth(): number {
        let w = window.innerWidth;
        //set max width is 480px
        if(w > 480) {
            w = 480;
        }

        return w;
    }
    
    //https://momentjs.com/
    public dateFormat(date, format) {
      let nDate = date.replace(/-/g, "/");
      if(!format || format === undefined || format === '') {
        format = 'YYYY/MM/DD h:hm:ss';
      }
      if(!nDate || nDate === undefined || nDate === '') {
        return '';
      }
      return App.getMoment(nDate).format(format);
    }
}