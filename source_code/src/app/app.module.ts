import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { ModalModule } from 'ngx-modialog';
import { MomentModule } from 'angular2-moment';

//import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';
import { VexModalModule } from 'ngx-modialog/plugins/vex';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';

import { BaseComponent } from './components/base.component';
import { AdvertisingComponent } from './components/advertising.component';
import { SplashComponent } from './components/splash.component';
import { MainComponent } from './components/main.component';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { ProfileComponent } from './components/profile.component';
import { ProfileStoreComponent } from './components/profile-store.component';
import { ScoreComponent } from './components/score.component';
import { FriendComponent } from './components/friend.component';
import { FriendChatComponent } from './components/friend-chat.component';
import { FriendMapComponent } from './components/friend-map.component';
import { FriendSearchComponent } from './components/friend-search.component';
import { RankingComponent } from './components/ranking.component';
import { NewsComponent } from './components/news.component';
import { NewsDetailComponent } from './components/news-detail.component';
import { MyPageComponent } from './components/my-page.component';
import { ProfileSettingComponent } from './components/profile-setting.component';
import { ProfileStoreSettingComponent } from './components/profile-store-setting.component';
import { StoreComponent } from './components/store.component';
import { StoreDetailComponent } from './components/store-detail.component';
import { StoreMapComponent } from './components/store-map.component';
import { InfomationComponent } from './components/infomation.component';
import { SettingComponent } from './components/setting.component';
import { PolicyComponent } from './components/policy.component';
import { ControlMessagesComponent } from './components/control-messages.component';
import { ScoreDetailComponent } from './components/score-detail.component';
import { ScoreAddComponent } from './components/score-add.component';

import { AppHttpService } from './services/app-http.service';
import { MainService } from './services/main.service';
import { WindowRefService } from './services/window-ref.service';
import { UserService } from './services/user.service';
import { NewsService } from './services/news.service';
import { NewsListService } from './services/news-list.service';
import { ValidationService } from './services/validate.service';
import { LoginService } from './services/login.service';
import { FriendService } from './services/friend.service';
import { FriendListService } from './services/friend-list.service';
import { CityService } from './services/city.service';
import { StoreService } from './services/store.service';
import { StoreListService } from './services/store-list.service';
import { ScoreService } from './services/score.service';
import { GameService} from './services/game.service';
import { RankingService } from './services/ranking.service';
import { PageService } from './services/page.service';
import { GeolocationService } from './services/geolocation.service';
import { AdvertisingService } from './services/advertising.service';

import { LoginGuard } from './guards/login.guard';

@NgModule({
  declarations: [
    AppComponent,
    BaseComponent,
    AdvertisingComponent,
    SplashComponent,
    MainComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    ProfileStoreComponent,
    ScoreComponent,
    FriendComponent,
    FriendChatComponent,
    FriendMapComponent,
    FriendSearchComponent,
    RankingComponent,
    NewsComponent,
    NewsDetailComponent,
    MyPageComponent,
    ProfileSettingComponent,
    ProfileStoreSettingComponent,
    StoreComponent,
    StoreDetailComponent,
    StoreMapComponent,
    InfomationComponent,
    SettingComponent,
    PolicyComponent,
    ControlMessagesComponent,
    ScoreDetailComponent,
    ScoreAddComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    HttpModule,
    AppRoutes,
    InfiniteScrollModule,
    ModalModule.forRoot(),
    //BootstrapModalModule,
    VexModalModule
  ],
  providers: [
    AppHttpService,
    MainService,
    WindowRefService,
    UserService,
    NewsService,
    NewsListService,
    ValidationService,
    LoginService,
    CityService,
    FriendService,
    FriendListService,
    StoreService,
    StoreListService,
    ScoreService,
    GameService,
    RankingService,
    PageService,
    GeolocationService,
    AdvertisingService,
    LoginGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
