import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { App as AppService } from '../services/app.service';

@Injectable()
export class NewsListService {

    public news: any = [];
    public page: number = AppService.getConfig('page');
    public limit: number = AppService.getConfig('limit');
    public scrollTop: number = 0;

}