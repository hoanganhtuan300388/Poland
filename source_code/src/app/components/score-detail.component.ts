import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { App } from '../services/app.service';
import { MainService } from '../services/main.service';
import { BaseComponent } from './base.component';
import {GameService} from "../services/game.service";

@Component({
    selector: 'app-score-detail-view',
    templateUrl: '../views/score-detail.component.html'
})
export class ScoreDetailComponent extends BaseComponent implements OnInit {
    protected date;
    frameData: Object;

    constructor(
        protected _router: Router,
        protected _activatedRoute: ActivatedRoute,
        protected _mainService: MainService,
        protected gameService: GameService
    ) {
        super(_mainService);
    }

    ngOnInit(): void {
        let routerSub = this._activatedRoute.params.subscribe(params => {
            this.items = [];
            this.page = 1;
            this.date = params['date'];
            this.loadData();
        });
        let mainSubcription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if(res.value == 'left') {
                    this._router.navigate(['/score/'+ App.getSession('score.type', 'weekly')]);
                }
            }
        });
        this._subscription.push(routerSub);
        this._subscription.push(mainSubcription);

        /*this.frames = [
            new Frame(1, ['2', '2'], false, false),
            new Frame(2, ['2', '2'], true, false),
            new Frame(3, ['2', '2'], false, true),
            new Frame(4, ['2', '2'], false, false),
            new Frame(5, ['2', '2'], false, false),
            new Frame(6, ['2', '2'], false, true),
            new Frame(7, ['2', '2'], false, false),
            new Frame(8, ['2', '2'], true, false),
            new Frame(9, ['2', '2'], false, false),
            new Frame(10, ['2', '2', '4'], false, false)
        ];*/

        //caculate width
        let roundWidth = Math.ceil(window.innerWidth / 21);
        this.frameData = {
            'rowHeight': 25,
            'frameWidth': roundWidth,
        }
    }

    loadData() {

        let type = 2,
            searchType = App.getSession('score.type', 'weekly');
        if(searchType === 'daily') {
            type = 1;
        }else if(searchType === 'monthly') {
            type = 3;
        }
        let date = App.getMoment(this.date).format("YYYY/MM/DD");
        let params = {'date': date, 'type': type, 'page': this.page, 'limit': this.limit};
        this.loading = true;
        this.gameService.getGameDetail(params).subscribe(
            (response: any) => {
                //this.items = this.items.concat(response.data.data);
                for(let idx in response.data.data) {
                    let item = response.data.data[idx];
                    item['data'] = JSON.parse(item['data']);
                    this.items.push(item);
                }
                //console.log(this.items);
				if(response.data.last_page && this.page >= response.data.last_page) {
					this.disabledLoading = true;
				}
            },
            (error: any) => this.onError(error),
            () => this.onFinally()
        );
    }

    public isSpare(obj, roundIdx: number =0): boolean {
        if(obj.id < 10) {
            return obj.spare;
        }else {
            let score1 = this.getScore(obj, 0),
                score2 = this.getScore(obj, 1),
                score3 = this.getScore(obj, 2);

            if(roundIdx === 1 && (score2 !== 10 && score1 !== 10 && (score1+score2 === 10))) {
                return true;
            }else if(roundIdx === 2 && (score3 !== 10 && score2 !== 10 && (score1+score2 !== 10)&& (score2+score3 === 10))) {
                return true;
            }
            return false;
        }
    }

    public isStrike(obj, roundIdx: number =0): boolean {
        if(obj.id < 10) {
            return obj.strike;
        }else {
            if(this.getScore(obj, roundIdx) == 10) {
                return true;
            }
            return false;
        }
    }

    public getScore(obj, idx): number {
        return (obj.scores[idx] !== undefined) ? obj.scores[idx] : 0;
    }

    public getDisplayScore(obj, idx): any {
        let score = (obj.scores[idx] !== undefined) ? obj.scores[idx] : '';
        if(score === 0 && idx === 0) {
            score = 'G';
        }else if(score === 0 && idx > 0) {
            score = '-';
        }
        return score;
    }

    changeInputAttribute( typeElement, width: number = 40, rowHeight: number = 30, roundIdx?: number, frame?: Object): any {
        //11, 12 is total width of border each column
        //DIV 10, 11 is total column on each row
        let ret;
        switch (typeElement) {
            case 'round':
                ret = {
                    'width': width +'px'
                };
                if(frame) {
                    let score1 = this.getScore(frame, 0),
                        score2 = this.getScore(frame, 1),
                        score3 = this.getScore(frame, 2);
                    if( (roundIdx == 1 && score1 === 10 && score1 === 10)
                        || (roundIdx == 2 && score2 === 10 && score3 === 10) ) {
                        ret['border-left-color'] = '#FFFFFF';
                    }
                }

                break;

            case 'triangle-left':
                ret = {
                    'border-top-width': ((rowHeight-1) / 2)+'px',
                    'border-right-width': (width / 2)+'px',
                    'border-bottom-width': ((rowHeight-1) / 2)+'px'
                };
                break;

            case 'triangle-right':
                ret = {
                    'border-top-width': ((rowHeight-1) / 2)+'px',
                    'border-left-width': (width / 2)+'px',
                    'border-bottom-width': ((rowHeight-1) / 2)+'px'
                };
                break;

            case 'triangle-bottomright':
                ret = {
                    'border-left-width': (width)+'px',
                    'border-bottom-width': (rowHeight-1)+'px'
                };
                break;

            case 'height-row':
                ret = {
                    'height': (rowHeight)+'px',
                };
                break;

            default:
                break
        }

        return ret;
    }

    changeAttribute( typeElement, roundIdx, frame?: Object): any {
        let rowHeight = 30,
            w = this.getTableFrameWidth();
        //11, 12 is total width of border each column
        //DIV 10, 11 is total column on each row
        let width = Math.floor((window.innerWidth-22) / 21);

        if(frame && frame['id'] == 10 && roundIdx>0 && (typeElement =='triangle-right' || typeElement =='triangle-left')) {
            width -= 1;
        }
        return this.changeInputAttribute(typeElement, width, rowHeight, roundIdx, frame);
    }

}