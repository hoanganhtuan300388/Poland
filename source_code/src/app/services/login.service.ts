import { Injectable } from '@angular/core';

import { App } from '../services/app.service';

declare var facebookConnectPlugin;
declare var TwitterConnect;

@Injectable()
export class LoginService {

    public userLogged: any = this.getDefaultUserLogged();

    getDefaultUserLogged(): any {
        return {
            id: null,
            email: '',
            password: '',
            uid: '',
            socialType: 0, //1 fb, 2 twi
            avatar: '',
            imageData: null,
            nickname: '',
            comment: '',
            usetxt: '',
            stores: [],
            lat: 0,
            long: 0,
            deviceToken: '',
            loginToken: '',
            osType: 1, //1 android, 2 ios
            isLogged: false
        };
    }

    getUserLogged(): any {
        return JSON.parse(localStorage.getItem('userLogged'));
    }

    getLoginToken(): string {
        let userLogged = JSON.parse(localStorage.getItem('userLogged'));

        if (userLogged) {
            return userLogged.loginToken;
        }

        return null;
    }

    isLogged(): boolean {
        let userLogged = JSON.parse(localStorage.getItem('userLogged'));

        if (userLogged) {
            return userLogged.isLogged;
        }

        return false;
    }

    getDeviceToken() {
        return App.getStorage('device_token');
    }

    getOsType() {
        let osType = App.getStorage('app.osType');
        return osType ? osType : 1;
    }

    setRegisterLogin(registerValue: any) {
        this.userLogged.id = registerValue.id;
        this.userLogged.email = registerValue.email;
        this.userLogged.password = registerValue.password;
        this.userLogged.deviceToken = registerValue.deviceToken;
        this.userLogged.loginToken = registerValue.loginToken;
        this.userLogged.osType = registerValue.osType;
        this.userLogged.isLogged = true;
        this.userLogged.socialType = 0;
        localStorage.setItem('userLogged', JSON.stringify(this.userLogged));
    }

    setLogin(loginValue: any) {
        this.userLogged.id = loginValue.id;
        this.userLogged.email = loginValue.email;
        this.userLogged.password = loginValue.password;
        this.userLogged.deviceToken = loginValue.deviceToken;
        this.userLogged.loginToken = loginValue.loginToken;
        this.userLogged.osType = loginValue.osType;
        this.userLogged.lat = loginValue.lat;
        this.userLogged.long = loginValue.long;
        this.userLogged.stores = loginValue.stores;
        this.userLogged.avatar = loginValue.avatar;
        this.userLogged.isLogged = true;
        this.userLogged.socialType = 0;
        localStorage.setItem('userLogged', JSON.stringify(this.userLogged));
    }

    setLoginSocial(socialValue: any) {
        this.userLogged.id = socialValue.id;
        this.userLogged.uid = socialValue.uid;
        this.userLogged.socialType = socialValue.socialType
        this.userLogged.deviceToken = socialValue.deviceToken;
        this.userLogged.loginToken = socialValue.loginToken;
        this.userLogged.osType = socialValue.osType;
        this.userLogged.lat = socialValue.lat;
        this.userLogged.long = socialValue.long;
        this.userLogged.avatar = socialValue.avatar;
        this.userLogged.stores = socialValue.stores;
        this.userLogged.socialType = socialValue.socialType;
        this.userLogged.isLogged = true;
        localStorage.setItem('userLogged', JSON.stringify(this.userLogged));
    }

    logout() {
        let user: any = this.getUserLogged();
        if(user) {
            if (user.socialType == 1 && typeof facebookConnectPlugin !== 'undefined') {
                facebookConnectPlugin.logout(
                    () => {
                        console.log('Facebook successful logout');
                    },
                    () => {
                        console.log('Facebook error logging out');
                    }
                );
            } else if (user.socialType == 2 && typeof TwitterConnect !== 'undefined') {
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

        this.userLogged = this.getDefaultUserLogged();
        localStorage.removeItem('userLogged');
        localStorage.removeItem('advertising');
    }

    setUpdateProfile(updateValue: any) {
        let userLogged: any = this.getUserLogged();
        userLogged.comment = updateValue.comment;
        userLogged.usetxt = updateValue.usetxt;
        userLogged.avatar = updateValue.image;
        userLogged.nickname = updateValue.nickname;
        localStorage.setItem('userLogged', JSON.stringify(userLogged));
    }

    public setStoresChoise(store) {
        if (this.userLogged.stores.length <= 9) {
            let chk: boolean = false;
            this.userLogged.stores.forEach(element => {
                if (element.id == store.id) {
                    chk = true;
                }
            });

            if (chk == false) {
                this.userLogged.stores.push(store);
                return true;
            }
        }

        return false;
    }
}