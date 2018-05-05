import { Injectable } from '@angular/core';

@Injectable()
export class Message {

    protected static messages = {
        'OK': 'OK',
        'Back': 'Back',
        'Cancel': 'Cancel',
        'News': 'News',
        'Exit': '終了',
        'Reconnect': '再接続',
        'No data': 'データがありません。',
        'No internet connection': 'インターネットに接続されていません。',
        'Do you want to quit game?': 'ゲームを終了してもよろしいですか。',
        'Input score completed': 'FINISH！諦めずに完走おめでとう！',
        'Cannot connect to server. Try again.'
            : 'サーバーに接続できません。もう一度試してください。',
        'Please make sure that your device are connected to the internet'
            : '必ずインターネットに接続してください。',
        'Please input all score': '全てのスコアを入力してください。',
        'The server is currently unavailable. Please try again few minute.'
            : '現在サーバーを使用できません。しばらくしてからもう一度試してください。',
        'Do you want to resume game?'
            : '途中ゲームを続けますか。',
        'Exit application?' : '本アプリを終了してよろしいでしょうか。',
        'Request add friend. please confirm.' : 'フレンド申請がありました。確認してください'
    }
    public static get(name: string): string {

        let lowerName = name.toLowerCase(),
            upperName = name.toUpperCase(),
            firstUpperName = name.charAt(0).toUpperCase() + name.slice(1);

        if(this.messages[name] !== undefined) {
            return this.messages[name];
        }else if(this.messages[firstUpperName] !== undefined) {
            return this.messages[firstUpperName];
        }else if(this.messages[lowerName] !== undefined) {
            return this.messages[lowerName];
        }else if(this.messages[upperName] !== undefined) {
            return this.messages[upperName];
        }
        return name;
    }
}