import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { LoginService } from '../services/login.service';

@Component({
    selector: 'app-splash-view',
    templateUrl: '../views/splash.component.html'
})
export class SplashComponent {
    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _loginService: LoginService
    ) {
        setTimeout(() => {
            let userLogged: any = this._loginService.getUserLogged();
            
            if(userLogged && userLogged.isLogged === true) {
                _router.navigate(['/score/weekly']);
            } else {
                _router.navigate(['/login']);
            }
        }, 3000)
    }
}