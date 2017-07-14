import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-form-messages>',
  templateUrl : 'form.messages.component.html'
})
export class FormMessagesComponent  {

  @Input() fHaveMessage       : boolean;    // indicates if messages are available
  @Input() fWorkingOpen       : boolean;    // expression that is true if "Working" status to be shown
  @Input() fMessageOpen       : boolean;    // expression that is true if "Message" display open
  @Input() fMessageObj        : { [key: string]: any };        // object containing message keys

  constructor() {
  };

}
