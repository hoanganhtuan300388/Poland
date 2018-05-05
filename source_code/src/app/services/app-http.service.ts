import { Injectable } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs, Response, Request, Headers, XHRBackend, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { App } from '../services/app.service';
import { MainService } from './main.service';
import { LoginService } from './login.service';

declare var FileUploadOptions;
declare var FileTransfer;

@Injectable()
export class AppHttpService extends Http {
    //'http://103.18.6.158:1111/api/';
    public apiUrl: string = App.getConfig('apiUrl');
    protected isError:boolean = false;
    protected showLoading: boolean = true;

    constructor(
        public backend: XHRBackend,
        public defaultOptions: RequestOptions,
        protected _mainService: MainService,
        protected _loginService: LoginService
    ) {
        super(backend, defaultOptions);
    }

    public disableShowLoading() {
        this.showLoading = false;
    }

    public get(url: string, searchParams: any = {}, options?: RequestOptionsArgs): Observable<any> {
        this._showLoader();

        return super.get(this._getFullUrl(url), this._requestOptions(options, 'get', searchParams))
            .catch(this._onCatch)
            .do((res: Response) => {
                this._onSuccess(res);
            }, (error: any) => {
                this._onError(error);
            })
            .finally(() => {
                this._onEnd();
            });
    }

    public post(url: string, params: any, options?: RequestOptionsArgs, isFromData: boolean = false): Observable<any> {
        this._showLoader();

        let request: any = null;

        if (isFromData === false) {
            request = this._getUrlSearchParams(params);
        } else {
            request = this._getFormData(params);
        }

        return super.post(this._getFullUrl(url), request, this._requestOptions(options, 'post'))
            .catch(this._onCatch)
            .do((res: Response) => {
                this._onSuccess(res);
            }, (error: any) => {
                this._onError(error);
            })
            .finally(() => {
                this._onEnd();
            });
    }

    public put(url: string, params: any, options?: RequestOptionsArgs): Observable<any> {
        this._showLoader();

        let request: URLSearchParams = this._getUrlSearchParams(params);

        return super.put(this._getFullUrl(url), request, this._requestOptions(options, 'put'))
            .catch(this._onCatch)
            .do((res: Response) => {
                this._onSuccess(res);
            }, (error: any) => {
                this._onError(error);
            })
            .finally(() => {
                this._onEnd();
            });
    }

    public deviceUpload(url: string, file: any, params: any, onSuccess = (res) => { }, onError = (err) => { }) {
        this._showLoader();

        let success = (res) => {
            this._onEnd();
            onSuccess(res.response);
        };

        let error = (err) => {
            this._onEnd();
            onError(err);
        };

        let options = new FileUploadOptions();

        options.headers = { 'Authorization': 'Bearer ' + this._loginService.getLoginToken() };
        
        if(file != null) {
            options.fileKey = file.fileKey;
            options.fileName = file.imageURI.substr(file.imageURI.lastIndexOf('/') + 1);
            options.mimeType = file.mimeType;
        }
        
        let data: any = {}; 
        for (let key in params) {
            if (params[key] instanceof Array) {
                for (let value of params[key]) {
                    data[key + '[' + value + ']'] = value;
                }
            } else {
                data[key] = params[key];
            }
        }

        options.params = data;

        let fileTransfer = new FileTransfer();
        return fileTransfer.upload(file.imageURI, encodeURI(this._getFullUrl(url)), success, error, options);
    }

    protected _requestOptions(options?: RequestOptionsArgs, type: string = 'get', searchParams: any = null): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }

        if (options.headers == null) {
            options.headers = new Headers();
        }

        //options.headers.append('Content-Type', 'application/json');
        options.headers.append('Authorization', 'Bearer ' + this._loginService.getLoginToken());
        //console.log(this._loginService.getLoginToken());

        if (type == 'get' && searchParams != null) {
            let urlSearchParams: URLSearchParams = new URLSearchParams();
            for (let key in searchParams) {
                urlSearchParams.append(key, searchParams[key]);
            }

            options.search = urlSearchParams;
        }

        return options;
    }

    protected _getUrlSearchParams(params: any): URLSearchParams {
        let urlSearchParams = new URLSearchParams();

        for (let key in params) {
            if (params[key] instanceof Array) {
                for (let value of params[key]) {
                    urlSearchParams.append(key + '[]', value);
                }
            } else {
                urlSearchParams.append(key, params[key]);
            }
        }

        return urlSearchParams;
    }

    private _getFormData(params: any): FormData {
        let formData: FormData = new FormData();

        for (let key in params) {
            if (params[key] instanceof File) {
                formData.append(key, params[key], params[key].name);
            } else if (params[key] instanceof Array) {
                for (let value of params[key]) {
                    formData.append(key + '[]', value);
                }
            } else {
                formData.append(key, params[key]);
            }
        }

        return formData;
    }

    protected _getFullUrl(url: string): string {
        console.log(this.apiUrl + url);
        return this.apiUrl + url;
    }

    protected _onCatch(error: any, caught: Observable<any>): Observable<any> {
        return Observable.throw(error);
    }

    protected _onSuccess(response: Response): void {
        console.log('Request successful', response);
    }

    protected _onError(response: Response): void {
        this._mainService.notifyOther({ option: 'apiError', code: response.status, response: response});
        console.log('Error status code', response.status);
        this.isError = true;
    }

    protected _onEnd(): void {
        this._hideLoader();
    }

    protected _showLoader(): void {
        this._mainService.notifyOther({ option: 'loading', value: true });
    }

    protected _hideLoader(): void {
        this._mainService.notifyOther({ option: 'loading', value: false });
    }
}