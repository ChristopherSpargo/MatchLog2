import { Component } from '@angular/core';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';

// Help component for ABOUT MATCHLOG

@Component({
  selector: '<app-about-matchlog>',
  templateUrl : 'about.matchlog.component.html'
})
export class AboutMatchLogComponent  {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  constructor() {};

}
