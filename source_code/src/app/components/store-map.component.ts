import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MainService } from '../services/main.service';
import { App as AppService } from '../services/app.service';

declare var google: any;

@Component({
    selector: 'app-store-map-view',
    templateUrl: '../views/store-map.component.html'
})
export class StoreMapComponent {
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService
    ) {

    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/store-detail'])
                }
            }
        });

        this.loadGoogleMap();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadGoogleMap() {
        let store: any = JSON.parse(localStorage.getItem('viewDetailStore'));
        console.log(store);

        let latitude: number = store.lat ? store.lat : AppService.getConfig('defaultLat');
        let longitude: number = store.long ? store.long : AppService.getConfig('defaultLong'); 
        
        let centerLocation: any = new google.maps.LatLng(latitude, longitude);

        let mapProp: any = {
            center: centerLocation,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        let map: any = new google.maps.Map(document.getElementById("gmap"), mapProp);

        let contentString: string = `
            <div style="height:25px">
                <div style="float:left;padding-right:10px">
                    <img src="./assets/img/store-icon.png" style="width:25px;height:25px" /> 
                </div>
                <div style="float:left;padding-top:5px">
                    <span>${store.name}</span>
                </div>
            </div>
            `;

        let latLng: any = new google.maps.LatLng(latitude, longitude);

        let options: any = {
            position: latLng,
            map: map,
            icon: "./assets/img/friend-marker.png"
        };

        let marker: any = new google.maps.Marker(options);

        let infoWindow: any = new google.maps.InfoWindow({
            content: contentString
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        })

        infoWindow.open(map, marker);
    }
}