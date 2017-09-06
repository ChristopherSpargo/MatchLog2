import { Component, Input } from '@angular/core';

    // COMPONENT to insert icons into help text
    // Example: 
    // <app-about-text-icon fIcon="personOutline" fColor="app-primary"></app-about-text-icon>

@Component({
  selector: '<app-about-text-icon>',
  templateUrl : 'about.text.icon.component.html'
})
export class AboutTextIconComponent  {

  @Input() fIcon        : string;   // name of icon to display
  @Input() fColor       : string  = "app-about-icon-color";   // CSS class for the icon color
  @Input() fFab         : boolean = false;                  // 'true' if display icon on a button
  @Input() fFabColor    : string  = "app-bg-gwhite";    // CSS class for button color


  constructor() {
  };

}
