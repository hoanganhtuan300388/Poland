init project

Cai node module
https://github.com/orizens/ngx-infinite-scroll
npm install ngx-infinite-scroll --save

npm install moment --save
npm install underscore --save
npm install ngx-modialog --save
npm install --save angular2-moment


*) Run source angular trên sv nodejs
	gõ lệnh: ng serve --open

*) build Angular vào thư mục www của cordova
	1) cd đến thư mục source_code
	2) gõ lệnh: 
ng build --target=production --environment=prod --output-path ../cordova/www --base-href ./


cordova create poland com.gmorunsystem.poland Poland
cd poland
cordova platform add android
cordova platform add ios
cordova platform remove android
cordova platform remove ios

cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-facebook4 --variable APP_ID=139532123311808 --variable APP_NAME=billad
cordova plugin add twitter-connect-plugin --variable FABRIC_KEY=bR3JLguVMcSzDVVC5R8P246Qs

cordova plugin add cordova-plugin-geolocation --variable GEOLOCATION_USAGE_DESCRIPTION="[App Name] would like to access your location when running and displayed."
cordova plugin add cordova-plugin-fcm
cordova plugin add cordova-plugin-network-information
cordova plugin add ionic-plugin-keyboard --save
cordova plugin add cordova-plugin-console
cordova plugin add cordova-plugin-statusbar


cordova plugin remove cordova-plugin-dialogs


*) build cordova ra android
gõ lệnh: 
cordova build android
	
*) build cordova ra ios
	gõ lệnh: 
cordova build ios


cordova plugin add cordova-plugin-device
https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-device/

cordova plugin add cordova-plugin-geolocation
https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/

https://www.npmjs.com/package/cordova-plugin-fcm
https://github.com/fechanique/cordova-plugin-fcm
cordova plugin add cordova-plugin-fcm
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer


