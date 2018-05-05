import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MainService } from '../services/main.service';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validate.service';
import { LoginService } from '../services/login.service';
import { App as AppService } from '../services/app.service';

declare var facebookConnectPlugin;
declare var TwitterConnect;

@Component({
    selector: 'app-login-view',
    templateUrl: '../views/login.component.html'
})
export class LoginComponent implements OnInit {
    public loginForm: any;
    public type: string = null;
    private _location = {
        lat: 0,
        long: 0
    }

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        protected _mainService: MainService,
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private _ngZone: NgZone,
        private _loginService: LoginService
    ) {

    }

    ngOnInit() {
        this.setLocation();
        this.restartForm();
    }

    setLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude: number = position.coords.latitude ? position.coords.latitude : AppService.getConfig('defaultLat');
            let longitude: number = position.coords.longitude ? position.coords.longitude : AppService.getConfig('defaultLong');
            this._location = {
                lat: latitude,
                long: longitude
            }
        });
    }

    restartForm() {
        this.loginForm = this._formBuilder.group({
            'email': ['', [Validators.required, ValidationService.emailValidator]],
            'password': ['', [Validators.required, ValidationService.passwordValidator]]
        });
    }

    processSubmit() {
        if(this.type === "forgotpass") {
            if (this.loginForm.get('email').dirty && this.loginForm.get('email').valid) {
                this._userService.forgotPassword(this.loginForm.value).subscribe((response: any) => {
                    if (response.code == 200) {
                        this.restartForm();
                        //alert("パスワードを変更しました。メールを見てください。");
                        this._mainService.notifyOther({
                            option: 'changeData',
                            data: {'dialog': ["パスワードを変更しました。メールを見てください。", "alert"]}
                        });
                    } else {
                        console.log(response);
                    }
                }, error => {
                    console.log(error);

                    if(error.status == 422) {
                        let body: any = JSON.parse(error._body);

                        if(body.data.email) {
                            //alert(body.data.email);
                            this._mainService.notifyOther({
                                option: 'changeData',
                                data: {'dialog': ["メールまたはパスワード が間違っています。", "alert"]}
                            });
                        }
                    }
                });
            }
        } else if(this.type === "login") {
            if (this.loginForm.dirty && this.loginForm.valid) {
                this.loginForm.value.device_token = this._loginService.getDeviceToken();
                this.loginForm.value.os_type = this._loginService.getOsType();
                this.loginForm.value.lat = this._location.lat;
                this.loginForm.value.long = this._location.long;

                this._userService.login(this.loginForm.value).subscribe((response: any) => {
                    if (response.code == 200) {
                        this._loginService.setLogin({
                            id: response.data.id,
                            email: this.loginForm.value.email,
                            password: this.loginForm.value.password,
                            deviceToken: this.loginForm.value.device_token,
                            avatar: response.data.image,
                            loginToken: response.data.token,
                            osType: this.loginForm.value.os_type,
                            lat: this.loginForm.value.lat,
                            long: this.loginForm.value.long,
                            stores: response.data.clubs
                        });
                        
                        this._router.navigate(['/score', 'weekly']);
                    } else {
                        console.log(response);
                    }
                }, error => {
                    console.log(error);
                    if(error.status == 422) {
                        let body: any = JSON.parse(error._body);
                        
                        let message: string = '';
                        
                        if(body.data.error) {
                            message = body.data.error;
                        }

                        if(body.data.email) {
                            message = body.data.email;
                        }
                        //alert('メールまたはパスワード が間違っています。');
                        this._mainService.notifyOther({
                            option: 'changeData',
                            data: {'dialog': ["メールまたはパスワード が間違っています。", "alert"]}
                        });
                    }
                });
            }
        } else {
            
        }
    }

    loginSocical(socicalName: string) {
        let socicalValue: any = {
            device_token: this._loginService.getDeviceToken(),
            os_type: this._loginService.getOsType(),
            lat: this._location.lat,
            long: this._location.long
        };

        if (socicalName == 'facebook' && typeof facebookConnectPlugin !== 'undefined') {
            facebookConnectPlugin.login(
                ['email', 'public_profile', 'user_birthday'],
                (response: any) => {
                    facebookConnectPlugin.api(
                        '/me?fields=id,name,picture.type(large),email',
                        [],
                        (result) => {
                            socicalValue.uid = result.id;
                            socicalValue.type = 1; //1 facebook
                            socicalValue.nickname = result.name;
                            socicalValue.avatar = result.picture.data.url;

                            this.loginSocicalSuccess(socicalValue);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                },
                (error: any) => {
                    console.log(error);
                }
            );
        } else if (socicalName == 'twitter' && typeof TwitterConnect !== 'undefined') {
            TwitterConnect.login(
                (result: any) => {
                    TwitterConnect.showUser(
                        (result) => {
                            socicalValue.uid = result.id;
                            socicalValue.type = 2; //2 twitter
                            socicalValue.nickname = result.name;
                            socicalValue.avatar = result.profile_image_url;

                            this.loginSocicalSuccess(socicalValue);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                },
                (error: any) => {
                    console.log(error);
                }
            );
        } else {
            console.log("これはデバイスではありません。");
        }
    }

    redirectSingup() {
        this._router.navigate(['/signup']);
    }

    loginSocicalSuccess(socicalValue: any) {
        this._ngZone.run(() => {
            this._userService.socialLogin(socicalValue).subscribe((response: any) => {
                if (response.code == 200) {
                    this._loginService.setLoginSocial({
                        id: response.data.id,
                        uid: socicalValue.uid,
                        socialType: socicalValue.type,
                        deviceToken: socicalValue.device_token,
                        avatar: response.data.image ? response.data.image : socicalValue.avatar,
                        loginToken: response.data.token,
                        osType: socicalValue.os_type,
                        lat: socicalValue.lat,
                        long: socicalValue.long,
                        stores: response.data.stores
                    });
                    
                    this._router.navigate(['/score', 'weekly']);
                } else {
                    this.processIsLoginSocialFail(socicalValue.type);
                    console.log(response);
                }
            }, error => {
                this.processIsLoginSocialFail(socicalValue.type);
                console.log(error);
            });
        });
    }
    
    processIsLoginSocialFail(type: number) {
        if (type == 1 && typeof facebookConnectPlugin !== 'undefined') {
            facebookConnectPlugin.logout(
                () => {
                    console.log('Facebook successful logout');
                },
                () => {
                    console.log('Facebook error logging out');
                }
            );
        } else if (type == 2 && typeof TwitterConnect !== 'undefined') {
            TwitterConnect.logout(
                () => {
                    console.log('Twitter successful logout');
                },
                () => {
                    console.log('Twitter error logging out');
                }
            )
        }
    }

    setTypeSubmit(type: string = "") {
        this.type = type;
    }
}