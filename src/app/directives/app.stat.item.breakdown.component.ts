import { Component, Input, Output, EventEmitter } from '@angular/core';

    // COMPONENT to insert items into the stats display that are
    //  a breakdown of another item
    // Examples: 
    //    <app-stat-item-breakdown 
    //      flabel="1st Serves In" [fValue]="stats.fsPct" fpct="%" 
    //      [fshowPlayer]="playerServed" [fbreakdownOpen]="winnerBreakdownOpen"
    //      [fshowOpponent]="opponentServed"></app-stat-item> 
@Component({
  selector: '<app-stat-item-breakdown>',
  templateUrl : 'app.stat.item.breakdown.component.html'
})
export class AppStatItemBreakdownComponent  {

  @Input() fLabel          : string;  // label to display with this stat
  @Input() fValue          : number[] | number [][]; // array of 2 numbers array of 2 arrays of 2 numbers
  @Input() fPct            : string = "";  // symbol to display after value if not a ratio
  @Input() fRatio          : boolean = false; // true if display value as a ratio
  @Input() fShowPlayer     : boolean; // true if player value is relevant
  @Input() fShowOpponent   : boolean; // true if opponent value is relevant
  @Input() fBreakdownOpen  : boolean; // true if this component is open

  @Output() fBreakdownOpenChange = new EventEmitter<boolean>();

    constructor() {};

  toggleBreakdownOpen = () => {
    this.fBreakdownOpen = !this.fBreakdownOpen;
    this.fBreakdownOpenChange.emit(this.fBreakdownOpen);
  }

}