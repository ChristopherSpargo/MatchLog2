import { Component, Input } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: '<app-fab>',
  templateUrl : 'app.fab.component.html'
})
export class AppFabComponent  {
  clicked : boolean = false;

  @Input() fType        : string = "submit";      // Type for button
  @Input() fButtonCSS   : string = ""             // css classes to assign to the button
  @Input() fOpen        : boolean = false         // true if assign app-open class to button
  @Input() fAria        : string;                 // aria label text
  @Input() fIcon        : string = "check_circle" // Icon to put on the button
  @Input() fIconColor   : string = "app-primary"  // color for Icon 
  @Input() fIconCSS     : string = "app-action-icon" // css classes to assign to the icon
  @Input() fOnClick     : Function;               // Function to call on click
  @Input() fParam       : any = null;             // param to pass to OnClick function
  @Input() fDisabled    : boolean = false;        // true if button is disabled

  constructor() {
  };

  fabClicked = ()=> {
    this.clicked = true;
    setTimeout( () => {
      this.clicked = false;
    }, 1000);
    if(this.fOnClick) { this.fOnClick(this.fParam);}
  }
}
