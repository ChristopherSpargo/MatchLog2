import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { DataSvc, TOURNAMENT_TABLE_NAME } from '../model/dataSvc';
import { GraphsSvc } from '../model/graphsSvc';
import { MENU_TAB, MENU_TAB_ID } from './logs.view.component'
import { Match } from '../model/match'

interface FilterData {
  playerId    : string | number, 
  wonLost     : string,
  tournament  : string,
  opponentId  : string | number,
  handed      : string,
  startDate   : string,
  endDate     : string,
  sortOrder   : string
}

@Component({
  selector: '<app-logs-view-search>',
  templateUrl: 'logs.view.search.component.html'
})
export class LogsViewSearchComponent implements OnInit {
@Input() searchFormOpen   : boolean;

  matchList     : Match[];
    playerId    : number | string = '0'; 
    opponentId  : number | string = '0';
    startDate   : string = "";
    endDate     : string = "";
    wonLost     : string = "";
    tournament  : string = "0";
    handed      : string = "";
    sortOrder   : string = "D";
  playerSelectList      : any[];
  opponentSelectList    : any[];
  requestStatus    : { [key: string]: any } = {};
  sDate            : string = "";
  eDate            : string = "";
  matchViewOpen    : boolean = false;
  tournamentList   : string[] = [];
  working          : boolean = false;

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private graphsSvc : GraphsSvc, private currentMatch: CurrentMatch){};

  ngOnInit() {
    this.dataSvc.getList(TOURNAMENT_TABLE_NAME) //read current list of tournaments
    .then((tList) => {
      this.tournamentList = <string[]>tList;
      this.playerId = this.userInfo.profile.defaultPlayerId || 0;
      // now wait a bit for the player list to be 
      setTimeout( () => {
        this.filterPlayerLists();
      },100);
    })
    .catch((error) => {
      this.utilSvc.returnToHomeMsg("noTournamentsFound", 400);
    });
  }

  public submitFilter(form : NgForm) : void {
    var request : FilterData = <FilterData>{};
    this.clearRequestStatus();
    if(this.sDate){
      request.startDate = this.utilSvc.formatSortDate((new Date(this.sDate)));
    }
    if(this.eDate){
      request.endDate = this.utilSvc.formatSortDate((new Date(this.eDate)));
    }
    request.playerId = parseInt(<string>this.playerId,10);
    request.opponentId = parseInt(<string>this.opponentId,10);
    if(form && this.checkForProblems(form, request.playerId, request.opponentId, 
                                request.startDate, request.endDate)) {
      this.startDate = this.endDate = "";
      return;
    }
    this.working = true;
    request.wonLost     = this.wonLost;
    request.tournament  = this.tournament !== "0" ? this.tournament : "";
    request.handed      = this.handed;
    request.sortOrder   = this.sortOrder;
    this.currentMatch.matchList = undefined;
    this.currentMatch.matchSelectFlags = [];

    this.utilSvc.emitEvent("searchUpdate");
    this.matchViewOpen = false;
    this.utilSvc.scrollToTop();
    this.dataSvc.getMatches(request)
    .then((list) => {
      this.working = false;
      this.currentMatch.matchList = <Match[]>list;
      this.startDate = this.endDate = "";
      this.utilSvc.emitEvent("searchUpdate");
      if(!this.currentMatch.matchList.length){
        this.utilSvc.displayThisUserMessage("noMatchesFound"); //let user know they need to try again
      }
    })
    .catch((error) => {
      this.working = false;
      this.currentMatch.matchList = [];
      this.utilSvc.emitEvent("searchUpdate");
      this.utilSvc.displayThisUserMessage("errorReadingMatchesTable"); //let user know they need to try again
    });
    this.utilSvc.scrollToTop();
  }

  // clear status messages object
  public clearRequestStatus = () => {
    this.requestStatus = {}; 
  }

  //add an item to the status messages object
  private setStatusMessage(item : string) : void {
    this.requestStatus[item] = true; 
  }

  //indicate whether there are any status messages
  public haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  filterPlayerLists = () => {
    this.playerSelectList = this.currentMatch.playerList.filter(this.playerFilter).sort(this.playerSort)
    this.opponentSelectList = this.currentMatch.playerList.filter(this.opponentFilter).
                                filter(this.handedFilter).sort(this.playerSort)
  }

  //use this filter to create a menu of players that doesn't include the PLAYER
  public opponentFilter = (value) => {
    return (value.id != this.playerId);
  }

  //use this filter to create a menu of players that doesn't include the OPPONENT
  public playerFilter = (value) => {
    return (value.id != this.opponentId);
  }

  //use this filter to create a menu of players that play with filter.handed HAND
  public handedFilter = (value) => {
    return (this.handed == "" || value.handed == this.handed);
  }

  //use this as the playerList sort compare function to sort ascending by last name
  private playerSort = (a,b) : number => {return a.lastName < b.lastName ? -1 : 1;}

  // check the filter form responses for problems
  private checkForProblems(form : NgForm, player : number, opponent : number, 
                            startDate : string, endDate : string) : boolean {
    if(form){
      if(form.invalid){
        this.setStatusMessage("formHasErrors");
      }
      if((endDate && startDate) && ( endDate < startDate)){
        this.setStatusMessage("dateConflict");
      }
      return this.haveStatusMessages();
    }
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