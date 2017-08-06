import { Component, Input, Output, EventEmitter } from '@angular/core';

    // COMPONENT to provide category containers to the stats display
    // Example: 
    // <app-stat-category asc-label="Serving" asc-open-flag="dC.serveStatsOpen">

@Component({
  selector: '<app-stat-category>',
  templateUrl : 'app.stat.category.component.html'
})
export class AppStatCategoryComponent  {

  @Input() fLabel       : string;    // label for the container activation button
  @Input() fOpenFlag    : boolean;   // true if container is open
  @Input() fTextFlag    : boolean;   // 'true' if text area is open
  @Input() fTextOnly    : boolean;   // true if graph area not shown

  @Output() fOpenFlagChange = new EventEmitter<boolean>();
  @Output() fTextFlagChange = new EventEmitter<boolean>();


  constructor() {
  };

  toggleOpenFlag = () => {
    this.fOpenFlag = !this.fOpenFlag;
    this.fOpenFlagChange.emit(this.fOpenFlag);
  }

  toggleTextFlag = () => {
    this.fTextFlag = !this.fTextFlag;
    this.fTextFlagChange.emit(this.fTextFlag);
  }
}
