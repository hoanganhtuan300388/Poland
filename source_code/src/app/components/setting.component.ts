import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { UserService } from '../services/user.service';
import { MainService } from '../services/main.service';
import { LoginService } from '../services/login.service';

@Component({
    selector: 'app-setting-view',
    templateUrl: '../views/setting.component.html'
})
export class SettingComponent implements OnInit, OnDestroy {
    public settingStateForm: any;
    public showForm: boolean = false;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _ngZone: NgZone,
        private _userService: UserService,
        private _mainService: MainService,
        private _loginService: LoginService
    ) {

    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/my-page']);
                }

                if (res.value == 'right') {
                    this.settingState();
                }
            }
        });

        this.restartForm();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    restartForm() {
        this._userService.getSetting().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    let setting = response.data[0];
                    this.settingStateForm = this._formBuilder.group({
                        isPushNotification: setting.push_notification_flag,
                        isAddFriend: setting.add_friend_flag,
                        isViewMap: setting.view_location_flag
                    });
                    this.showForm = true;
                } else {
                    console.log(response);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    settingState() {
        if (this.settingStateForm.dirty && this.settingStateForm.valid) {
            let data = {
                push_notification_flag: +this.settingStateForm.value.isPushNotification,
                add_friend_flag: +this.settingStateForm.value.isAddFriend,
                view_location_flag: +this.settingStateForm.value.isViewMap,
                device_token: this._loginService.getDeviceToken()
            }

            this._userService.updateSetting(data).subscribe(
                (response: any) => {
                    if (response.code == 200) {
                        alert("変更に成功しました。");
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