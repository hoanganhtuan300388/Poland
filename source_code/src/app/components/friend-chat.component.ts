import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireList, AngularFireAction } from 'angularfire2/database';
import { BaseComponent } from './base.component';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';

import { LoginService } from '../services/login.service';
import { MainService } from '../services/main.service';
import { App } from '../services/app.service';
import { FriendService } from '../services/friend.service';
import { FriendListService } from '../services/friend-list.service';

//declare var navigator;
//declare var CameraPopoverOptions;
declare var cordova;

@Component({
    selector: 'app-friend-chat-view',
    templateUrl: '../views/friend-chat.component.html'
})
export class FriendChatComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
    public chatForm: any;
    @ViewChild('scrollMe') protected _myScrollContainer: ElementRef;
    //public messages: AngularFireList<any>;
    public itemsRef: AngularFireList<any>;
    public messages: Observable<any[]>;
    //public items: Observable<AngularFireAction[]>;

    public time$: BehaviorSubject<string | null>;

    public userProfile: any;
    public friendProfile: any;
    protected chatRoomId: string;
    protected chatId: string;
    protected fromId: string;
    protected chatIdReverser: string;
    protected chatBoxH = 55;
    protected initFlag = true;
    protected alive: boolean = true;

    constructor(
        protected database: AngularFireDatabase,
        protected _router: Router,
        protected _loginService: LoginService,
        protected _mainService: MainService,
        protected _formBuilder: FormBuilder,
        private _friendService: FriendService,
        private _friendListService: FriendListService
    ) {
        super(_mainService);

        Observable.timer(0).subscribe(() => {
            this.setData({
                chatRoom: {},
                'iconW': 50,
                'paddingFooterHeight': App.getStorage('footerH'),
                'messageW': (window.innerWidth - (50 * 2 + 20)),
                'scollerH': (parseInt(App.getStorage('mainH'), 10) - this.chatBoxH) //35 height of input text,
            });
        });
    }

    ngOnInit() {
        if (App.getConfig('isMobile')) {
            if (App.getStorage('app.osType') === '1') {
                if (cordova && cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
            }
        }

        this.showLoader();
        let self = this;
        let routerSub = this._mainService.notifyObservable$
          .takeWhile(() => this.alive)
          .subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    App.setSession('friend.chat', null);
                    this._router.navigate(['/friend']);
                }
            }

            if (res.hasOwnProperty('option') && res.option === 'changeData') {
                if (res.hasOwnProperty('data') && res.data) {
                    for (let idx in res.data) {
                        if (idx === 'keyboardHeight') {
                            this.triggerChangeKeyboardHeight(res.data[idx]);
                        }
                    }
                }
            }
        });
        this._subscription.push(routerSub);

        this.chatForm = this._formBuilder.group({
            'content': ['', [Validators.required]]
        });

        //get friend information
        this.friendProfile = App.getSession('friend.chat');

        let user = this._loginService.getUserLogged();
        this.userProfile = user;
        this.fromId = user.id;

        if (!this.friendProfile || !this.friendProfile.id) {
            return this._router.navigate(['/friend']);
        }

        //change title
        this.setTitle(this.friendProfile.nickname);

        this.chatId = this.userProfile.id + '_' + this.friendProfile.id;
        this.chatIdReverser = this.friendProfile.id + '_' + this.userProfile.id;

        Observable.timer(0).subscribe(() => {
            self.detectChatRoom(self.chatId);
        });
    }

    protected detectChatRoom(chatId: string) {
        //this.time$ = new BehaviorSubject(chatId);
        const queryObservable = this.database.object('/users/' + chatId);
        queryObservable.valueChanges()
          .takeWhile(() => this.alive)
          .subscribe(item => {
            if (item) {
                this.chatRoomId = chatId;
                this.setData('chatRoom', item);
                if (chatId == this.chatIdReverser) {
                    let friendProfile = this.friendProfile;
                    this.friendProfile = this.userProfile;
                    this.userProfile = friendProfile;
                }
                this.fetchMessage();
            } else {
                if (chatId === this.chatId) {
                    return this.detectChatRoom(this.chatIdReverser);
                } else {
                    return this.createChatRoom(this.chatId);
                }
            }
        });
    }

    protected createChatRoom(chatId: string) {
        this.chatRoomId = chatId;
        const queryObservable = this.database.object('/users/' + chatId);

        let item = {
            created_by: this.userProfile.id,
            id: chatId,
            time: new Date().getTime()
        };
        queryObservable.set(item);
        this.setData('chatRoom', item);
        //init chat
        const chatObservable = this.database.object('/chats/' + chatId);
        chatObservable.set(item);

        this.fetchMessage();
    }

    protected fetchMessage() {
        let startTime = App.getMoment()
            //.startOf('day')
            .subtract(10, 'days') //seconds days hours
            , time = parseInt(startTime.format('x'), 10)
            ;
        //console.log(App.getMoment(1506509816590).format('YYYY-MM-DD HH:mm:ss'));
        //console.log(App.getMoment(time).format('YYYY-MM-DD HH:mm:ss'), time);
        this.time$ = new BehaviorSubject(null);
        this.itemsRef = this.database.list('/chats/' + this.chatRoomId,
            ref => ref.limitToFirst(500)
                .orderByChild('time')
                .startAt(time)
        );

        let friend = App.getSession('friend.chat');
        this.itemsRef.valueChanges(['child_added'])
        .takeWhile(() => this.alive)
        .subscribe(items => {
          console.log('this.initFlag ', this.initFlag, items)
          if(!this.initFlag || (this.initFlag && friend.message_flag == 1)) {
            let newItem = items.pop();
            console.log(newItem);
            if(newItem['from'] !== undefined && newItem['from'] != this.fromId) {
              this.updateMessageStatus(0);
            }
          }
          if(this.initFlag) {
            this.initFlag = false;
          }
        });
        this.messages = this.time$.switchMap(chat =>
            this.itemsRef.valueChanges().takeWhile(() => this.alive)
        );
        this.hideLoader();
        this.scrollToBottom();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this._myScrollContainer.nativeElement.scrollTop = this._myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    sendMessage() {
        if (this.chatForm.dirty && this.chatForm.valid) {
            let _time = new Date().getTime(),
                item = {
                    message: this.chatForm.value.content,
                    from: this.fromId,
                    to: (this.fromId == this.friendProfile.id) ? this.userProfile.id : this.friendProfile.id,
                    edited: false,
                    key: this.chatRoomId,
                    time: _time,
                    date: App.getMoment(_time).format('YYYY-MM-DD HH:mm:ss')
                };
            this.itemsRef.push(item);

            //reset data
            this.chatForm.reset();
            this.updateMessageStatus(1);
        }
    }

    updateMessage(key: string) {
        //console.log(key);
    }

    triggerChangeKeyboardHeight(height) {
        let mainH = parseInt(App.getStorage('mainH'), 10),
            footerH = parseInt(App.getStorage('footerH'), 10),
            hasKeyboard = App.getSession('hasKeyboard', false),
            keyboardHeight = App.getSession('keyboardHeight', 0),
            advHeight = parseInt(App.getStorage('advHeight'), 10),
            contentH = (mainH) //31 height of input text,;
            ;

        //iOS
        if (hasKeyboard === 'true') {
            contentH = (mainH + footerH - parseInt(keyboardHeight, 10)) //31 height of input text,;
            let bodyHeight = mainH + footerH - parseInt(keyboardHeight, 10);
            if (App.getStorage('app.osType') === '1') {
                cordova.plugins.Keyboard.disableScroll(true);
                bodyHeight = bodyHeight + 40;

                document.documentElement.style.height = bodyHeight + 'px';
                document.body.style.height = bodyHeight + 'px';
            }
            this.setData({
                'paddingFooterHeight': 0,
                'scollerH': (contentH - this.chatBoxH)
            });
        } else {
            if (App.getStorage('app.osType') === '1') {
                document.documentElement.style.height = '100%';
                document.body.style.height = "100%";
                cordova.plugins.Keyboard.disableScroll(false);
            }

            this.setData({
                'paddingFooterHeight': footerH,
                'scollerH': (mainH - this.chatBoxH)
            });
        }
        console.log('chat hasKeyboard: ' + hasKeyboard + ' scollerH' + contentH);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.alive = false;
        if (App.getConfig('isMobile')) {
            if (App.getStorage('app.osType') === '1') {
                cordova.plugins.Keyboard.disableScroll(false);
                if (cordova && cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                }
            }
        }
        this.time$.unsubscribe();
    }

    updateMessageStatus(isRead: number) {
        let friend = App.getSession('friend.chat');

        this._friendService.updateStatusMessage(friend.id, isRead).subscribe(
            (response: any) => {
                if (response.code == 200) {
                    if (isRead == 0) {
                        this._friendListService.setIsReadFriend(friend.id);
                    }
                }
                console.log(response);
            }, (error: any) => {
                console.log(error);
            }
        );
    }
}