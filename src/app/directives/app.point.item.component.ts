import { Component, Input } from '@angular/core';

    // COMPONENT to insert items into the point data display
    // Example: 
    // <app-point-item fLabel="Shots" [fValue]="pointInfo.shots"></app-point-item> 

@Component({
  selector: '<app-point-item>',
  templateUrl : 'app.point.item.component.html'
})
export class AppPointItemComponent  {

  @Input() fLabel        : string;    // label for the item
  @Input() fValue        : number | string;  // value to display
  @Input() fWing         : string;    // final shot was forehand/backhand
  @Input() fTargetWing   : string;   // final shot directed to opponents fh/bh
  @Input() fAtNet        : string;   // final shot was at net
  @Input() fColor        : string = "";   // CSS class to apply to the item display

  constructor() {
  };
}
