import { Component, Directive, ViewContainerRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { App } from '../services/app.service';
import { MainService } from '../services/main.service';
import { BaseComponent } from './base.component';
import { ScoreService } from '../services/score.service';
import { UserService } from '../services/user.service';
import { Message } from '../services/message.service';

@Component({
    selector: 'app-score-view',
    templateUrl: '../views/score.component.html'
})
export class ScoreComponent extends BaseComponent implements OnInit {
    public dialogDisabled: boolean = true;
    public showForm: boolean = false;
    public searchType: string = 'weekly';
    public clubs: any = [];
    public clubChoiseForm;
    public wrapHeight: number = 0;
    public selectedClub: any;

    constructor(
        protected _router: Router,
        protected _activatedRoute: ActivatedRoute,
        protected _formBuilder: FormBuilder,
        protected _scoreService: ScoreService,
        protected _userService: UserService,
        protected _mainService: MainService
    ) {
        super(_mainService);
        Observable.timer(0).subscribe(() => {
            this.listHeight = parseInt(App.getStorage('mainH'), 10) - 144;
            this.setData({
                'canAddClub': false
            });
        });
    }

    ngOnInit() {
        let routerSub = this._activatedRoute.params.subscribe(params => {
            this.items = [];
            this.page = 1;
            this.searchType = params['search'];
            this.loadData();
            this.getProfile();
            App.setSession('score.type', params['search']);
        });
        this._subscription.push(routerSub);
        this.closeDialog();
    }

    loadData() {
        let searchType = 2;
        if (this.searchType === 'daily') {
            searchType = 1;
        } else if (this.searchType === 'monthly') {
            searchType = 3;
        }

        let params = { 'type': searchType, 'page': this.page, 'limit': this.limit };
        this.loading = true;
        this._scoreService.getListScore(params).subscribe(
            (response: any) => {
                this.items = this.items.concat(response.data.data);
                //console.log(response);
                if (!response.data.last_page || (response.data.last_page && this.page >= response.data.last_page)) {
                    this.disabledLoading = true;
                }
            },
            (error: any) => this.onError(error),
            () => this.onFinally()
        );
    }

    getProfile() {
        this._userService.getProfile()
            .subscribe(
            (response: any) => {
                this.clubs = response.data.clubs;
                if (this.clubs.length < 10) {
                    this.setData({
                        'canAddClub': true
                    });
                }
                this.restartForm();
                this.showForm = true;
                App.setSession('score.clubs', this.clubs);
            },
            (error: any) => this.onError(error),
            () => this.onFinally()
            );
    }

    restartForm(clubDefaultId: number = null) {
        this.clubChoiseForm = this._formBuilder.group({
            club: [clubDefaultId, []]
        });
    }

    openDialog() {
      if(App.getStorage('game.data')) {
          this._mainService
            .showConfirmDialog(Message.get('Do you want to resume game?'))
            .then((result: any) => {
              // if were here ok was clicked.
              this._mainService.setShowDialog(false);
              Observable.timer(100).subscribe(() => {
                  this._router.navigate(['/score-add']);
              });
            })
            // if were here it was cancelled (click or non block click)
            .catch(() => {
              //console.log('dialog: user click cancel button');
              //user click cancel button
              App.deleteStorage('game.data');
              this._mainService.setShowDialog(false);
              if(this.showForm) {
                this.dialogDisabled = false;
              }
            });
      }else {
        if(this.showForm) {
            this.dialogDisabled = false;
        }
      }
    }

    closeDialog() {
        this.dialogDisabled = true;
    }
    changeClub(club) {
        this.selectedClub = club;
        App.setSession('score.club', club);
    }

    gotoDetail(item) {
        //console.log(item);
        Observable.timer(100).subscribe(() => {
            this.showLoader();
            this.closeDialog();
            let date = App.getMoment(item.timing).format("YYYY-MM-DD");
            this._router.navigate(['/score-detail/' + date]);
        });
    }

    choiseClub() {
      if (this.clubChoiseForm.valid) {
        this.closeDialog();
        this._mainService
          .showConfirmDialog('でゲームを始めますか？')
          .then((result: any) => {
            // if were here ok was clicked.
            this._mainService.setShowDialog(false);
            Observable.timer(100).subscribe(() => {
                this._router.navigate(['/score-add']);
            });
          })
          // if were here it was cancelled (click or non block click)
          .catch(() => {
            //console.log('dialog: user click cancel button');
            //user click cancel button
            this._mainService.setShowDialog(false);
          });
      }
    }

    registerClub() {
        Observable.timer(100).subscribe(() => {
            this.closeDialog();
            this._router.navigate(['/profile-store-setting']);
        });
    }

    public gotoPage(link) {
        this.showLoader();
        Observable.timer(100).subscribe(() => {
            this.items = [];
            this.closeDialog();
            this._router.navigate([link]);
        });
    }
}