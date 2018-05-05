import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../services/user.service';
import { MainService } from '../services/main.service';
import { StoreService } from '../services/store.service';
import { LoginService } from '../services/login.service';
import { ValidationService } from '../services/validate.service';

declare var navigator;
declare var CameraPopoverOptions;

@Component({
    selector: 'app-profile-view',
    templateUrl: '../views/profile-setting.component.html'
})
export class ProfileSettingComponent implements OnInit, OnDestroy {
    public profileForm: any;
    public stores: any;
    public isChangeAvatar: boolean = false;
    public profileImageUrl: string = "./assets/img/avatar.png";
    public imageData: any = null;
    private _id: number;
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _mainService: MainService,
        private _storeService: StoreService,
        private _loginService: LoginService,
        private _formBuilder: FormBuilder,
        private _ngZone: NgZone
    ) {

    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/my-page']);
                }
            }
        });

        if (this._loginService.userLogged.avatar) {
            this.profileImageUrl = this._loginService.userLogged.avatar;
        }

        if (this._loginService.userLogged.imageData) {
            this.imageData = this._loginService.userLogged.imageData;
        }

        this.stores = this._loginService.userLogged.stores;

        this.restartForm();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
    
    restartForm() {
        this.profileForm = this._formBuilder.group({
            nickname: [this._loginService.userLogged.nickname, []],
            comment: [this._loginService.userLogged.comment, [Validators.maxLength(140)]],
            usetxt: [this._loginService.userLogged.usetxt, [Validators.maxLength(255)]]
        });
    }

    changeAvatar() {
        if (this.isChangeAvatar == false) {
            this.isChangeAvatar = true;
        }
    }

    choiseImageFrom(from: string) {
        if (typeof navigator !== 'undefined' && typeof CameraPopoverOptions !== 'undefined') {
            let options: any = {};

            if (from == 'camera') {
                options = {
                    quality: 100,
                    allowEdit: false,
                    targetHeight: 100,
                    targetWidth: 100,
                    destinationType: navigator.camera.DestinationType.FILE_URI
                };
            } else {
                options = {
                    targetHeight: 100,
                    targetWidth: 100,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                    quality: 100
                };
            }

            let onSuccess: Function = (imageUri) => {
                this._ngZone.run(() => {
                    this.profileImageUrl = imageUri;

                    this.imageData = {
                        fileKey: "image",
                        imageURI: imageUri,
                        mimeType: "image/jpeg"
                    };

                    this.isChangeAvatar = false;
                });
            };

            let onError: Function = (error) => {
                console.log(JSON.stringify(error));
            };

            navigator.camera.getPicture(onSuccess, onError, options);
        } else {
            console.log("これはデバイスではありません。");
        }
    }

    cancelChangeAvatar() {
        if (this.isChangeAvatar == true) {
            this.isChangeAvatar = false;
        }
    }

    redirectProfileStore() {
        this.updateProfile(true);
    }

    updateProfile(setProfile: boolean = false) {
        if (setProfile == false) {
            if (this.profileForm.valid) {
                let storeIds = [];

                this.stores.forEach((store, index) => {
                    storeIds.push(store.id);
                });

                let data: any = {
                    nickname: this.profileForm.value.nickname,
                    comment: this.profileForm.value.comment,
                    usetxt: this.profileForm.value.usetxt,
                    clubs: storeIds
                };

                if (this.imageData) {
                    this._userService.registerProfileDevice(
                        this.imageData,
                        data,
                        (response) => {
                            let res: any = JSON.parse(response);

                            if (res.code == 200) {
                                this._loginService.setUpdateProfile(res.data);
                                this._ngZone.run(() => { this._router.navigate(['/my-page']); });
                            } else {
                                console.log(JSON.stringify(res));
                            }
                        },
                        (error) => {
                            console.log(JSON.stringify(error));
                        }
                    );
                } else {
                    this._userService.registerProfileBrowser(data).subscribe((response: any) => {
                        if (response.code == 200) {
                            this._loginService.setUpdateProfile(response.data);
                            this._router.navigate(['/my-page']);
                        } else {
                            console.log(JSON.stringify(response));
                        }
                    }, error => {
                        console.log(JSON.stringify(error));
                    });
                }
            }
        } else {
            this._loginService.userLogged.nickname = this.profileForm.value.nickname;
            this._loginService.userLogged.comment = this.profileForm.value.comment;
            this._loginService.userLogged.usetxt = this.profileForm.value.usetxt;
            this._loginService.userLogged.imageData = this.imageData;
            this._loginService.userLogged.avatar = this.profileImageUrl;
            this._router.navigate(['/profile-store-setting']);
        }
    }
}