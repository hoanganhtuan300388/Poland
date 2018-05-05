import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { MainService } from '../services/main.service';
import { FriendService } from '../services/friend.service';
import { App as AppService } from '../services/app.service';

declare var google: any;

@Component({
    selector: 'app-friend-map-view',
    templateUrl: '../views/friend-map.component.html'
})
export class FriendMapComponent {
    private _subscription: Subscription;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _mainService: MainService,
        private _friendService: FriendService
    ) {

    }

    ngOnInit() {
        this._subscription = this._mainService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'headerAction') {
                if (res.value == 'left') {
                    this._router.navigate(['/friend'])
                }
            }
        });

        this.loadGoogleMap();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    loadGoogleMap() {
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude: number = position.coords.latitude ? position.coords.latitude : AppService.getConfig('defaultLat');
            let longitude: number = position.coords.longitude ? position.coords.longitude : AppService.getConfig('defaultLong');

            let centerLocat: any = new google.maps.LatLng(latitude, longitude);

            let mapProp: any = {
                center: centerLocat,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            
            let map: any = new google.maps.Map(document.getElementById("gmap"), mapProp);

            let markerCenter: any = new google.maps.Marker({
                position: centerLocat,
                map: map,
                icon: new google.maps.MarkerImage(
                    "./assets/img/cluster-icon.png",
                    new google.maps.Size(41, 41),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(20, 20)
                )
            });

            let circle: any = new google.maps.Circle({
                center: centerLocat,
                radius: 1000,
                fillColor: "#0000FF",
                fillOpacity: 0.2,
                map: map,
                strokeColor: "#FFFFFF",
                strokeOpacity: 0.1,
                strokeWeight: 2
            });
            
            this._friendService.getFriendMap().subscribe(
                (response: any) => {
                    if (response.code == 200) {
                        this.loadMarker(map, response.data.clubs, false);
                        this.loadMarker(map, response.data.friends, true);
                    } else {
                        console.log(response);
                    }
                },
                (error: any) => {
                    console.log(error);
                }
            );
        }, (error) => {
            console.log(error);
        });
    }

    loadMarker(map, list: any = [], isFriend = true) {
        list.forEach((item) => {
            let avatar: string = "./assets/img/store-icon.png";
            let name: string = "";

            if (isFriend == true) {
                avatar = item.avatar ? item.avatar : "./assets/img/avatar.png";
                name = item.nickname ? item.nickname : "不明な名前";
            } else {
                name = item.nickname ? item.nickname : "不明な名前";
            }


            let contentString: string = `
                <div style="height:25px">
                    <div style="float:left;padding-right:10px">
                        <img src="${avatar}" style="width:25px;height:25px" /> 
                    </div>
                    <div style="float:left;padding-top:5px">
                        <span>${name}</span>
                    </div>
                </div>
                `;

            let marker: any = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat, item.long),
                map: map,
                icon: "./assets/img/friend-marker.png"
            });

            let infoWindow: any = new google.maps.InfoWindow({
                content: contentString,
                disableAutoPan: true
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            })

            infoWindow.open(map, marker);
        });
    }
}