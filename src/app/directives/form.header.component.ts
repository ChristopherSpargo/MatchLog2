import { Component, Input } from '@angular/core';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';

@Component({
  selector: '<app-form-header>',
  templateUrl : 'form.header.component.html'
})
export class FormHeaderComponent {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  constructor() { }

  @Input() headerTitle        : string;   // title string for header
  @Input() headerTheme        : string;   // CSS style for header
  @Input() closeButtonTheme   : string;   // CSS style for close button
  @Input() appBarItems        : any[];    // array of menu button objects for title bar
  @Input() headerType         : string;   // type of form (center or right)
  @Input() headerClose        : Function; // link to closeForm function of form's controller


}
