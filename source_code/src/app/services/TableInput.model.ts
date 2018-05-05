export class TableInput {
    public table: any[];

    constructor(
    ) {
        this.init();
    }

    public init(): void {
        this.table = [
            new InputItem('ESC'),
            new InputItem(''), // LuanDT Remove CLR button
            new InputItem('', false, false),
            new InputItem('1'),
            new InputItem('2'),
            new InputItem('3'),
            new InputItem('4'),
            new InputItem('5'),
            new InputItem('6'),
            new InputItem('7'),
            new InputItem('8'),
            new InputItem('9'),
            new InputItem('STRIKE', true, false),
            new InputItem('G', false, false),
            new InputItem('', false, false)
        ];
        // Disable clear button
        this.table[0].disable();
        this.table[1].disable();
        this.table[2].disable();
        this.table[14].disable();
    }

    public getTable(): any {
        return this.table;
    }

    public disableAll(): any {
        for(let i=0;i<this.table.length; i++) {
            let input = this.table[i].getValue();
            if(input === 'ESC') {
              this.table[i].disable();
            }else if(input === 'CLR') {
              this.table[i].enable();
            }else {
                this.table[i].disable();
            }
        }
        return this.table;
    }

    public changeStatus(remainScore, roundIdx, frameIdx?: number, canStrike?: boolean): any {
        for(let i=0;i<this.table.length; i++) {
            let input = this.table[i].getValue();
            if(input === 'CLR') {
            }else if(input === 'STRIKE') {
                this.table[i].enable();
                if(canStrike == true) {
                    this.table[i].setStrike(true);
                    this.table[i].setSpare(false);
                }else {
                    this.table[i].setStrike(false);
                    this.table[i].setSpare(true);
                }
            }else if(input === 'ESC') {
                //this.table[i].disable();
                this.table[i].enable();
                if(roundIdx == 0 && frameIdx == 1) {
                    this.table[i].disable();
                }
            }else if(input === 'G' || input === '-') {
                this.table[i].enable();
                if(roundIdx > 0) {
                    this.table[i].setValue('-');
                }else {
                    this.table[i].setValue('G');
                }
            }else {
                if(canStrike == true) {
                    this.table[i].enable();
                }else {
                    let value = parseInt(input, 10);
                    this.table[i].disable();
                    if(remainScore >0 && value <= remainScore) {
                        this.table[i].enable();
                    }
                }
            }
        }
        this.table[1].disable();
        this.table[2].disable();
        this.table[14].disable();
        return this.table;
    }
}

export class InputItem {
    protected status: boolean;

    constructor(
        protected value: string,
        protected strike: boolean = false,
        protected spare: boolean = false
    ) {
        this.enable();
    }
    public disable(): void {
        this.status = false;
    }

    public enable(): void {
        this.status = true;
    }

    public isEnable(): boolean {
        return this.status === true;
    }

    public setStrike(isStrike): void {
        this.strike = isStrike;
    }

    public setSpare(isSpare): void {
        this.spare = isSpare;
    }

    public isStrike(): boolean {
        return this.strike === true;
    }

    public isSpare(): boolean{
        return this.spare === true;
    }

    public getValue(): string {
        return this.value;
    }

    public setValue(val: any) {
        this.value = val;
    }
}