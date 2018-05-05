export class Frame {
    public sum: number = 0;
    public total: number = 0;
    public currentRound: number;
    public finised: boolean;

    constructor(
        public id: number,
        public scores: any[],
        public strike: boolean,
        public spare: boolean
    ) {
        this.currentRound = 0;
        this.finised = false;
        //this.sum = this.score[0] + this.score[1] + this.score[2];
    }

    public setScore(score): void {
        this.scores[this.currentRound] = parseInt(score, 10);
        this.addScore(score);
        this.addTotal(score);
    }

    public setStrike(strike): void {
        //this.currentRound = 0;
        this.strike = strike;
    }

    public setSpare(spare): void {
        //this.currentRound = 1;
        this.spare = spare;
    }

    public setRound(roundIdx): void {
        this.currentRound = roundIdx;
    }
    public setNextRound(): any {
        this.currentRound += 1;
        return this;
    }

    public setPreRound(): any {
        this.currentRound -= 1;
        if(!this.currentRound) this.currentRound = 0;
        return this;
    }
      
    public getRoundIdx(): number {
        return this.currentRound;
    }

    public getRemainScore(roundIdx:number = 0): number {

        let score = this.getScore(roundIdx);
        return (10 - score);
    }

    public getCurrentScore(): number {

        return this.scores[this.currentRound] ? this.scores[this.currentRound] : 0;
    }

    public getScore(idx): number {
        return (this.scores[idx] !== undefined) ? this.scores[idx] : 0;
    }

    public getDisplayScore(idx): any {
        let score = (this.scores[idx] !== undefined) ? this.scores[idx] : '';
        if(score === 0 && idx === 0) {
            score = 'G';
        }else if(score === 0 && idx > 0) {
            score = '-';
        }
        return score;
    }

    public getDisplayTotal(): any {
        if(this.total > 0 || this.finised) {
            return this.total;
        }
        return '';
    }

    public getStrike(): boolean {
        return this.strike;
    }

    public getSpare(): boolean {
        return this.spare;
    }

    public addScore(score: any): number {
        if(!this.sum) {
            this.sum = 0;
        }
        this.sum = parseInt(this.sum + score, 10);
        //this.sum = score;
        return this.sum;
    }
    public addTotal(score: any): void {
        if(!this.total) {
            this.total = 0;
        }
        this.total = parseInt(this.total + score, 10);
    }

    public setTotal(score: any): void {
        if(!this.total) {
            this.total = 0;
        }
        this.total = parseInt(score, 10);
    }

    public getTotal(): number {
        return this.total;
    }
    public subTotal(score): any {
        if(!this.total) {
            this.total = 0;
        }
        this.total = (this.total - score);
    }

    public getSum(): number {
        return this.sum;
    }
    public subScore(score): any {
        if(!this.sum) {
            this.sum = 0;
        }
        this.sum = (this.sum - score);
    }

    public setFinished(flag: boolean): any {
        this.finised = flag;
    }

    public clear(): void {
        this.currentRound = 0;
        this.sum = 0;
        this.total = 0;
        this.scores = [];
        this.strike = false;
        this.spare = false;
        this.finised = false;
    }

    public popRound(): void {
      let numRound = this.scores.length,
        score = this.scores.pop();

        this.currentRound = this.currentRound;
        this.sum = this.scores[0];
        this.total = this.total - score;
        this.strike = false;
        this.spare = false;
        this.finised = false;
    }
      
    public isSpare(roundIdx: number =0): boolean {
        if(this.id < 10) {
            return this.getSpare();
        }else {
            let score1 = this.getScore(0),
                score2 = this.getScore(1),
                score3 = this.getScore(2);

            if(roundIdx === 1 && (score2 !== 10 && score1 !== 10 && (score1+score2 === 10))) {
                return true;
            }else if(roundIdx === 2 && (score3 !== 10 && score2 !== 10 && (score1+score2 !== 10)&& (score2+score3 === 10))) {
                return true;
            }
            return false;
        }
    }

    public isStrike(roundIdx: number =0): boolean {
        if(this.id < 10) {
            return this.getStrike();
        }else {
            if(this.getScore(roundIdx) == 10) {
                return true;
            }
            return false;
        }
    }
}

export class Round {
    protected frameId: number;
    constructor(
        public score: number,
        public isStrike: boolean,
        public isSpare: boolean
    ) {
    }

    public setScore(score): void {
        this.score = parseInt(score, 10);
    }

    public setStrike(isStrike): void {
        this.isStrike = isStrike;
    }

    public setSpare(isSpare): void {
        this.isSpare = isSpare;
    }

    public setFrameId(id): void {
        this.frameId = id;
    }

    public getStrike(): boolean {
        return this.isStrike;
    }

    public getSpare(): boolean {
        return this.isSpare;
    }

    public getScore(): number {
        return this.score;
    }

    public getFrameId(): number {
        return this.frameId;
    }

    public clear(): void {
        this.score = 0;
        this.isStrike = false;
        this.isSpare = false;
    }
}