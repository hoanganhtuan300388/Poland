import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Message } from '../services/message.service';
import { overlayConfigFactory } from "ngx-modialog";
//import { Modal as ModalDialog } from 'ngx-modialog/plugins/bootstrap';
import {
    Modal as ModalDialog,
    VEXModalContext
} from 'ngx-modialog/plugins/vex';

@Injectable()
export class MainService {

    private _notify = new Subject<any>();
    notifyObservable$ = this._notify.asObservable();
    private _loaderSubject = new Subject<any>();
    public loaderState = this._loaderSubject.asObservable();

    public title: string = '';
    public tabActive: string = '';
    public displayNav: boolean = false;
    public leftSidebar: any = false;
    public rightSidebar: any = false;
    public advertising: boolean = false;
    public loading: boolean = false;
    public rightState: string = 'active';
    public isConnected: boolean = true;
    public keyboardHeight: any = '';
    public data: any;
    public prevUrl: string = null;
    public nextUrl: string = null;

    //dialog
    protected isShowDialog: boolean = false;

    constructor(
      public modalDialog: ModalDialog
    ) {
        this.data = {};
        this.isShowDialog = false;
    }

    public notifyOther(data: any) {
        if (data) {
            this._notify.next(data);
        }
    }

    public getData(name) {
        if(this.data && this.data[name] !== undefined) {
            return this.data[name];
        }
        return null;
    }

    public getConnection() {
        return this.isConnected;
    }

    public setShowDialog(flag: boolean) {
        this.isShowDialog = flag;
    }

    public getShowDialog(): boolean {
        return this.isShowDialog;
    }
      
    public showConfirmDialog(mess) {
      if (this.getShowDialog()) {
          return;
      }
      this.setShowDialog(true);
      let dialogConfirm = this.modalDialog.confirm()
          .message(mess)
          //.isBlocking(true)
          .showCloseButton(false)
          .okBtn(Message.get('OK'))
          .cancelBtn(Message.get('Cancel'))
          .open()
          .catch(err => console.log('Error'))
          // catch error not related to the result (modal open...)
          .then((dialog: any) => {
              return dialog.result
          })
          return dialogConfirm;
    }
}