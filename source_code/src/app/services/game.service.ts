import { Injectable, LOCALE_ID } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Http, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { App } from '../services/app.service';
import * as _ from 'underscore';

import { AppHttpService } from './app-http.service';
import { Frame, Round } from '../services/Frame.model';

@Injectable()
export class GameService {
    private _stateSubject = new Subject<any>();
    public gameState$ = this._stateSubject.asObservable();

    currentFrame: Frame;
    group1: Frame[];
    group2: Frame[];
    rounds: Round[];
    currentRoundId: number;
    startTime: any = null;
    startTimeTmp: any = null;
    endTime: any = null;
    score: number = 0;
    club: Object;
    total_strike: number = 0;
    total_spare: number = 0;
    totalTime: number = 0;

    constructor(
        protected _http: AppHttpService
    ) {
        this.rounds = [];
        this.init();
    }

    getGameDetail(params: Object): Observable<any> {
        return this._http.get('game/detail', params)
            .map((response: Response) => response.json());
    }

    sendToApi(): Observable<any> {
        //let totalTime = this.endTime - this.startTime;//this.endTime.diff(this.startTime, 'seconds') ;
        let params = {
            club_id: this.getClubId(),
            started_at: App.getMoment(this.startTime).format("YYYY/MM/DD HH:mm:ss"),
            ended_at: App.getMoment(this.endTime).format("YYYY/MM/DD HH:mm:ss"),
            score: this.score,
            total_strike: this.total_strike,
            total_spare: this.total_spare,
            total_time: this.second2Minute(Math.ceil(this.totalTime/1000)),
            data: this.getDataToSend()
        };
        return this._http.post('game', params)
            .map((response: Response) => response.json());
    }

    public removeStorage() {
        App.deleteStorage('game.data');
    }
    
    protected pad(num): any {
      return ("0"+num).slice(-2);
    }

    protected second2Minute(seconds): any {
      let minutes = Math.ceil(parseInt(seconds, 10) / 60);
      //secs = seconds%60;
      //var hours = Math.floor(minutes/60)
      //minutes = minutes%60;
      //return pad(hours)+":"+pad(minutes)+":"+pad(secs);
      //var format =  Math.floor(moment.duration(seconds,'seconds').asHours()) + ':' + moment.duration(seconds,'seconds').minutes() + ':' + moment.duration(seconds,'seconds').seconds();
      return minutes;
    }

    protected getDataToSend(): string {
        let data = [];

        data = data.concat(this.group1, this.group2);
        return JSON.stringify(data);
    }

    public setCurrentFrame(id): Frame {
        if(id < 5 && id >=0) {
            this.currentFrame = this.group1[id];
        }else if((id >= 5 && id < 10)) {
            this.currentFrame = this.group2[id-5];
        }

        return this.currentFrame;
    }

    public getCurrentFrame(): any {
        return this.currentFrame;
    }

    public getFrameGroup(id): any {
        if(id == 2) {
            return this.group2;
        }else {
            return this.group1;
        }
    }

    public setScore(score): any {
        if(!this.currentFrame) {
            return;
        }
        let nextFrame = false,
            roundIdx = this.currentFrame.getRoundIdx(),
            frameId = this.currentFrame.id;

        score = parseInt(score, 10);
        this.addRound(score, false, false, roundIdx);

        if(roundIdx < 1) {
            this.currentFrame.setNextRound();
        }
        if(frameId == 10) {
            if(roundIdx >= 1 && roundIdx <= 2) {
                this.currentFrame.setNextRound();
            }
            if(roundIdx > 0) {
                nextFrame = true;
            }
        }else {
            if(roundIdx > 0) {
                nextFrame = true;
            }
        }

        if(nextFrame) {
            this.setNextFrame();
        }

        return this.currentFrame;
    }

    public setBonus(): any {
        if(!this.currentFrame) {
            return;
        }
        let roundIdx = this.currentFrame.getRoundIdx();
        let frameId = this.currentFrame.id;

        //set 10 point of pin
        if(roundIdx < 1) {
            this.addRound(10, true, false);
            this.currentFrame.setStrike(true);
        }else if(roundIdx == 1 && frameId < 10) {
            this.addRound(10, false, true);
            this.currentFrame.setSpare(true);
        }
        if(frameId == 10 ) {
            if(roundIdx >0) {
                let preScore = this.currentFrame.getScore(roundIdx - 1);
                let canStrike = this.canStrike(roundIdx);

                if (canStrike == true) {
                    this.addRound(10, true, false);
                } else {
                    this.addRound(10, false, true);
                }
            }
            this.currentFrame.setNextRound();
        }

        this.setNextFrame();
        return this.currentFrame;
    }

    public setGrub(): any {
        if(!this.currentFrame) {
            return;
        }
        let nextFrame = false,
            roundIdx = this.currentFrame.getRoundIdx(),
            frameId = this.currentFrame.id;

        this.addRound(0, false, false, roundIdx);

        if(roundIdx < 1) {
            this.currentFrame.setNextRound();
        }
        if(frameId == 10) {
            if(roundIdx >= 1 && roundIdx <= 2) {
                this.currentFrame.setNextRound();
            }
            if(roundIdx > 0) {
                nextFrame = true;
            }
        }else {
            if(roundIdx > 0) {
                nextFrame = true;
            }
        }

        if(nextFrame) {
            this.setNextFrame();
        }

        return this.currentFrame;
    }

    public clear(): any {
        if(!this.currentFrame) {
            return true;
        }
        let roundIdx = this.currentFrame.getRoundIdx(),
            frameIdx = this.currentFrame.id;
        
        if(frameIdx == 10) {
          this.cancelFinishGame();
        }
        //set 10 point of pin
        if(roundIdx > 0) {
          this.removeRound();
        }
        this.currentFrame.clear();
        if(frameIdx > 1 && !roundIdx) {
          this.setPreFrame();
          this.clearPre();
        }

        return true;
    }

    public clearPre(isCallback = false): any {
        if(!this.currentFrame) {
            return true;
        }
        let roundIdx = this.currentFrame.getRoundIdx(),
            frameIdx = this.currentFrame.id;
        
        if(!this.currentFrame.strike) {
          this.currentFrame.popRound();
        }
        //set 10 point of pin
        if(roundIdx > 0 || this.currentFrame.strike) {
          this.removeRound();
        }
        if(!roundIdx || this.currentFrame.strike) {
          this.currentFrame.clear();
        }
        return true;
    }
      
    protected addRound(score, strike, spare, roundIdx?: number): any {
        let preRound = this.rounds.length>0? this.rounds[this.currentRoundId-1] : null,
            frameIdx = this.currentFrame.id;
        if(strike) {
            score = 10;
            spare = false;
            this.incrementStrike();
        }else if(spare) {
            score = 10-preRound.getScore();
            this.incrementSpare();
        }else {

            if(roundIdx && preRound && frameIdx < 10) {
                if(score + preRound.getScore() >= 10) {
                    spare = true;
                    this.incrementSpare();
                    this.currentFrame.setSpare(true);
                }
             }
        }

        this.addScore(score);
        //this.currentFrame.addTotal(this.score);
        //add round
        let round = new Round(score, strike, spare);
        round.setFrameId(this.currentFrame.id);

        this.rounds.push(round);
        this.currentFrame.setScore(score);
        this.checkAddPreFrame();

        this.currentRoundId = this.currentRoundId+1;
        return this.currentRoundId;
    }

    protected removeRound(): any {
        let currentFrameId = this.currentFrame.id,
            roundIdx = this.currentFrame.getRoundIdx(),
            round1, round2, round3, subRoundNumber;

        subRoundNumber = 1;
        if(roundIdx > 2) {
            round3 = this.rounds.pop();
            round2 = this.rounds.pop();
            subRoundNumber = subRoundNumber+ 2;
        }else if(roundIdx > 1 && roundIdx < 3) {
            round2 = this.rounds.pop();
            subRoundNumber = subRoundNumber+ 1;
        }else if(roundIdx < 2) {

        }
        round1 = this.rounds.pop();

        if(round1 && round1.getStrike()) {
          this.decrementStrike();
        }else if(round1 && round1.getSpare()) {
          this.decrementSpare();
        }
        if(round2 && round2.getStrike()) {
          this.decrementStrike();
        }else if(round2 && round2.getSpare()) {
          this.decrementSpare();
        }

        if(round3 && round3.getStrike()) {
          this.decrementStrike();
        }else if(round3 && round3.getSpare()) {
          this.decrementSpare();
        }

        this.currentRoundId = this.currentRoundId - subRoundNumber;
        this.checkRemovePreFrame();
        return this.currentRoundId;
    }

    protected getPreFrame(id: number): any {
        if(id > 0) {
            let preId = id-2;
            if(preId >= 0 && preId < 5) {
                return this.group1[preId];
            }else if(preId >= 5) {
                return this.group2[preId-5];
            }
        }
        return null;
    }

    protected getNextFrame(id: number): any {
        let nextId = id+1;
        if(nextId < 5) {
            return this.group1[nextId];
        }else {
            return this.group2[nextId-5];
        }
    }

    protected checkAddPreFrame(): any {
        if(!this.currentFrame) {
            return;
        }
        let currentFrameId = this.currentFrame.id,
            roundIdx = this.currentFrame.getRoundIdx(),
            preRoundId = this.currentRoundId-1,
            prePreRoundId = this.currentRoundId-2,
            score = this.currentFrame.getCurrentScore(),
            preRound, prePreRound, preFrame, prePreFrame;


        if(preRoundId >= 0) {
            preRound = this.rounds[preRoundId];
        }
        if(prePreRoundId >= 0) {
            prePreRound = this.rounds[prePreRoundId];
        }
        if(preRound && (preRound.getStrike() || preRound.getSpare())) {
            //preFrame = this.getPreFrame(currentFrameId);
            let frameId = preRound.getFrameId();
            preFrame = this.getFrameById(frameId);
            if(preFrame) {
                //preFrame.addTotal(score);
                //this.addScore(score);
            }
        }

        if(prePreRound && (prePreRound.getStrike())) {
            /*if(preFrame) {
                prePreFrame = this.getPreFrame(preFrame.id);
            }*/

            let frameId = prePreRound.getFrameId();
            prePreFrame = this.getFrameById(frameId);
            if(prePreFrame) {
                //prePreFrame.addTotal(score);
                //this.addScore(score);
            }

            /*if(preFrame) {
                prePreFrame = this.getPreFrame(preFrame.id);
            }
            if(currentFrameId == 10 && roundIdx >0) {
                prePreFrame = null;
            }*/
        }
        if(currentFrameId == 10 && roundIdx > 1) {
            prePreFrame = null;
        }

        if(prePreFrame && roundIdx < 2 && currentFrameId != prePreFrame.id ) {
            prePreFrame.addScore(score);
            prePreFrame.addTotal(score);
            this.addScore(score);
        }

        if(preFrame && roundIdx < 2 && currentFrameId != preFrame.id) {
            preFrame.addScore(score);
            preFrame.addTotal(score);
            this.addScore(score);
        }

        this.updatePreScore();
    }

    public updatePreScore() {
        let score = this.currentFrame.getCurrentScore(),
            preFrame, prePreFrame;

        //get pre
        let currentFrameId = this.currentFrame.id,
            roundIdx = this.currentFrame.getRoundIdx();

        preFrame = this.getPreFrame(currentFrameId);
        if(preFrame && roundIdx < 2) {
            if(currentFrameId ) {
                prePreFrame = this.getPreFrame(preFrame.id);
            }
            if(prePreFrame && roundIdx < 1) {
                preFrame.setTotal(prePreFrame.getTotal()+preFrame.getSum());
            }
            this.currentFrame.setTotal(preFrame.getTotal() + this.currentFrame.getSum());
        }
    }

    public incrementSpare() {
        if(!this.total_spare) {
            this.total_spare = 0;
        }
        this.total_spare = this.total_spare + 1;
    }

    public incrementStrike() {
        if(!this.total_strike) {
            this.total_strike = 0;
        }
        this.total_strike = this.total_strike + 1;
    }

    public decrementSpare() {
        this.total_spare = this.total_spare - 1;
    }

    public decrementStrike() {
        this.total_strike = this.total_strike - 1;
    }

    public addScore(score): number {
        if(!this.score) {
            this.score = 0;
        }
        this.score = parseInt(this.score + score, 10);
        return this.score;
    }

    public subScore(score:number): number {
        if(!this.score) {
            this.score = 0;
        }
        this.score = this.score - score;
        return this.score;
    }

    public getScore(): number {
        return this.score;
    }

    protected checkRemovePreFrame(round1?: Round, round2?: Round, round3?: Round): any {
        if(!this.currentFrame) {
            return;
        }

        let score = 0,score2 = 0,
            sum = this.currentFrame.getSum(),
            currentFrameId = this.currentFrame.id,
            roundIdx = this.currentFrame.getRoundIdx(),
            preRoundId = this.currentRoundId-1,
            prePreRoundId = this.currentRoundId-2,
            preRound, prePreRound, preFrame, prePreFrame;

        if(currentFrameId < 10) {
            score = this.currentFrame.getSum();
        }else {
            score = this.currentFrame.getScore(0);
            score2 = this.currentFrame.getScore(1);
        }
        if(preRoundId >= 0) {
            preRound = this.rounds[preRoundId];
        }
        if(prePreRoundId >= 0) {
            prePreRound = this.rounds[prePreRoundId];
          }
          
        if(preRound && (preRound.getStrike() || preRound.getSpare())) {
            let frameId = preRound.getFrameId();
            preFrame = this.getFrameById(frameId);
        }

        if(prePreRound && (prePreRound.getStrike())) {
            let frameId = prePreRound.getFrameId();
            prePreFrame = this.getFrameById(frameId);
        }

        if(prePreFrame && currentFrameId != prePreFrame.id ) {
            prePreFrame.subScore(score);
            prePreFrame.subTotal(score);
            this.subScore(score);
            if(preFrame) { 
              preFrame.subTotal(score);
            }
        }

        if(preFrame && currentFrameId != preFrame.id) {
            preFrame.subScore(score);
            preFrame.subTotal(score);
            this.subScore(score);
            if(score2 && (preRound.getStrike())) {
                preFrame.subScore(score2);
                preFrame.subTotal(score2);
                this.subScore(score2);
            }
        }
        //console.log(score, this.currentRoundId, preFrame, prePreFrame);
        this.subScore(sum);
    }

    public setNextFrame(): void {

        if(!this.currentFrame) {
            return;
        }
        let frameId = this.currentFrame.id;
        this.currentFrame.setFinished(true);

        if(frameId == 10) {
            let roundIdx = this.currentFrame.getRoundIdx();
            let score1 = this.currentFrame.getScore(0),
                score2 = this.currentFrame.getScore(1);

            if(roundIdx > 2 || (score1 + score2) < 10 ) {
                //this.currentFrame = null;
                this.finishGame();
                this.currentFrame.setFinished(true);
            }else {
                this.currentFrame = this.group2[frameId-6];
            }
        }else if(frameId < 5) {
            this.currentFrame = this.group1[frameId];
        }else if((frameId >= 5 && frameId <= 10)) {
            this.currentFrame = this.group2[frameId-5];
        }
    }

    public setPreFrame(): void {

        if(!this.currentFrame) {
            return;
        }
        let frameId = this.currentFrame.id;
        if(frameId < 2) {
          return;
        }
        frameId = frameId -1;
        if(frameId <= 5) {
            this.currentFrame = this.group1[frameId-1];
        }else if((frameId > 5 && frameId <= 10)) {
            this.currentFrame = this.group2[frameId-6];
        }
    }
    
    public getFrameById(frameId): Frame {
        if(frameId <= 5) {
            return this.group1[frameId-1];
        }else if((frameId > 5 && frameId <= 10)) {
            return this.group2[frameId-6];
        }
    }

    public isLastFrame(frame: Frame): boolean {

        return frame.id == 10;
    }
    public isFinishGame(): boolean {
        return this.endTime !== null;
    }

    public cancelFinishGame(): void {
        //subcription
        this._stateSubject.next({'finish': false});
        this.endTime = null;
    }

    public finishGame(): void {
        this.endTime = new Date().getTime()//App.getMoment(new Date());
        this.totalTime = this.totalTime + (this.endTime - this.startTimeTmp);
        //subcription
        this._stateSubject.next({'finish': true});
    }

    public storageGame(): void {
        let playTime = new Date().getTime() - this.startTimeTmp;
        //console.log('playTime: '+ playTime, playTime/1000);
        let gameData = {
          club: this.club,
          currentFrameId: this.currentFrame.id-1,
          currentRoundId: this.currentRoundId,
          rounds: this.rounds,
          group1: this.group1,
          group2: this.group2,
          score: this.score,
          startTime: this.startTime,
          endTime: this.endTime,
          total_spare: this.total_spare,
          total_strike: this.total_strike,
          totalTime: (this.totalTime + playTime)
        }
        App.setStorage('game.data', gameData);
    }
    
    public resumeGame(): void {
      let self = this;
      let gameData = App.getStorage('game.data');
      this.startTimeTmp = new Date().getTime();
      this.startTime = gameData.startTime;
      this.endTime = gameData.endTime;

      this.setClub(gameData.club);
      _.each(gameData.rounds, function(item){
        let round = new Round(item.score, item.isStrike, item.isSpare);
        round.setFrameId(item.frameId);
        self.rounds.push(round);
      });

      _.each(gameData.group1, function(frame, idx){
        if(frame.total) {
          let tmpFrame = self.group1[frame.id-1];
          tmpFrame.scores = frame.scores;
          tmpFrame.setTotal(frame.total);
          tmpFrame.setStrike(frame.strike);
          tmpFrame.setSpare(frame.spare);
          tmpFrame.setFinished(frame.finised);
          tmpFrame.currentRound = frame.currentRound;
          tmpFrame.sum = frame.sum;
        }
        if(gameData.currentFrameId === (idx+1)) {
          self.setCurrentFrame(gameData.currentFrameId);
        }
      });

      _.each(gameData.group2, function(frame, idx){
        if(frame.total) {
          let tmpFrame = self.group2[frame.id-6];
          tmpFrame.scores = frame.scores;
          tmpFrame.setTotal(frame.total);
          tmpFrame.setStrike(frame.strike);
          tmpFrame.setSpare(frame.spare);
          tmpFrame.setFinished(frame.finised);
          tmpFrame.currentRound = frame.currentRound;
          tmpFrame.sum = frame.sum;
        }
        if(gameData.currentFrameId === (idx+5)) {
          self.setCurrentFrame(gameData.currentFrameId);
        }
      });

      this.currentRoundId = gameData.currentRoundId;
      this.score = gameData.score;
      this.total_spare = gameData.total_spare;
      this.total_strike = gameData.total_strike;
      this.totalTime = gameData.totalTime;
    }
      
    public isFinish(): boolean {
        return this.endTime ? true: false;
    }

    public setClub(club: Object): void {
      this.club = club;
    }

    public getClubId(): string {
        if(this.club && this.club['id']) {
            return this.club['id'];
        }
        return '';
    }

    public getClubName(): string {
        if(this.club && this.club['name']) {
            return this.club['name'];
        }
        return '';
    }

    public canStrike(roundIdx: number): boolean {
        let frameId = this.currentFrame.id;

        if(roundIdx < 1) {
            return true;
        }else {
            if(frameId < 10) {
                return false;
            }
            let preScore = this.currentFrame.getScore(roundIdx-1);
            if(preScore == 10) {
                return true;
            }else if(roundIdx == 2) {
                let score0 = this.currentFrame.getScore(0);
                if(score0 != 10 && preScore != 10) {
                    return true;
                }
            }
        }
        return false;
    }

    public init(): void {
        this.startTimeTmp = this.startTime = new Date().getTime() //App.getMoment(new Date());
        this.endTime = null;

        this.currentRoundId = 0;
        this.score = 0;
        this.total_strike = 0;
        this.total_spare = 0;
        this.rounds = [];
        this.group1 = [
            new Frame(1, [], false, false),
            new Frame(2, [], false, false),
            new Frame(3, [], false, false),
            new Frame(4, [], false, false),
            new Frame(5, [], false, false)
        ];
        this.group2 = [
            new Frame(6, [], false, false),
            new Frame(7, [], false, false),
            new Frame(8, [], false, false),
            new Frame(9, [], false, false),
            new Frame(10, [], false, false)
        ];
        this.currentFrame = this.group1[0];
    }
}