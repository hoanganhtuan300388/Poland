import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { App as AppService } from '../services/app.service';

@Injectable()
export class StoreListService {

    public cities: any = [];
    public scrollTop: number = 0;

}