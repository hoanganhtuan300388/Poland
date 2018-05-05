import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs";
import { Message } from '../services/message.service';
import * as _ from 'underscore';

import { App } from '../services/app.service';
import { MainService } from '../services/main.service';
import { BaseComponent } from './base.component';
import { Frame } from '../services/Frame.model';
import { TableInput } from '../services/TableInput.model';
import {GameService} from "../services/game.service";

@Component({
    selector: 'app-score-add-view',
    templateUrl: '../views/score-add.component.html'
})
export class ScoreAddComponent extends BaseComponent implements OnInit {
    protected round1Width;
    protected round2Width;
    protected diffWidth;

    currentFrame: Frame;
    frameData: Object;
    tableInput: TableInput;

    public roundH = "background-color: red;";

    constructor(
        protected _router: Router,
        protected _activatedRoute: ActivatedRoute,
        protected _mainService: MainService,
        public gameService: GameService
    ) {
        super(_mainService);
        this.listHeight = window.innerHeight - 275;
    }

    ngOnInit(): void {
        let self = this;
        let subcription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if(res.value == 'left') {
                    this._mainService
                      .showConfirmDialog(Message.get('Do you want to quit game?'))
                      .then((result: any) => {
                        // if were here ok was clicked.
                        this.gameService.storageGame();
                        this._mainService.setShowDialog(false);
                        App.setSession('game.status', '');
                        Observable.timer(100).subscribe(() => {
                            this._router.navigate(['/score/'+ App.getSession('score.type', 'weekly')]);
                        });
                      })
                      // if were here it was cancelled (click or non block click)
                      .catch(() => {
                        //console.log('dialog: user click cancel button');
                        //user click cancel button
                        this._mainService.setShowDialog(false);
                      });
                }

                if(res.value == 'right') {
                    if(this.gameService.isFinish()) {
                        this.submitGame();
                    }else {
                        //alert(Message.get('Please input all score'));
                        this._mainService.notifyOther({
                            option: 'changeData',
                            data: {'dialog': ["Please input all score", "alert"]}
                        });
                    }
                }
            }
        });
        this._subscription.push(subcription);
        subcription = this.gameService.gameState$.subscribe((res: any) => {
            if(res.finish ) {
                setTimeout(function () {
                    //alert(Message.get('Input score completed'));
                    self._mainService.notifyOther({
                        option: 'changeData',
                        data: {'dialog': ["Input score completed", "alert"]}
                    });
                }, 500);

                Observable.timer(1).subscribe(()=> {
                    this._mainService.notifyOther({
                        option: 'changeData',
                        data: {'rightState': 'active'}
                    });
                });
            }else {
                Observable.timer(1).subscribe(()=> {
                    this._mainService.notifyOther({
                        option: 'changeData',
                        data: {'rightState': 'inactive'}
                    });
                });
            }
        });
        this._subscription.push(subcription);

        this.detectWidth();
        let selectedClubId = App.getSession('score.club'),
            clubs = App.getSession('score.clubs');

        //create new game object
        this.gameService.init();
        if(selectedClubId) {
          let selectedClub = _.findWhere(clubs, {'id': parseInt(selectedClubId, 10)});
          this.gameService.setClub(selectedClub);
        }
        this.gameService.setCurrentFrame(0);
        //caculate width
        let roundWidth = Math.floor(window.innerWidth / 21);
        this.frameData = {
            'rowHeight': 30,
            'frameWidth': roundWidth,
        }
          
        if(App.getStorage('game.data')) {
          this.gameService.resumeGame();
        }
        this.currentFrame = this.gameService.getCurrentFrame();
        this.tableInput = new TableInput();
        this.changeStatusInput();
        //set session playing
        App.setSession('game.status', 'playing');
    }

    submitGame() {
        //this._subscription.unsubscribe();
        this.gameService.sendToApi()
            .subscribe(
            (response: any) => {
                console.log(response);
                App.setSession('game.status', '');
                App.deleteStorage('game.data');
                this._router.navigate(['/score/'+ App.getSession('score.type', 'weekly')]);
            },
            (error: any) => this.onError(error),
            () => this.onFinally()
        );
    }

    detectWidth(): any {
        let w = this.getTableFrameWidth();
        this.round1Width = Math.floor((w-23) / 10);
        this.round2Width = Math.floor((w-23) / 11);
        this.diffWidth = this.round1Width*10 - this.round2Width*11;
    }

    onChangeScore(score): any {
        this.detectWidth();

        if(!this.currentFrame || score === '') {
          return;
        }
        switch (score) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':

                this.gameService.setScore(score);
                break;

            case 'CLR':

              this._mainService
                .showConfirmDialog(Message.get('Do you want to quit game?'))
                .then((result: any) => {
                  // if were here ok was clicked.
                  this._mainService.setShowDialog(false);
                  App.setSession('game.status', '');
                  Observable.timer(100).subscribe(() => {
                      this._router.navigate(['/score/'+ App.getSession('score.type', 'weekly')]);
                  });
                })
                // if were here it was cancelled (click or non block click)
                .catch(() => {
                  //console.log('dialog: user click cancel button');
                  //user click cancel button
                  this._mainService.setShowDialog(false);
                });
                break;

            case 'STRIKE':

                this.gameService.setBonus();
                break;

            case 'G':
            case '-':
                this.gameService.setGrub();

                break;
            case 'ESC':
                this.gameService.clear();

                break;

            default:
                break
        }
        this.changeStatusInput();
        return this;
    }

    changeStatusInput( ): any {
        if(this.gameService.isFinishGame()) {
          return this.tableInput.disableAll();
        }
        this.currentFrame = this.gameService.getCurrentFrame();

        if(!this.currentFrame) {
            this.tableInput.changeStatus(0, 0);
            return;
        }
        let frameId = this.currentFrame.id,
            roundIdx = this.currentFrame.getRoundIdx(),
            score = this.currentFrame.getRemainScore(roundIdx-1);

        let canStrike = this.gameService.canStrike(roundIdx);

        if(frameId == 10 && canStrike) {
            score = 10;
        }
        this.tableInput.changeStatus(score, roundIdx, this.currentFrame.id, canStrike);
    }

    changeInputAttribute( typeElement, width: number = 40, rowHeight: number = 30): any {
        //11, 12 is total width of border each column
        //DIV 10, 11 is total column on each row
        let ret;
        switch (typeElement) {
            case 'round':
                ret = {
                    'width': width +'px'
                };
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

    changeAttribute( typeElement, idx, block, frameId?: number): any {
        let rowHeight = 30,
            w = this.getTableFrameWidth();

        if(window.innerHeight < 640) {
            rowHeight = 25;
        }
        //11, 12 is total width of border each column
        //DIV 10, 11 is total column on each row
        let round = (block == 2) ? this.round2Width : this.round1Width;

        if(this.diffWidth >0 && block == 2) {
            if((idx+1*2) < this.diffWidth) {
                round = round +1;//padding 1px
            }
            /*if(typeElement == 'round') {
                this.diffWidth = this.diffWidth-1;
            }*/
        }
		if(frameId == 10) {
			round -= 1;
		}
        return this.changeInputAttribute(typeElement, round, rowHeight);
    }

}