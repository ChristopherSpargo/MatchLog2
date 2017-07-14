import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-update-actions>',
  templateUrl : 'update.actions.component.html'
})
export class UpdateActionsComponent  {

  @Input() fDeleteCheck : boolean;  // indicates delete button should be shown
  @Input() fAddCheck    : boolean;  // indicates add button should be shown

  constructor() {
  };
  
}
