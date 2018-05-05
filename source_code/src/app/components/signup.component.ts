import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MainService } from '../services/main.service';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validate.service';
import { LoginService } from '../services/login.service';

declare var facebookConnectPlugin;
declare var TwitterConnect;

@Component({
    selector: 'app-signup-view',
    templateUrl: '../views/signup.component.html'
})
export class SignupComponent implements OnInit {
    public signupForm: any;
    private _location = {
        lat: 0,
        long: 0
    }
    private _subscription: Subscription;
  
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
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value === 'left') {
                    this._router.navigate(['/login']);
                }
            }
        });
        this.setLocation();
        this.restartForm();
    }
    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
    setLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude: number = position.coords.latitude ? position.coords.latitude : 0;
            let longitude: number = position.coords.longitude ? position.coords.longitude : 0;
            this._location = {
                lat: latitude,
                long: longitude
            }
        });
    }

    restartForm() {
        this.signupForm = this._formBuilder.group({
            'email': ['', [Validators.required, ValidationService.emailValidator]],
            'password': ['', [Validators.required, ValidationService.passwordValidator]]
        });
    }

    signupUsually() {
        if (this.signupForm.dirty && this.signupForm.valid) {
            this.signupForm.value.device_token = this._loginService.getDeviceToken();
            this.signupForm.value.os_type = this._loginService.getOsType();
            this.signupForm.value.lat = this._location.lat;
            this.signupForm.value.long = this._location.long;

            this._userService.signup(this.signupForm.value).subscribe((response: any) => {
                if(response.code == 200) {
                    this._loginService.setRegisterLogin({
                        id: response.data.id,
                        email: this.signupForm.value.email,
                        password: this.signupForm.value.password,
                        loginToken: response.data.token,
                        osType: this.signupForm.value.os_type
                    });

                    this._ngZone.run(() => this._router.navigate(['/profile']));
                } else {
                    console.log(response);
                }
            }, error => {
                console.log(error);

                if(error.status == 422) {
                    let body: any = JSON.parse(error._body);
                    //alert(body.data.email);
                    this._mainService.notifyOther({
                        option: 'changeData',
                        data: {'dialog': ["メールまたはパスワード が間違っています。", "alert"]}
                    });
                }
            });
        }
    }

    signupSocical(socicalName: string) {
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
                            socicalValue.type = 1; //2 facebook
                            socicalValue.nickname = result.name;
                            socicalValue.avatar = result.picture.data.url;

                            this.signupSocicalSuccess(socicalValue);
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

                            this.signupSocicalSuccess(socicalValue);
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

    signupSocicalSuccess(socicalValue: any) {
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
                        long: socicalValue.long
                    });

                    this.loadDataUserLogged();
                } else {
                    console.log(response);
                }
            }, error => {
                console.log(error);
            });
        });
    }

    loadDataUserLogged() {
        this._userService.getProfile().subscribe(
            (response: any) => {
                if (response.code == 200) {
                    this._loginService.userLogged.nickname = response.data.nickname;
                    //this._loginService.userLogged.comment = response.data.comment;
                    this._loginService.userLogged.avatar = response.data.image;
                    this._loginService.userLogged.stores = response.data.clubs;
                    
                    this._router.navigate(['/profile']);
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