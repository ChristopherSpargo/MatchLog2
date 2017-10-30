import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-footer-button>',
  templateUrl : 'form.footer.button.component.html'
})
export class FormFooterButtonComponent  {

  @Input() fLabel       : string = "Exit";  // label for the button
  @Input() fOnClick     : Function;  // function to call when clicked

  constructor() {
  };

}
