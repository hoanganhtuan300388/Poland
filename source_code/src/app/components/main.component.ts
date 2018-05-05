import { Component, NgZone, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from "rxjs";
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pairwise';
import { overlayConfigFactory } from "ngx-modialog";
//import { Modal as ModalDialog } from 'ngx-modialog/plugins/bootstrap';
import {
    Modal as ModalDialog,
    VEXModalContext
} from 'ngx-modialog/plugins/vex';

import { Message } from '../services/message.service';
import { LoginService } from '../services/login.service';
import { UserService } from '../services/user.service';

import { MainService } from '../services/main.service';
import {GameService} from "../services/game.service";
import { App } from '../services/app.service';

declare var navigator;
declare var Connection;
declare var cordova;

@Component({
    selector: 'app-main-view',
    templateUrl: '../views/main.component.html'
})
export class MainComponent implements OnInit, OnDestroy {
    protected _subscription: Subscription;
    public headerHeight: number;
    public footerHeight: number;
    public paddingFooterHeight: number;
    public advHeight: number;
    public mainHeight: number;
    public prevUrl: string;
    public nextUrl: string;
    public componentClass: string = "";
    protected showNoConnection: boolean = false;
    protected dialogNoConnectionRef: any;
    public nickname: string = "";
    public level: string = "";
    public isHidden: boolean = false;

    @ViewChild('templateDialogNoConnection') public templateDialogNoConnection: TemplateRef<any>;
    constructor(
        protected loginService: LoginService,
        protected UserService: UserService,
        public mainService: MainService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _ngZone: NgZone,
        public modalDialog: ModalDialog,
        public gameService: GameService,
        private _userService: UserService,
    ) {
        this.componentClass = "page";
        //iOS
        if (App.getStorage('app.osType') === '1') {
            this.componentClass = this.componentClass + " iOS";
        } else {
            this.componentClass = this.componentClass + " android";
        }
        this._router.events
            .filter(event => event instanceof NavigationEnd)
            .pairwise()
            .subscribe((e) => {
                if (e[0] && e[1]) {
                    this.mainService.prevUrl = e[0]['url'];
                    this.mainService.nextUrl = e[1]['url'];
                }
            });

        let layoutConfig = App.getConfig('layout'),
            contentH = 0;
        this.headerHeight = parseInt(layoutConfig.headerHeight, 10);
        this.footerHeight = parseInt(layoutConfig.footerHeight, 10);
        this.advHeight = parseInt(layoutConfig.advHeight, 10);
        this.paddingFooterHeight = (this.loginService.isLogged()) ? this.footerHeight : 0;

        contentH = (window.innerHeight - (layoutConfig.headerHeight));
        if (this.loginService.isLogged()) {
            contentH = (contentH - parseInt(layoutConfig.footerHeight, 10));
        }

        App.setStorage('windowH', window.innerHeight);
        App.setStorage('headerH', this.headerHeight);
        App.setStorage('footerH', this.footerHeight);
        App.setStorage('advHeight', this.advHeight);
        App.setStorage('contentH', contentH);

        this._router.events.filter(e => e instanceof NavigationEnd)
            .forEach(e => {
                if (e && e['url']) {
                    let r = e['url']
                        .toLowerCase()
                        .slice(1).split("/");

                    this.componentClass = this.componentClass + " " + r[0];
                }
                let data = this._activatedRoute.snapshot.firstChild.data;
                this.mainService.title = data['title'];
                this.mainService.tabActive = data['tabActive'];
                this.mainService.displayNav = data['displayNav'];
                this.mainService.leftSidebar = data['leftSidebar'];
                this.mainService.rightSidebar = data['rightSidebar'];
                this.mainService.advertising = data['advertising'];
                this.mainService.rightState = (data['rightState'] && data['rightState'] == 'inactive') ? 'inactive' : 'active';

                contentH = (window.innerHeight - (this.headerHeight));
                if (this.loginService.isLogged()) {
                    contentH = (contentH - parseInt(App.getStorage('footerH'), 10));
                }

                App.setStorage('contentH', contentH);
                if (this.mainService.advertising) {
                    contentH = ((contentH) - (this.advHeight));
                }
                if (this.loginService.isLogged() && this._router.url !== '/profile') {
                    this.paddingFooterHeight = this.footerHeight;
                } else {
                    this.paddingFooterHeight = 0;
                }

                this.mainHeight = contentH;
                App.setStorage('mainH', contentH);

                // update level and nickname                    
                if(this._router.url.search('score') != -1){
                    this.getNicknameLevel();
                }
                if(this._router.url == '/login' || this._router.url == '/signup' || this._router.url == '/my-page' || this._router.url == '/logout'){
                    this.isHidden = true;
                }else{
                    this.isHidden = false;
                }
            });
    }

    ngOnInit() {
        this._subscription = this.mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'apiError') {
                this.triggerErrorDialog(res);
            }

            if (res.hasOwnProperty('option') && res.option === 'changeTitleAction') {
                this.mainService.title = res.value;
            }

            if (res.hasOwnProperty('option') && res.option === 'loading') {
                this.mainService.loading = res.value;
            }

            if (res.hasOwnProperty('option') && res.option === 'changeData') {
                if (res.hasOwnProperty('data') && res.data) {
                    for (let idx in res.data) {
                        this.mainService[idx] = res.data[idx];
                        if (idx === 'isConnected') {
                            this.triggerChangeConnected(res.data[idx]);
                        } else if (idx === 'keyboardHeight') {
                            this.triggerChangeKeyboardHeight(res.data[idx]);
                        } else if (idx === 'dialog') {
                            this.triggerDialog(res.data[idx]);
                        }
                    }
                }
            }
          // Trigger notification from fcm
          // LuanDT Add START
          if (res.hasOwnProperty('option') && res.option === 'notification') {
               if (res.hasOwnProperty('data') && res.data) {
                  this.showAlertRouter(Message.get('Request add friend. please confirm.'),'/friend');
               }
           }
           // LuanDT Add END
        });
        if (App.getConfig('isMobile')) {
            Observable.timer(0).subscribe(() => {
                if (!this.checkConnection()) {
                    this.triggerChangeConnected(false);
                } else {
                    this.triggerChangeConnected(true);
                }
            });
        }
      // Register the event listener
        document.addEventListener("backbutton", this.triggerOnBackPress.bind(this), false);
    }
    getNicknameLevel() {
      if (!(this._router.url.indexOf('/login') >= 0 || this._router.url.indexOf('/signup') >= 0 )) {
         this.UserService.getProfile().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this.nickname = response.data.nickname;
                    this.level    = response.data.level;
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

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
  
    onClickRightSideBar() {
        if (App.getSession('hasKeyboard') === 'true') {
            return;
        }
        this.mainService.notifyOther({
            option: 'headerAction',
            value: 'right'
        });
    }

    onClickLeftSideBar() {
        if (App.getSession('hasKeyboard') === 'true') {
            return;
        }
        this.mainService.notifyOther({
            option: 'headerAction',
            value: 'left'
        });
    }

    onClickTabBar(router) {
        if (App.getSession('hasKeyboard') === 'true') {
            return;
        }
        //get session playing status
        let playing = App.getSession('game.status');
        if (playing && playing === 'playing') {
          this.mainService
            .showConfirmDialog(Message.get('Do you want to quit game?'))
            .then((result: any) => {
              // if were here ok was clicked.
              this.gameService.storageGame();
              this.mainService.setShowDialog(false);
              App.setSession('game.status', '');
              Observable.timer(100).subscribe(() => {
                  this._router.navigate(['/score/'+ App.getSession('score.type', 'weekly')]);
              });
            })
            // if were here it was cancelled (click or non block click)
            .catch(() => {
              //console.log('dialog: user click cancel button');
              //user click cancel button
              this.mainService.setShowDialog(false);
            });
            return;
        }

        Observable.timer(1).subscribe(() => {
            this._router.navigate([router]);
        });
    }

    checkConnection() {
        // Handle the online event
        var networkState = navigator.connection.type;
        if (networkState !== Connection.NONE) {
            return true;
        }
        console.log('checkConnection type: ' + networkState);
        return false;
    }

    triggerChangeConnected(isConnected) {
        if (isConnected) {
            this.closeDialogNoConnection();
        }
        if (!this.showNoConnection && !isConnected) {
            this.showDialogNoConnection();
            this.showNoConnection = true;
        } else if (this.showNoConnection && isConnected) {
            this.showNoConnection = false;
        }
    }

    showDialogNoConnection() {
        this.dialogNoConnectionRef = this.modalDialog
            .open(this.templateDialogNoConnection,
            overlayConfigFactory({ isBlocking: true }, VEXModalContext));
    }

    closeDialogNoConnection() {
        if(!this.dialogNoConnectionRef) {
          return;
        }
        this._ngZone.run(() => {
            Observable.timer(1).subscribe(() => {
                this.dialogNoConnectionRef
                    .then((dialog: any) => {
                        //console.log(dialog.result);
                        return dialog;
                    })
                    .then((result: any) => {
                        result.close();
                    }) // if were here ok was clicked.
                    // if were here it was cancelled (click or non block click)
                    .catch((err: any) => console.log('Cancel: ' + err));
            });
        });
    }

    triggerDocumentClick(e) {
        //console.log(e);
        //if keyboard is show and tap element not input type
        if (App.getSession('hasKeyboard') === 'true') {
            if(e.target && (e.target.tagName.toUpperCase() !== 'INPUT' && e.target.tagName.toUpperCase() !== 'TEXTAREA')) {
                let className = e.target.className;
                if(!className || className.indexOf('ignore_click') === -1) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                }
                cordova.plugins.Keyboard.close();
                App.setSession('hasKeyboard', false);
                this.triggerChangeKeyboardHeight(0);
                return; // do nothing
            }
        }
    }

    triggerChangeKeyboardHeight(height) {
        //if (this._router.url.indexOf('/friend-chat') === -1) {
        //    return;
        //}

        this._ngZone.run(() => {
            Observable.timer(0).subscribe(() => {
                let mainH = parseInt(App.getStorage('mainH'), 10),
                    footerH = parseInt(App.getStorage('footerH', this.footerHeight), 10),
                    hasKeyboard = App.getSession('hasKeyboard', false),
                    advHeight = parseInt(App.getStorage('advHeight'), 10),
                    keyboardHeight = App.getSession('keyboardHeight', 0);



                if (hasKeyboard !== 'true' || !height) {
                    this.mainHeight = mainH;
                    if (this.loginService.isLogged()) {
                        this.paddingFooterHeight = footerH;
                    } else {
                        this.paddingFooterHeight = 0;
                    }

                    if (this.loginService.isLogged() && this._router.url !== '/profile') {
                        this.mainService.displayNav = true;
                    } else {
                        this.mainService.displayNav = false;
                    }
                } else {
                    if (this.loginService.isLogged()) {
                        if (this._router.url.indexOf('/friend-chat') === 0 || this._router.url === '/profile' || this._router.url === '/profile-setting' || this._router.url === '/profile-store') {
                            this.mainService.displayNav = false;
                        } else {
                            this.mainService.displayNav = true;
                        }
                    } else {
                        this.mainService.displayNav = false;
                    }

                    this.paddingFooterHeight = 0;
                    if (App.getStorage('app.osType') === '1') {
                        //this.mainHeight = mainH + footerH;
                        this.mainHeight = mainH + 40 + footerH;
                    } else {
                        this.mainHeight = mainH + footerH - parseInt(keyboardHeight, 10);
                    }
                }
            });
        });
    }

    triggerErrorDialog(res) {
        let apiUrl = App.getConfig('apiUrl'),
            code = parseInt(res.code, 10),
            url = res.response.url,
            mess = Message.get('Cannot connect to server. Try again.');

        if (code === 401) {
            this.loginService.logout();
            this._router.navigate(['/login']);
        }
        let ignoreUrl = false;
        //ignore get advertis
        if (url.indexOf('/ads?') !== -1
            || url.indexOf('/auth/') !== -1) {
            ignoreUrl = true;
        }

        if (ignoreUrl || code < 300) {
            return;
        }

        switch (code) {
            case 400:
                break;

            case 503:
                mess = Message.get('The server is currently unavailable. Please try again few minute.');
                break;

            default:
                break;
        }

        this.showAlertDialog(mess);
    }

    triggerDialog(dialog) {
        let mess = (dialog[0]) ? Message.get(dialog[0]) : 'Error',
            type = (dialog[1] && dialog[1] == 'confirm') ? 'confirm' : 'alert';

        if (!mess) {
            return;
        }
        this.showAlertDialog(mess);
    }

    showAlertDialog(mess) {
        if (this.mainService.getShowDialog()) {
            return;
        }
        this.mainService.setShowDialog(true);
        let dialogRef = this.modalDialog.alert()
            .message(mess)
            //.isBlocking(true)
            .showCloseButton(false)
            .okBtn(Message.get('OK'))
            .open()
            .catch(err => console.log('Error')) // catch error not related to the result (modal open...)
            .then((dialog: any) => {
                return dialog.result
            }) // dialog has more properties,lets just return the promise for a result.
            .then((result: any) => {
                this.mainService.setShowDialog(false);
            }) // if were here ok was clicked.
            // if were here it was cancelled (click or non block click)
            .catch((err: any) => {
                console.log('catch2: ' + err)
                this.mainService.setShowDialog(false);
            });
    }
    // LuanDT Add START
    // Show alert and redirect
    showAlertRouter(mess, router) {
      this._ngZone.run(() => {
          Observable.timer(100).subscribe(() => {
              this.mainService
                  .showConfirmDialog(mess)
                  .then((result: any) => {
                      this.mainService.setShowDialog(false);
                      // Check playing game
                      const playing = App.getSession('game.status');
                      if (playing && playing === 'playing') {
                        // Show dialog confirm quit game
                        this.mainService
                          .showConfirmDialog(Message.get('Do you want to quit game?'))
                          .then((rs: any) => {
                            // Show dialog confirm accept request add friend
                            this.gameService.storageGame();
                            this.mainService.setShowDialog(false);
                            App.setSession('game.status', '');
                            // Redirect to router
                            Observable.timer(100).subscribe(() => {
                                this._router.navigate([router]);
                            });
                          })
                          // if were here it was cancelled (click or non block click)
                          .catch(() => {
                            this.mainService.setShowDialog(false);
                          });
                          return;
                      }
                      // Redirect to router
                      Observable.timer(1).subscribe(() => {
                          this._router.navigate([router]);
                      });
                  })
                  .catch(() => {
                    this.mainService.setShowDialog(false);
                });
            });
        });
    }
    // Trigger event android onBackPress
    triggerOnBackPress() {
      this._ngZone.run(() => {
          Observable.timer(100).subscribe(() => {
            if (this.mainService.leftSidebar === '戻る') {
                this.onClickLeftSideBar();
            } else {
                switch (this._router.url) {
                case '/signup':
                    this._router.navigate(['/login']);
                  break;
                case '/login':
                case '/score/weekly':
                  this.mainService
                  .showConfirmDialog(Message.get('Exit application?'))
                  .then((result: any) => {
                      navigator.app.exitApp();
                  })
                  .catch(() => {
                    this.mainService.setShowDialog(false);
                  });
                  break;
                default:
                    this._router.navigate(['/score/weekly']);
                  break;
              }
            }
          });
        });
    }
    // LuanDT Add ẸND
}
