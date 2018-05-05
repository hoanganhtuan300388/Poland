import { Injectable } from '@angular/core';

function getWindow(): any {
    return window;
}

//@Injectable()
export class Utils {
    public static log(msg:string){
        console.log(msg);
    }

    public static getWindow(): any {
        return getWindow();
    }

}