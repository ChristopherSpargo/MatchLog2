import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { DataSvc } from '../model/dataSvc';
import { Match } from '../model/match'

@Component({
  selector: '<app-logs-view-menu>',
  templateUrl: 'logs.view.menu.component.html'
})
export class LogsViewMenuComponent implements OnInit, OnDestroy {

  @Input() matchMenuOpen    : boolean;    // indicates this panel should open
  @Input() playerName       : Function;   // function to return player name from player id
  @Input() constructMatchesMessage  : Function;  // function to format matchesMessage

  selectAll                 : boolean = false; // toggle for selecting/unselecting all matches
  multiMode                 : string = "Combine";     // mode for handling multiple selections (Combine or Trends)
  menuMatchList             : Match[] = [];    // working list of matches 
  matchSelectFlags          : boolean [] = []; // selection status for each match in matchList

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private currentMatch: CurrentMatch){};

  ngOnInit() {
    document.addEventListener("matchesFound", this.setMenuLists);
    document.addEventListener("reverseMatchMenu", this.toggleSortOrder);
    this.setMenuLists();
  }
  ngOnDestroy() {
    document.removeEventListener("matchesFound", this.setMenuLists);
    document.removeEventListener("reverseMatchMenu", this.toggleSortOrder);
  }

  public setMenuLists = (e? : any) => {
    this.menuMatchList = this.currentMatch.matchList;
    this.matchSelectFlags = this.currentMatch.matchSelectFlags;
  }
  
  // delete the selected match
  public deleteMatchMenuItem(index : number) : void {
    var m : Match = this.menuMatchList[index];
    var msg = 'Delete ' + this.playerName(m.playerId) + ' .vs. ' + this.playerName(m.opponentId)+
            ' on '+ m.date + ' ?';
    this.utilSvc.getConfirmation('Delete Match', msg, 'Delete')
    .then((deleteIt) => {
      this.dataSvc.deleteMatch(m.sortDate)
      .then((success) => {
        this.menuMatchList.splice(index, 1);    //remove item from menuMatchList array
        this.currentMatch.matchList.splice(index, 1);    //remove item from original matchList array
        this.matchSelectFlags.splice(index, 1);
        this.constructMatchesMessage(this.menuMatchList.length);
      })
      .catch((failure) => {
        this.utilSvc.displayThisUserMessage("errorDeletingMatch");
      });
    })
    .catch((dontDelete) => {}
    );
  }

  // return if the match menu has more than one choice
  public multipleChoices() : boolean {
    return (this.currentMatch.matchList && this.currentMatch.matchList.length > 1);
  }

  // reverse the selected status of all menu items
  public toggleSelectAll = () => {
    this.matchSelectFlags.fill(!this.selectAll);
  }

  // reverse the sort order of the match list array
  public toggleSortOrder = () => {
    this.currentMatch.matchList.reverse();
    this.matchSelectFlags.reverse();
  }

  // note that a match has been selected/deselected in the match list 
  public toggleMatchSelect = (index : number) => {
    this.matchSelectFlags[index] = !this.matchSelectFlags[index];
  }

  // save the objects that have been selected from the match list 
  public setSelectedMatches = () => {
    this.currentMatch.match = undefined;
    this.currentMatch.selectedMatches = [];
    this.matchSelectFlags.forEach((item, index) => {
      if(item){  //save all selected matches in an array
        this.currentMatch.selectedMatches.push(this.menuMatchList[index]);
      }
    });
    if(this.currentMatch.selectedMatches.length){
      setTimeout( () => {
        this.utilSvc.scrollToTop();
        this.currentMatch.match = this.currentMatch.selectedMatches[0];
        if(this.currentMatch.selectedMatches.length == 1){
          this.currentMatch.mode = "Review";
          this.currentMatch.match.removeLooseEnds();
        }
        else {
          this.currentMatch.mode = this.multiMode;              
        }
        setTimeout( () => {
          this.utilSvc.emitEvent('selectViewTab');
          this.utilSvc.emitEvent('setSelectedMatch');
        }, 100);
      }, 400)
    }
  }

  // return the number of currenetly selected matches
  public selectedMatchCount = () => {
    var count = 0;
    if(this.matchSelectFlags){
      this.matchSelectFlags.forEach( (item) =>{ count += item ? 1 : 0;} );
    }
    return count;
  }

  // return if multiple selections have been made
  multipleSelections() : boolean {
    return this.selectedMatchCount() > 1;
  }

  // return if match is selected or not
  public matchSelected(index : number) : boolean {
    return this.matchSelectFlags[index];
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    this.utilSvc.emitEvent("nextTab");
  }

  // move to the next tab in the tab set
  public prevTab = () => {
    this.utilSvc.emitEvent("prevTab");
  }

}