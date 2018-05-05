import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as moment from 'moment';

function getWindow(): any {
    return window;
}

@Injectable()
export class App {
    public static getConfig(name: string, defaultVal: string = ''): any {
        if(name.indexOf('.') !== -1) {
            let arrTmp = name.split('.');
            if(arrTmp.length === 2 ) {
                let tmp = environment[arrTmp[0]] ? environment[arrTmp[0]] : {};
                return tmp[arrTmp[1]] ? tmp[arrTmp[1]] : defaultVal;
            }else if(arrTmp.length === 3 ) {
                let tmp1 = environment[arrTmp[0]] ? environment[arrTmp[0]] : {},
                    tmp2 = tmp1[arrTmp[1]] ? tmp1[arrTmp[1]] : {};
                return tmp2[arrTmp[2]] ? tmp2[arrTmp[2]] : defaultVal;
            }
        }

        return environment[name] ? environment[name] : defaultVal;
    }

    public static getMoment(inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): any {

        return moment(inp, format, strict);
    }

    public static log(msg:string) {
        console.log(msg);
    }

    public static getWindow(): any {
        return getWindow();
    }

    public static getApiUrl(): string {
        return environment.apiUrl;
    }

    public static getStorage(name: string, defaultValue = null): any {
        let ret = localStorage.getItem(name);
        if(!ret) {
            return defaultValue;
        }
         let found1 = ret.indexOf('{');
         let found2 = ret.indexOf('}');

         if(ret && found1 !== -1 && found2 !== -1) {
            try {
                ret = JSON.parse(ret);
                return ret;
            }catch (err) {
            }
        }
        return ret;
    }

    public static setStorage(name: string, value: any): void {
        if((typeof value === 'object') || (Array.isArray(value))) {
            value = JSON.stringify(value);
        }
        localStorage.setItem(name, value);
    }

    public static deleteStorage(name: string): void {
        localStorage.removeItem(name);
    }

    public static getSession(name: string, defaultValue = null): any {
        let ret = sessionStorage.getItem(name);
        if(!ret) {
            return defaultValue;
        }

        let found1 = ret.indexOf('{');
        let found2 = ret.indexOf('}');

        if(ret && found1 !== -1 && found2 !== -1) {
            try {
                ret = JSON.parse(ret);
                return ret;
            }catch (err) {
            }
        }
        return ret;
    }

    public static setSession(name: string, value: any): void {
        if((typeof value === 'object') || (Array.isArray(value))) {
            value = JSON.stringify(value);
        }
        sessionStorage.setItem(name, value);
    }

    public static deleteSession(name: string): void {
        sessionStorage.removeItem(name);
    }

}