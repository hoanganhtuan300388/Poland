import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from '../services/validate.service';

@Component({
    selector: 'control-messages',
    template: `<span class="help-block"><div *ngIf="errorMessage !== null" class="error-message">{{errorMessage}}</div></span>`
})
export class ControlMessagesComponent {
    @Input() control: FormControl;

    get errorMessage() {
        for (let propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
                return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
            }
        }
        return null;
    }
}