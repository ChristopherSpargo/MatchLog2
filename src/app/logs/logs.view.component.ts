import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StateService } from "@uirouter/angular";
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { DataSvc } from '../model/dataSvc';
import { GraphsSvc } from '../model/graphsSvc';
import { Player, PlayerData } from '../model/player';
import { Match } from '../model/match';
import { PUBLIC_USER_ID } from '../constants'

export const MENU_TAB       : number = 0;
export const MENU_TAB_ID    : string = "menuTab";
export const VIEW_TAB       : number = 1;
export const VIEW_TAB_ID    : string = "viewTab";
export const SEARCH_TAB     : number = 2;
export const SEARCH_TAB_ID  : string = "searchTab";
 
// COMPONENT for VIEW MATCH LOGS feature

@Component({
  templateUrl: 'logs.view.component.html'
})
export class LogsViewComponent implements OnInit, OnDestroy {

  @ViewChild(NgbTabset) tabSet : NgbTabset;

  selectedMatches  : boolean[] = [];

  viewOpen         : boolean = false;
  viewWasOpen      : boolean = false;
  searchFormOpen   : boolean = false;
  matchMenuOpen    : boolean = false;
  matchViewOpen    : boolean = false;
  logsReady        : boolean = false;
  working          : boolean = false;
  managePublics    : boolean = false;
  viewPublics      : boolean = false;
  matchesMessage   : string = "";
  playerList       : any[] = [];
  tournamentList   : string[] = [];
  headerTitle      : string;
  currTabId        : string = "";
  eventInfoOpen    : boolean = false;
  tabNames         : string[] = [MENU_TAB_ID, VIEW_TAB_ID, SEARCH_TAB_ID];
 

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private graphsSvc : GraphsSvc, private currentMatch: CurrentMatch,
              private stateService: StateService){};

  ngOnInit() {
    // make the user sign in to view match logs
    if (!this.userInfo.authData) {
      this.utilSvc.returnToHomeMsg("signInToReview");
    }
    else {
        // initialize mode flags and the currentMatch object
      this.managePublics              = this.stateService.current.name == 'managePublicLogs';
      if(this.managePublics && (this.userInfo.authData.uid === PUBLIC_USER_ID)){
        this.utilSvc.returnToHomeMsg("featureNotAvailable");
      }
      this.viewPublics                = this.stateService.current.name == 'viewPublicLogs';
      this.currentMatch.mode          = 'Review';
      this.currentMatch.matchSelectFlags = [];
      this.currentMatch.match         = undefined;
      this.currentMatch.selectedSet   = undefined;
      this.currentMatch.selectedGame  = undefined;
      this.currentMatch.selectedPoint = undefined;


      this.constructMatchesMessage(0);          
      this.setMessageResponders();
      this.utilSvc.setCurrentHelpContext("MatchLogSearch"); //note current context
      this.utilSvc.displayUserMessages();
      this.dataSvc.getPlayers(this.viewPublics ? PUBLIC_USER_ID : undefined ) //read appropriate list of players
      .then((pList) => {
        this.currentMatch.playerList = this.playerList = <any[]>pList;
        //the next line will call openSearchForm from the (tabChange) handler of the TABS element
        this.selectSearchTab();
        this.viewOpen = true;
        this.viewWasOpen = true;
     })
      .catch((error) => {
        this.utilSvc.returnToHomeMsg("noPlayersFound", 400);
      })
    };
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  //set up the message responders for this module
  private setMessageResponders() : void {
    document.addEventListener("selectViewTab", this.selectViewTab);
    document.addEventListener("searchUpdate", this.updateMatchList);
    document.addEventListener("nextTab", this.nextTab);
    document.addEventListener("prevTab", this.prevTab);
    document.addEventListener("closeView", this.closeView);
  }

  //remove all the message responders set in this module
  private deleteMessageResponders() : void {
    document.removeEventListener("selectViewTab", this.selectViewTab);
    document.removeEventListener("searchUpdate", this.updateMatchList);
    document.removeEventListener("nextTab", this.nextTab);
    document.removeEventListener("prevTab", this.prevTab);
    document.removeEventListener("closeView", this.closeView);
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  //update matchlist information from currentMatch service
  updateMatchList = () => {
    if( this.currentMatch.matchList === undefined){
      this.working = true;
      this.logsReady = false;
      this.constructMatchesMessage(0,"Working");
    }
    else{
      this.working = false;
      this.constructMatchesMessage(this.currentMatch.matchList.length);
      if(this.currentMatch.matchList.length){
        this.logsReady = true;
        this.currentMatch.matchSelectFlags.length = this.currentMatch.matchList.length;
        this.currentMatch.matchSelectFlags.fill(false);
        this.graphsSvc.clearAllGraphs();
        this.emit("matchesFound")
        setTimeout( () => {
          this.selectMenuTab();
        }, 50);
      }
    }
  }

  public constructMatchesMessage = (matches : number, msg? : string) => {
    if(msg !== undefined){
      this.matchesMessage = msg;
    } else {
      if(!matches) {
        this.matchesMessage = "0 MATCHES";
      }
      if(matches == 1) {
        this.matchesMessage = "1 MATCH";
      }
      if(matches > 1) {
        this.matchesMessage =  matches + " MATCHES";
      }      
    }
  }

  // return the current match object
  public selectedMatch() : Match {
    return this.currentMatch.match;
  }

  // set view closed flag, wait for animation to complete before changing states to 'home'
  public closeView  = () => {
    this.viewOpen = false;
    this.utilSvc.returnToHomeState(400);
  }

  public toggleSortOrder = () => {
    if(this.matchMenuOpen){
      this.emit("reverseMatchMenu");
    }
  }

  public openSearchForm = () => {
      this.closeMatchView();
      this.closeMatchMenu();
      // this.currentMatch.selectedTab = SEARCH_TAB;
      this.utilSvc.setCurrentHelpContext("MatchLogSearch");
      this.headerTitle = "Match Log Search";
      setTimeout( () => {
        this.searchFormOpen = true;
      }, 100);
  }

  public openMatchMenu = () => {
    if(this.logsReady){       // something to show?
      this.closeMatchView();
      this.closeSearchForm();
      if(this.managePublics){
        this.headerTitle = "Manage Public Logs";
        this.utilSvc.setCurrentHelpContext("ManagePublicLogsMenu");
      } else {
        this.headerTitle = this.viewPublics ? "Public Match Logs" : "Personal Match Logs";
        this.utilSvc.setCurrentHelpContext("MatchLogMenu");
      }
      setTimeout( () => {
        this.matchMenuOpen = true;
      }, 100);
    }
  }

  public openMatchView = () => {
    if(this.selectedMatch()){   // something to show
      this.closeSearchForm();
      this.closeMatchMenu();
      this.headerTitle = "View Statistics";
      this.utilSvc.setCurrentHelpContext("ViewMatchStatistics");
      this.matchViewOpen = true;
      this.emit('matchUpdated');
    }
  }

  private closeMatchView() : void {
    this.matchViewOpen = false;
    this.graphsSvc.clearAllGraphs();
  } 

  private closeMatchMenu() : void {
    this.matchMenuOpen = false;
  } 

  private closeSearchForm() : void {
    this.searchFormOpen = false;
  } 

  // switch the selected tab id to VIEW_TAB_ID, this causes a call to openMatchView
  private selectViewTab = () => {
    this.tabSet.select(VIEW_TAB_ID);
  }

  // switch the selected tab id to MENU_TAB_ID , this causes a call to openMatchMenu
  private selectMenuTab = () => {
    this.tabSet.select(MENU_TAB_ID);
  }

  // switch the selected tab id to SEARCH_TAB_ID , this causes a call to openSearchForm
  private selectSearchTab = () => {
    this.tabSet.select(SEARCH_TAB_ID);
  }

  // toggle the display of event related information
  public toggleEventInfo = () => {
    if(this.matchViewOpen){
      this.currentMatch.eventInfoOpen = this.eventInfoOpen = !this.currentMatch.eventInfoOpen;
    }
  }

  // find the playerList item that contains the given id
  private getPlayerListIndex(id : number) : number {
    var i;

    for(i=0; i<this.currentMatch.playerList.length; i++){
      if( this.currentMatch.playerList[i].id == id){
        return i;      // id found at position i
      }
    }
    return 999;       // not found?
  }

  // return the selected name data of the player with the given id
  public playerName = (id : number, sel = 'B') => {
    var i;
    var n = "Unknown";

    i = this.getPlayerListIndex(id);
    if(i != 999){
      switch(sel){
        case 'B':   // return both names
        n = this.currentMatch.playerList[i].name;
        break;
        case 'F':
        n = this.currentMatch.playerList[i].firstName;
        break;
        case 'L':
        n = this.currentMatch.playerList[i].lastName;
        break;
      }
    }
    return n;
  }

  public tabChange = (evt: NgbTabChangeEvent) => {
    switch(evt.nextId){
      case MENU_TAB_ID:
        this.currentMatch.selectedTab = MENU_TAB;
        this.openMatchMenu();
      break;
      case VIEW_TAB_ID:
        this.currentMatch.selectedTab = VIEW_TAB;
        this.openMatchView();
      break;
      case SEARCH_TAB_ID:
        this.currentMatch.selectedTab = SEARCH_TAB;
        this.openSearchForm();
      break;
    }
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    if(this.currentMatch.selectedTab < SEARCH_TAB){
      this.tabSet.select(this.tabNames[this.currentMatch.selectedTab + 1]); //this causes call to tabChange()
    }
  }

  // move to the previous tab in the tab set
  public prevTab = () => {
    if(this.currentMatch.selectedTab > MENU_TAB){
      this.tabSet.select(this.tabNames[this.currentMatch.selectedTab - 1]); //this causes call to tabChange()
    }
  }

}
