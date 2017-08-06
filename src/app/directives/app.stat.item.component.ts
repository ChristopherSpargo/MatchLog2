import { Component, Input } from '@angular/core';

    // COMPONENT to insert items into the stats display
    // Examples: 
    //    <app-stat-item 
    //      fLabel="1st Serves In" [fValue]="stats.fsPct" fPct="%" 
    //      [fShowPlayer]="playerServed"
    //      [fShowOpponent]="opponentServed"></app-stat-item> 
    //    <app-stat-item 
    //      fLabel="Break Points Won" [fValue]="stats.bpWon" [fRatio]="true" 
    //      [fShowPlayer]="opponentServed" [fSubitem]="true"
    //      [fShowOpponent]="playerServed"></app-stat-item> 

@Component({
  selector: '<app-stat-item>',
  templateUrl : 'app.stat.item.component.html'
})
export class AppStatItemComponent  {

  @Input() fLabel        : string;    // label for the stat
  @Input() fValue        : number[] | number[][];  // array of 2 values or array of 2 arrays
  @Input() fPct          : string = "";    // symbol to show by value when not a ratio
  @Input() fRatio        : boolean = false;   // true if values should be displayed as a ratio
  @Input() fShowPlayer   : boolean;   // true if player value is relevant
  @Input() fSubitem      : boolean = false;   // true if subitem formatting should be applied
  @Input() fShowOpponent : boolean;   // true if opponent value if relevant

  constructor() {
  };
}
