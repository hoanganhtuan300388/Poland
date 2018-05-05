import { Component, Input, OnChanges } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { App as AppService } from '../services/app.service';
import { AdvertisingService } from '../services/advertising.service';

@Component({
    selector: 'app-advertising-view',
    templateUrl: '../views/advertising.component.html'
})
export class AdvertisingComponent implements OnChanges {
    public advHeight: number;
    public adv: any = null;
    public deviceWidth: number = window.innerWidth;

    @Input('isLoadData') isLoadData: boolean;

    constructor(
        private _advertisingService: AdvertisingService
    ) {

    }

    ngOnChanges() {
        if (this.isLoadData == true) {
            this.adv = AppService.getStorage('advertising');

            if (!this.adv) {
                this._advertisingService.get().subscribe(
                    (response: any) => {
                        if (response.code == 200) {
                            this.adv = response.data;
                            this.updateLayout();
                            AppService.setStorage('advertising', response.data);
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
    }

    public updateLayout() {
        let advHeight = 0;
        let layoutConfig = AppService.getConfig('layout');

        advHeight = layoutConfig.advHeight;
        this.advHeight = advHeight;
    }

}