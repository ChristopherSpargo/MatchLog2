import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { StateService } from "@uirouter/angular";
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { DataSvc } from '../model/dataSvc';
import { GraphsSvc } from '../model/graphsSvc';
import { Player, PlayerData } from '../model/player';
import { Match } from '../model/match';

export const LOG_TAB       : number = 0;
export const LOG_TAB_ID    : string = "logTab";
export const VIEW_TAB      : number = 1;
export const VIEW_TAB_ID   : string = "viewTab";
export const MATCH_TAB     : number = 2;
export const MATCH_TAB_ID  : string = "matchTab";
 
// COMPONENT for CREATE MATCH LOGS feature

@Component({
  templateUrl: 'logs.create.component.html'
})
export class LogsCreateComponent implements OnInit, OnDestroy {

  @ViewChild(NgbTabset) tabSet : NgbTabset;

  viewOpen         : boolean = false;
  logFormOpen      : boolean = false;
  MIFormOpen       : boolean = false;
  matchViewOpen    : boolean = false;
  working          : boolean = false;
  playerList       : any[] = [];
  headerTitle      : string;
  eventInfoOpen    : boolean = false;
  tabNames         : string[] = [LOG_TAB_ID, VIEW_TAB_ID, MATCH_TAB_ID];
  requestStatus    : { [key: string]: any }  = {};
  resumeMenuOpen   : boolean = false;
  pausedMatches    : Match[] = [];
  appBarItems      : any[] = [];
  selectedTab;
  createModeBarItems= [
    { icon    : "pause",
      action  : "pauseMatch",
      label   : "pause match",
      tip     : "Pause Match"
    },
    { icon    : "stop",
      action  : "endMatch",
      label   : "end match",
      tip     : "End Match"
    }
  ];

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private graphsSvc : GraphsSvc, private currentMatch: CurrentMatch,
              private stateService: StateService){};

  ngOnInit() {
    // initialize the this.currentMatch object
    this.currentMatch.mode =          this.stateService.current.name == 'logsResume' ? 'Resume' : 'Create';
    this.currentMatch.match =         undefined;
    this.currentMatch.matchList =     [];
    this.currentMatch.selectedMatches = [];
    this.currentMatch.selectedSet =   undefined;
    this.currentMatch.selectedGame =  undefined;
    this.currentMatch.selectedPoint = undefined;
    this.currentMatch.pointsLogged =  0;
    this.currentMatch.editActive =    false;
    this.currentMatch.insertActive =  false;
    this.currentMatch.startTimer = 0;

    // make the user log in to create match logs
    if (!this.userInfo.authData) {
      this.utilSvc.returnToHomeMsg("signInToLog"); // let user know they need to log in
    }
    else {
      this.setMessageResponders();
      this.dataSvc.getPlayers()                            // get the current list of players
      .then((pList : any[]) => {
        this.currentMatch.playerList = this.playerList = pList;
        this.emit('playerListReady')
        if(this.currentMatch.mode == 'Resume'){         // are we resuming a paused match?
          this.dataSvc.getMatches({status: "Paused"})  // get the list of paused match logs
          .then((list : Match[]) => {
            if(list.length){
              this.pausedMatches = list;            // found something
              this.finishInit();
            } else{
             this.utilSvc.returnToHomeMsg("noMatchLogsToResume", 400);
            }
          })
          .catch((error) => {
            this.utilSvc.returnToHomeMsg("databaseAccessError", 400);
          });
        }
        else {    // user wants to create a new match log
          this.appBarItems = this.createModeBarItems;
          this.finishInit();
        }
      })
      .catch((error) => {
        this.utilSvc.setUserMessage("noPlayersFound");
        this.currentMatch.playerList = this.playerList = [];
        this.emit('playerListReady')
        this.finishInit();
      });
    };
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  // finish the init process
  private finishInit() {
    this.utilSvc.displayUserMessages();
    // the next line will call openMIForm from the on-select handler of the TABS element
    this.selectMatchTab(); 
    this.viewOpen = true;
  }

  //set up the message responders for this module
  private setMessageResponders() : void {
    document.addEventListener("selectLogTab", this.selectLogTab);
    document.addEventListener("selectReviewTab", this.selectReviewTab);
    document.addEventListener("closeView", this.closeView);
    document.addEventListener("nextTab", this.nextTab);
    document.addEventListener("prevTab", this.prevTab);
    document.addEventListener("endMatch", this.endMatch);
    document.addEventListener("pauseMatch", this.pauseMatch);
  }

  //remove all the message responders set in this module
  private deleteMessageResponders() : void {
    document.removeEventListener("selectLogTab", this.selectLogTab);
    document.removeEventListener("selectReviewTab", this.selectReviewTab);
    document.removeEventListener("closeView", this.closeView);
    document.removeEventListener("nextTab", this.nextTab);
    document.removeEventListener("prevTab", this.prevTab);
    document.removeEventListener("endMatch", this.endMatch);
    document.removeEventListener("pauseMatch", this.pauseMatch);
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }
 
  // user wants to end recording the match before actual completion
  endMatch = () => {
    if(this.currentMatch.pointsLogged && this.currentMatch.mode == "Create"){
      this.utilSvc.getConfirmation('End Logging', 'Mark match as finished and save this log now?', 'Yes')
        .then((endLog) => {
          this.currentMatch.match.status = "Stopped";
          this.currentMatch.match.removeLooseEnds(); //if there is an empty game, remove it
          this.appBarItems = [];
          this.currentMatch.mode = "Review";
          this.emit('finishMatch');
        })
        .catch((keepLogging) => {}
        );
    }
    else {
      this.utilSvc.displayThisUserMessage('nothingToSave');
    }
  }

  // user wants to pause recording the match before actual completion
  pauseMatch = () => {
    if(this.currentMatch.pointsLogged && this.currentMatch.mode == "Create"){
      this.utilSvc.getConfirmation('Pause Logging', 'Save log to resume logging later?', 'Yes')
        .then((pause) => {
          this.currentMatch.match.status = "Paused";
          this.currentMatch.match.removeLooseEnds(); //if there is an empty game, remove it
          this.appBarItems = [];
          this.currentMatch.mode = "Review";
          this.emit('finishMatch');
        })
        .catch((dontPause) => {}
        );
    }
    else {
      this.utilSvc.displayThisUserMessage('nothingToSave');
    }
  }

  // return the current match object
  selectedMatch = () => {
    return this.currentMatch.match;
  }

  // set view closed flag, wait for animation to complete before changing states to 'home'
  closeView = () => {
    var msg = "Abandon this match log?";
    var title = "Abandon Match Log"
    if(this.currentMatch.hasBeenSaved === true){
      msg = "Abandon changes to this match log?"
      title = "Abandon Changes"
    }
    if(this.currentMatch.pointsLogged && (this.currentMatch.mode == 'Create')){
      this.utilSvc.getConfirmation(title, msg, 'Yes')
        .then((abortMatch) => {
          this.viewOpen = false;
          this.emit('removeResponders');
          this.utilSvc.returnToHomeState(400);
        })
        .catch((keepLogging) => {}
        );
    } else {
        this.viewOpen = false;
        this.utilSvc.returnToHomeState(400);
    }
  }

  // indicate the Review tab as closed and clear the graphs
  closeMatchReview = () => {
    this.matchViewOpen = false;
    this.graphsSvc.clearAllGraphs();
  }

  private closeLogForm() : void {
    this.logFormOpen = false;
  } 

  private closeMIForm() : void {
    this.MIFormOpen = false;
  } 

  // give change detection a chance before switching tabs
  private delayTabSelect = (id : string) => {
    setTimeout( () => {
      this.tabSet.select(id);
    },10);
  }

  // switch the selected tab id to LOG_TAB_ID , this causes a call to openLogForm
  private selectLogTab = () => {
    this.closeMIForm()
    this.closeMatchReview();
    this.resumeMenuOpen = false;
    if(this.currentMatch.mode == 'Create'){this.appBarItems = this.createModeBarItems;}
    if(this.tabSet.activeId == LOG_TAB_ID) {
      this.openLogForm();
    } else {
      this.delayTabSelect(LOG_TAB_ID);
    }
  }

  // switch the selected tab id to VIEW_TAB_ID, this causes a call to openMatchView
  private selectReviewTab = () => {
    this.tabSet.select(VIEW_TAB_ID);
  }

  // switch the selected tab id to SEARCH_TAB_ID , this causes a call to openSearchForm
  private selectMatchTab = () => {
    this.resumeMenuOpen = false;
    this.tabSet.select(MATCH_TAB_ID);
  }

  // toggle the display of event related information
  public toggleEventInfo = () => {
    if(this.matchViewOpen){
      this.currentMatch.eventInfoOpen = this.eventInfoOpen = !this.currentMatch.eventInfoOpen;
    }
  }

  // prepare some display items for the Point Logging form
  // called when the LOG tab is selected
  openLogForm = () => {
    if(this.selectedMatch()){
      this.closeMatchReview()
      this.emit('formatServingLabel');
      this.utilSvc.setCurrentHelpContext("PointInformation");
      if(this.currentMatch.insertActive){
        this.headerTitle = "Insert Point";
      }
      else{
        if(this.currentMatch.editActive){
          this.headerTitle = "Edit Point";
        }
        else {   
          switch(this.currentMatch.match.status){
            case "Logging":
              this.headerTitle = "Log Point";
              break;
            default:
              this.headerTitle = "Match " + this.currentMatch.match.status;
          }           
        }
      }
      this.logFormOpen = true;
   }
  }

  // prepare some display items for the review tab
  // called when the REVIEW tab is selected
  openMatchReview = () => {
    if(this.selectedMatch()){
      this.currentMatch.selectedTab = VIEW_TAB;
      this.emit('matchUpdated'); //cause graphs to display
      this.headerTitle = "Log Review";
      this.utilSvc.setCurrentHelpContext("ReviewEditMatchLog");
      this.matchViewOpen = true;
    }
  }

  openMIForm = () => {
    if(this.currentMatch.mode == 'Create' || this.currentMatch.mode == 'Review'){
      this.closeMatchReview();
      this.headerTitle = "Log Setup";
      this.utilSvc.setCurrentHelpContext("MatchInformation");
      this.resumeMenuOpen = false;      
      this.MIFormOpen = true;
    } else {
      this.headerTitle = "Paused Matches";
      this.utilSvc.setCurrentHelpContext("ResumeMatchLog");
      this.MIFormOpen = false;
      this.resumeMenuOpen = true;      
    }
  }

  public tabChange = (evt: NgbTabChangeEvent) => {
    switch(evt.nextId){
      case LOG_TAB_ID:
        this.currentMatch.selectedTab = LOG_TAB;
        this.openLogForm();
      break;
      case VIEW_TAB_ID:
        this.currentMatch.selectedTab = VIEW_TAB;
        this.openMatchReview();
      break;
      case MATCH_TAB_ID:
        this.currentMatch.selectedTab = MATCH_TAB;
        this.openMIForm();
      break;
    }
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    if(this.currentMatch.selectedTab < MATCH_TAB){
      this.tabSet.select(this.tabNames[this.currentMatch.selectedTab + 1]); //this causes call to tabChange()
    }
  }

  // move to the previous tab in the tab set
  public prevTab = () => {
    if(this.currentMatch.selectedTab > LOG_TAB){
      this.tabSet.select(this.tabNames[this.currentMatch.selectedTab - 1]); //this causes call to tabChange()
    }
  }


        //find the playerList item that contains the given id
        getPlayerListIndex = (id: number ) => {
          var i;

          for(i=0; i<this.currentMatch.playerList.length; i++){
            if( this.currentMatch.playerList[i].id == id){
              return i;      //id found at position i
            }
          }
          return 999;       //not found?
        }

        //return the name of the player with the given id
        playerName =(id: number) => {
          var i;
          i = this.getPlayerListIndex(id);
          return (i != 999 ? this.currentMatch.playerList[i].name : "");
        }
			}
