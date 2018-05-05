import { Component, NgZone, HostListener, OnDestroy, OnInit } from '@angular/core';
import { App } from './services/app.service';
import { Message } from './services/message.service';
import { Observable, Subscription } from "rxjs";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { GeolocationService } from './services/geolocation.service';
import { LoginService } from './services/login.service';
import { MainService } from './services/main.service';
import {GameService} from "./services/game.service";

declare var device;
declare var FCMPlugin;
declare var navigator;
declare var Connection;
declare var StatusBar;
declare var cordova;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected alive: boolean; // used to unsubscribe from the IntervalObservable
  // when OnDestroy is called.
  protected timer: Observable<number>;
  protected interval: number;
  // Subscription object
  protected subscription: Subscription;
  protected subLoading: Subscription;
  protected watchId;

  constructor(
    protected loginService: LoginService,
    protected _mainService: MainService,
    protected geolocationService: GeolocationService,
    private _ngZone: NgZone,
    public gameService: GameService
  ) {
    let self = this;
    console.log('AppComponent constructor');
    this.alive = true;
    this.interval = App.getConfig('geolocation.interval');
    this.timer = Observable.timer(0, this.interval);
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
      App.setStorage('app.osType', '1');
    } else {
      App.setStorage('app.osType', '2');
    }

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady(e) {
      e.preventDefault();
      // Now safe to use device APIs
      self.onDeviceReady();
      StatusBar.overlaysWebView(false);
    }
    //set hidden keyboard
    App.setSession('hasKeyboard', false);
  }

  ngOnInit() {
    console.log('AppComponent ngOnInit');
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    // do something meaningful with it
    console.log('The user just keyup ${ev.key}!');
  }

  ngOnDestroy() {
    this.alive = false; // switches your IntervalObservable off
    if (this.subscription) {
      // unsubscribe here
      this.subscription.unsubscribe();
    }
    if (this.subLoading) {
      // unsubscribe here
      this.subLoading.unsubscribe();
    }
  }

  triggerGeolocation() {
    this.alive = true;
    if (this.subscription) {
      // unsubscribe here
      this.subscription.unsubscribe();
    }
    if (this.subLoading) {
      // unsubscribe here
      this.subLoading.unsubscribe();
    }
    if (App.getConfig('isMobile')) {
      this.subscription = this.timer
        .takeWhile(() => this.alive)
        .subscribe(() => {
          this.geolocationRegister();
        });
    }
    this.subLoading = Observable.timer(1, (30 * 60 * 1000))
      .takeWhile(() => this.alive)
      .subscribe(() => {
        this.checkConnectionStatus();
      });
  }

  onDeviceReady() {
    let self = this;
    console.log('AppComponent onDeviceReady');
    if (App.getConfig('isMobile')) {
      if (cordova && cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      }
      /*window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('backbutton', onBackButton);
      window.removeEventListener('pause', onPause);
      window.removeEventListener('resume', onResume);
      window.removeEventListener('menubutton', onMenuKeyDown);
      window.removeEventListener('native.keyboardshow', keyboardShowHandler);
      window.removeEventListener('native.keyboardhide', keyboardHideHandler);
      */
      document.addEventListener("offline", onNetworkOffline, false);
      document.addEventListener("online", onNetworkOnline, false);

      // Register the event listener
      document.addEventListener("backbutton", onBackButton, false);
      document.addEventListener("pause", onPause, false);
      document.addEventListener("resume", onResume, false);
      //document.addEventListener("menubutton", onMenuKeyDown, false);

      // Register the event listener
      window.addEventListener('native.keyboardshow', keyboardShowHandler, false);
      window.addEventListener('native.keyboardhide', keyboardHideHandler, false);
      self.triggerGeolocation();
    }

    //FCMPlugin.onTokenRefresh( onTokenRefreshCallback(token) );
    //Note that this callback will be fired everytime a new token is generated, including the first time.
    FCMPlugin.onTokenRefresh(function (token) {
      console.log('onTokenRefresh: ' + token);
      App.setStorage('device_token', token);
    });

    //FCMPlugin.getToken( successCallback(token), errorCallback(err) );
    //Keep in mind the function will return null if the token has not been established yet.
    FCMPlugin.getToken(function (token) {
      console.log('getToken: ' + token);
      App.setStorage('device_token', token);
    }, function (err) {
      console.log('getToken error: ' + err);
      App.setStorage('device_token', '');
    });

    //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
    //Here you define your application behaviour based on the notification data.
    FCMPlugin.onNotification(function (data) {
      console.log('onNotification: ' + JSON.stringify(data) + ' end');
      if (data.wasTapped) {
        //Notification was received on device tray and tapped by the user.
      } else {
        //Notification was received in foreground. Maybe the user needs to be notified.
        // LuanDT Add START
        // Trigger when has notification from server fcm
        self.triggerRequestAddFriend(JSON.stringify(data));
        // LuanDT Add END
      }
    }, function (msg) {
      console.log('onNotification success: ' + msg);
    }, function (err) {
      console.log('onNotification error: ' + err);
    });

    // Handle the online event
    function onBackButton(e) {
      e.preventDefault();
    }

    function onPause(e) {
      e.preventDefault();
      self.gameService.storageGame();
      // Handle the online event
      self.alive = false; // switches your IntervalObservable off
    }

    function onResume(e) {
      // Handle the online event
      e.preventDefault();
      self.checkConnectionStatus();
      self.triggerGeolocation();
    }

    function onMenuKeyDown(e) {
      // Handle the online event
      e.preventDefault();
    }

    function onNetworkOnline(e) {
      e.preventDefault();
      // Handle the online event
      var networkState = navigator.connection.type;
      if (networkState !== Connection.NONE) {
        self.triggerChangeConnected(true);
      }
      console.log('AppComponent Connection type: ' + networkState);
    }

    function onNetworkOffline(e) {
      // Handle the offline event
      e.preventDefault();
      self.triggerChangeConnected(false);
    }

    // Handle the online event
    function keyboardShowHandler(e) {
      //e.preventDefault();
      //iOS
      if (App.getStorage('app.osType') === '1') {
        document.body.classList.add('ios-keyboard-show');
      } else {
        document.body.classList.add('android-keyboard-show');
      }
      console.log('keyboard is show, height is: ' + e.keyboardHeight);

      App.setSession('hasKeyboard', true);
      App.setSession('keyboardHeight', e.keyboardHeight);

      if (!self.loginService.isLogged()) {
        return;
      }
      self._ngZone.run(() => {
        Observable.timer(100).subscribe(() => {
          document.body.scrollTop = 0;
        });
        //not iOS
        if (App.getStorage('app.osType') !== '1') {
          /*Observable.timer(0).subscribe(()=> {
            self._mainService.notifyOther({
              option: 'changeData',
              data: {'keyboardHeight': 0}
            });
          })*/
          //needed timeout to wait for viewport to resize
          Observable.timer(500).subscribe(() => {
            //document.activeElement.scrollIntoViewIfNeeded();
            document.activeElement.scrollIntoView();
          });
        }
        self.processShowHideKeyboard();
      });
    }

    function keyboardHideHandler(e) {
      //e.preventDefault();
      App.setSession('hasKeyboard', false);
      if (App.getStorage('app.osType') === '1') {
        document.body.classList.remove('ios-keyboard-show');
      } else {
        document.body.classList.remove('android-keyboard-show');
      }

      self._ngZone.run(() => {
        document.body.scrollTop = 0;

        if (!self.loginService.isLogged()) {
          return;
        }
        //iOS
        if (App.getStorage('app.osType') !== '1') {
          Observable.timer(0).subscribe(() => {
            self._mainService.notifyOther({
              option: 'changeData',
              data: { 'keyboardHeight': localStorage['keyboardHeight'] }
            });
          });
          /*Observable.timer(300).subscribe(()=> {
            self._mainService.notifyOther({
              option: 'changeData',
              data: {'keyboardHeight': 0}
            });
          });*/
          /*$("input:focus").each(function() {
                  $(this).trigger('blur');
                  return false;
                });*/
        }
        self.processShowHideKeyboard();
      });
    }
  }

  processShowHideKeyboard() {
    this._ngZone.run(() => {
      if (App.getSession('hasKeyboard') === 'true') {
        Observable.timer(1).subscribe(() => {
          this._mainService.notifyOther({
            option: 'changeData',
            data: { 'keyboardHeight': App.getSession('keyboardHeight') }
          });
        });
      } else {
        Observable.timer(1).subscribe(() => {
          this._mainService.notifyOther({
            option: 'changeData',
            data: { 'keyboardHeight': 0 }
          });
        });
      }
    });
  }

  exitApp() {
    sessionStorage.clear();
    //localStorage.clear();
    if (navigator.app) {
      navigator.app.exitApp();
    } else if (navigator.device) {
      navigator.device.exitApp();
    }
  }

  geolocationRegister() {
    let self = this;
    //let userInfo = self.loginService.getUserLogged();
    //getCurrentPosition
    //this.watchID = navigator.geolocation.watchPosition
    navigator.geolocation.getCurrentPosition(
      geolocationSuccess
      , geolocationError
      , { maximumAge: 3000, timeout: App.getConfig('timeout'), enableHighAccuracy: true }
    );

    function geolocationSuccess(position) {
      if (!self.geolocationService || !self.loginService.isLogged()) {
        return;
      }

      self.geolocationService.sendToApi(position)
        .subscribe(
        (response: any) => {
          console.log(JSON.stringify(response));
        },
        (error: any) => {
          console.log(JSON.stringify(error));
        }
        );
    }

    function geolocationError(error) {
      //PositionError.PERMISSION_DENIED
      //PositionError.POSITION_UNAVAILABLE
      //PositionError.TIMEOUT
      console.log('geolocationError', JSON.stringify(error));
    }
  }

  protected checkConnection() {
    // Handle the online event
    var networkState = navigator.connection.type;
    if (networkState !== Connection.NONE) {
      return true;
    }
    console.log('AppComponent checkConnection: ' + networkState);
    return false;
  }

  protected triggerChangeConnected(isConnected) {
    this._mainService.notifyOther({
      option: 'changeData',
      data: { 'isConnected': (isConnected) ? true : false }
    });
  }

  protected checkConnectionStatus() {
    this._ngZone.run(() => {
      if (!this.checkConnection()) {
        this.triggerChangeConnected(false);
      } else {
        this.triggerChangeConnected(true);
      }
    });
  }
  // LuanDT Add START
  // Callback to main servicer
  protected triggerRequestAddFriend(data) {
    this._mainService.notifyOther({
      option: 'notification',
      data: { 'data': data }
    });
  }
  // LuanDT Add END
}
