import { Routes, RouterModule } from '@angular/router';

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
import { ScoreDetailComponent } from './components/score-detail.component';
import { ScoreAddComponent } from './components/score-add.component';


import { LoginGuard } from './guards/login.guard';

const routing: Routes = [
    {
        path: '',
        redirectTo: 'splash',
        pathMatch: 'full'
    },
    {
        path: 'splash',
        component: SplashComponent
    },
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
                data: { title: 'ログイン', displayNav: false, leftSidebar: false, rightSidebar: false }
            },
            {
                path: 'signup',
                component: SignupComponent,
                data: { title: '新規登録', displayNav: false, leftSidebar: '戻る', rightSidebar: false }
            },
            {
                path: 'profile',
                component: ProfileComponent,
                data: { title: 'プロフィール登録', displayNav: false, leftSidebar: false, rightSidebar: false },
                canActivate: [LoginGuard]
            },
            {
                path: 'profile-store',
                component: ProfileStoreComponent,
                data: { title: 'プロフィール‐店舗選択', displayNav: false, leftSidebar: '戻る', rightSidebar: false },
                canActivate: [LoginGuard]
            },
            {
                path: 'score/:search',
                component: ScoreComponent,
                data: { title: 'スコア', displayNav: true, leftSidebar: false, rightSidebar: false, tabActive: 'score', advertising: true },
                canActivate: [LoginGuard]
            },
            {
                path: 'score-detail/:date',
                component: ScoreDetailComponent,
                data: { title: 'スコア', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'score' },
                canActivate: [LoginGuard]
            },
            {
                path: 'score-add',
                component: ScoreAddComponent,
                data: { title: 'ゲーム中', displayNav: true, leftSidebar: '戻る', rightSidebar: '保存', tabActive: 'score', rightState: 'inactive' },
                canActivate: [LoginGuard]
            },
            {
                path: 'friend',
                component: FriendComponent,
                data: { title: 'フレンド', displayNav: true, leftSidebar: 'マップ', rightSidebar: '探す', tabActive: 'friend', advertising: true },
                canActivate: [LoginGuard]
            },
            {
                path: 'friend-chat/:id',
                component: FriendChatComponent,
                data: { title: 'フレンドメッセージ', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'friend' },
                canActivate: [LoginGuard]
            },
            {
                path: 'friend-map',
                component: FriendMapComponent,
                data: { title: 'フレンド', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'friend' },
                canActivate: [LoginGuard]
            },
            {
                path: 'friend-search',
                component: FriendSearchComponent,
                data: { title: 'フレンド', displayNav: true, leftSidebar: '戻る', rightSidebar: '絞り込み', tabActive: 'friend' },
                canActivate: [LoginGuard]
            },
            {
                path: 'ranking',
                component: RankingComponent,
                data: { title: 'ランキング', displayNav: true, leftSidebar: false, rightSidebar: false, tabActive: 'ranking', advertising: true },
                canActivate: [LoginGuard]
            },
            {
                path: 'news',
                component: NewsComponent,
                data: { title: 'News', displayNav: true, leftSidebar: false, rightSidebar: false, tabActive: 'news', advertising: true },
                canActivate: [LoginGuard]
            },
            {
                path: 'news-detail',
                component: NewsDetailComponent,
                data: { title: 'News', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'news' },
                canActivate: [LoginGuard]
            },
            {
                path: 'my-page',
                component: MyPageComponent,
                data: { title: 'マイページ', displayNav: true, leftSidebar: false, rightSidebar: '編集', tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                path: 'profile-setting',
                component: ProfileSettingComponent,
                data: { title: 'プロフィール編集', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                path: 'profile-store-setting',
                component: ProfileStoreSettingComponent,
                data: { title: 'プロフィール‐店舗選択', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                // LuanDT Update tabActive: 'setting'  to store and remove leftSidebar: '戻る',
                path: 'store',
                component: StoreComponent,
                data: { title: '店舗情報', displayNav: true,  rightSidebar: false, tabActive: 'store' },
                canActivate: [LoginGuard]
            },
            {
                path: 'store-detail',
                component: StoreDetailComponent,
                data: { title: '店舗情報', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                path: 'store-map',
                component: StoreMapComponent,
                data: { title: '店舗情報', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                path: 'infomation',
                component: InfomationComponent,
                data: { title: 'ピリヤード協会情報 ', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                path: 'setting',
                component: SettingComponent,
                data: { title: '設定', displayNav: true, leftSidebar: '戻る', rightSidebar: '保存', tabActive: 'setting' },
                canActivate: [LoginGuard]
            },
            {
                path: 'policy',
                component: PolicyComponent,
                data: { title: '利用規約', displayNav: true, leftSidebar: '戻る', rightSidebar: false, tabActive: 'setting' },
                canActivate: [LoginGuard]
            }
        ]
    }
];

export const AppRoutes = RouterModule.forRoot(routing);