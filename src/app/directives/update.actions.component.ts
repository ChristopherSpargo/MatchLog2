import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-update-actions>',
  templateUrl : 'update.actions.component.html'
})
export class UpdateActionsComponent  {

  @Input() fDeleteCheck : boolean = false;  // true if delete button should be shown
  @Input() fAddCheck    : boolean = false;  // true if add button should be shown
  @Input() fDisabled    : boolean = false;  // true if button disabled

  constructor() {
  };
  
}
