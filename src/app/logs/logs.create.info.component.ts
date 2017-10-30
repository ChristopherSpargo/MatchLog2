import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { StateService } from "@uirouter/angular";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { DataSvc, TOURNAMENT_TABLE_NAME, EVENT_TABLE_NAME, LOCATION_TABLE_NAME } from '../model/dataSvc';
import { GraphsSvc } from '../model/graphsSvc';
import { MENU_TAB, MENU_TAB_ID } from './logs.view.component'
import { Match, MATCH_FORMATS, MatchData } from '../model/match'
import { Player, PlayerData, DEFAULT_GENDER_TYPE, DEFAULT_HANDED_TYPE } from '../model/player'
import { Point, PointData, UNFORCED_ERROR_POINT_ENDING, UNFORCED_ERROR_DETAILS } from '../model/point'
import { PLAYER_ID, OPPONENT_ID, ML_DATA_VERSION } from '../constants'

export const ROUND_NAMES = ["Round 1","Round 2","Round 3","Round 4","Quarterfinal",
       "Semifinal","Final","Playoff","Cons R1","Cons R2","Cons R3","Cons QF","Cons SF",
       "Cons Final"];

@Component({
  selector: '<app-logs-create-info>',
  templateUrl: 'logs.create.info.component.html'
})
export class LogsCreateInfoComponent implements OnInit {
@Input() MIFormOpen   : boolean;    // true if MATCH tab should display form for match information
@Input() resumeMenuOpen : boolean;  // true if MATCH tab should display menu of matches to resume
@Input() pausedMatches  : Match[];  // list of matches to resume (if Resume mode)

  checkAll              : boolean   = false; //true if form fields to be checked for errors (touched or not)
  working               : boolean = false;
  viewReady             : boolean = false;
  matchInfo = {
    date                : "",
    time                : this.getFormattedTime(new Date().getTime()),
    tTime               : new Date().getTime(),
    duration            : 0,
    tournament          : "",
    newTournamentName   : "", // in case user specifies a new Tournament on Match Info form
    location            : "",
    newLocationName     : "", // in case user specifies a new Location on Match Info form
    event               : "",
    newEventName        : "", // in case user specifies a new Event on Match Info form
    round               : "",
    format              : "",
    noAd                : "false",
    playerId            : "",
    opponentId          : "",
    serverId            : ""
  };
  newPlayer = {         // in case user specifies a new player on Match Info form
    id        : 0,
    firstName : "",
    lastName  : "",
    handed    : DEFAULT_HANDED_TYPE,
    gender    : ""
  };
  newOpponent = {       // in case user specifies a new opponent on Match Info form
    id        : 0,
    firstName : "",
    lastName  : "",
    handed    : DEFAULT_HANDED_TYPE,
    gender    : ""
  };
  tournamentList     : string[] = undefined;  // user's list of Tournaments (from Database)
  locationList       : string[] = undefined;  // user's list of Locations (from Database)
  eventList          : string[] = undefined;  // user's list of Events (from Database)
  roundList          : string[] = ROUND_NAMES;
  matchFormats       : string[] = MATCH_FORMATS;
  UNFORCED_ERROR_POINT_ENDING = UNFORCED_ERROR_POINT_ENDING;
  errorDetails       = UNFORCED_ERROR_DETAILS;
  PLAYER_ID          = PLAYER_ID;
  OPPONENT_ID        = OPPONENT_ID;
  requestStatus      : {[key: string] :any} ={};
  selectedMatch      : Match = undefined;
  playerSelectList   : any[] = [];
  opponentSelectList : any[] = [];


  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private currentMatch: CurrentMatch, private graphsSvc: GraphsSvc,
              private stateService: StateService){};

  ngOnInit() {
    if(!this.userInfo.authData){return;}
    this.checkAll = false;
    this.setMessageResponders();
    // pre-fill some fields and pre-fetch some tables that will be needed
    this.matchInfo.date = this.utilSvc.formatDate();
    this.currentMatch.pointsLogged = 0;
    this.currentMatch.hasBeenSaved = false;
    if(this.userInfo.profile){
      if(this.userInfo.profile.defaultPlayerId){
        this.matchInfo.playerId = this.userInfo.profile.defaultPlayerId.toString();
      }
      this.newPlayer.gender = this.newOpponent.gender = 
          this.userInfo.profile.defaultOpponentGender || DEFAULT_GENDER_TYPE;
    }
    this.dataSvc.getList(TOURNAMENT_TABLE_NAME)
    .then((list : string[]) => {
        this.tournamentList = list;
      })
    .catch((error) => {
        this.utilSvc.displayThisUserMessage("noTournamentsFound");
    });
    this.dataSvc.getList(LOCATION_TABLE_NAME)
    .then((list : string[]) => {
        this.locationList = list;
    })
    .catch((error) => {
        this.utilSvc.displayThisUserMessage("noLocationsFound");
    });
    this.dataSvc.getList(EVENT_TABLE_NAME)
    .then((list : string[]) => {
        this.eventList = list;
    })
    .catch((error) => {
        this.utilSvc.displayThisUserMessage("noEventsFound");
    });
  }
  ngOnDestrow() {
    this.deleteMessageResponders();
  }
        // // exposed methods
        // submitMatchInfo =    submitMatchInfo;
        // addADay              = addADay;
        // subtractADay         = subtractADay;
        // addTime              = addTime;
        // subtractTime         = subtractTime;
        // pointsLogged         = pointsLogged;
        // clearRequestStatus   = clearRequestStatus;
        // opponentFilter       = opponentFilter;
        // playerName           = playerName;
        // playerFilter         = playerFilter;
        // resumePausedMatch    = resumePausedMatch;
        // deletePausedMatch    = deletePausedMatch;
        // canSubmitSettings    = canSubmitSettings;

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  //set up the message responders for this module
  private setMessageResponders() : void {
    document.addEventListener("playerListReady", this.setViewReady);
    document.addEventListener("resumeMatch", this.resumeMatch);
  }

  //remove all the message responders set in this module
  private deleteMessageResponders() : void {
    document.removeEventListener("playerListReady", this.setViewReady);
    document.removeEventListener("resumeMatch", this.resumeMatch);
  }

  setViewReady = () => {
    this.filterPlayerLists();
    this.viewReady = true;
  }

  // return whether the match has been saved before or not
  matchSaved = () => {
    return this.currentMatch.hasBeenSaved;
  }

  //return boolean indicating if settings can still be submitted
  canSubmitSettings() : boolean {
    return this.currentMatch.mode == 'Create';
  }

  //process the user's input from the Match Information form
  submitMatchInfo(form: any) : void {
    var mData: MatchData = <MatchData>{};
    var pDef : Promise<any>;
    var oDef : Promise<any>;
    var promiseList : Promise<any>[] = [];

    this.checkAll = true;
    this.clearRequestStatus();
    if(form && this.checkForProblems(form,this.matchInfo.playerId, this.matchInfo.opponentId)) {
      this.utilSvc.scrollToTop();
      return;
    }
    if(this.matchInfo.tournament == "999"){   //add a new entry to tournament list?
      this.matchInfo.tournament = this.matchInfo.newTournamentName;
      this.dataSvc.updateList(TOURNAMENT_TABLE_NAME, this.matchInfo.newTournamentName, "Add")
      .then((success) => {
        this.dataSvc.getList(TOURNAMENT_TABLE_NAME)
        .then((list : string[]) => {
            this.tournamentList = list;
        })
        .catch((error) => {
            this.utilSvc.returnToHomeMsg("errorReadingTournamentList");
          });
        })
      .catch((error) => {
          this.utilSvc.returnToHomeMsg("errorUpdatingTournamentList");
        });
    }
    if(this.matchInfo.location == "999"){     //add a new entry to location list?
      this.matchInfo.location = this.matchInfo.newLocationName;
      this.dataSvc.updateList(LOCATION_TABLE_NAME, this.matchInfo.newLocationName, "Add")
      .then((success) => {
        this.dataSvc.getList(LOCATION_TABLE_NAME)
        .then((list : string[]) => {
            this.locationList = list;
        })
        .catch((error) => {
            this.utilSvc.returnToHomeMsg("errorReadingLocationList");
        });
      })
      .catch((error) => {
          this.utilSvc.returnToHomeMsg("errorUpdatingLocationList");
      });
    }
    if(this.matchInfo.event == "999"){        //add a new entry to event list?
      this.matchInfo.event = this.matchInfo.newEventName;
      this.dataSvc.updateList(EVENT_TABLE_NAME, this.matchInfo.newEventName, "Add")
      .then((success) => {
        this.dataSvc.getList(EVENT_TABLE_NAME)
        .then((list :string[]) => {
            this.eventList = list;
        })
        .catch((error) => {
            this.utilSvc.returnToHomeMsg("errorReadingEventList");
        });
      })
      .catch((error) => {
          this.utilSvc.returnToHomeMsg("errorUpdatingEventList");
      });
    }
    if(this.matchInfo.playerId == "999"){     //add a new entry to player list?
      promiseList.push(pDef);
      this.newPlayer.id = this.userInfo.profile.getNextPlayerId();
      this.matchInfo.playerId = this.newPlayer.id.toString();
      this.dataSvc.updateUserProfile(this.userInfo);
      promiseList.push(new Promise((resolve, reject) => {
        this.dataSvc.updatePlayerList(Player.build(this.newPlayer).getPlayerLog(), "Add")   //send the update
        .then((success) => {
          this.dataSvc.getPlayers()
          .then((list : any[]) => {
              this.currentMatch.playerList = list;
              resolve("Ok");
            })
            .catch((error) => {
              this.utilSvc.returnToHomeMsg("errorReadingPlayerList");
            });
          })
          .catch((error) => {
            this.utilSvc.returnToHomeMsg("errorUpdatingPlayerList");
          });
      }));
    }
    Promise.all(promiseList) //wait for all critical promises to update
    .then(() => {
      promiseList = [];
      if(this.matchInfo.opponentId == "999"){   //add a new entry to player list?
        this.newOpponent.id = this.userInfo.profile.getNextPlayerId();
        this.matchInfo.opponentId = this.newOpponent.id.toString();
        this.dataSvc.updateUserProfile(this.userInfo);
        promiseList.push(new Promise((resolve, reject) => {
          this.dataSvc.updatePlayerList(Player.build(this.newOpponent).getPlayerLog(), "Add")   //send the update
          .then((success) => {
            this.dataSvc.getPlayers()
            .then((list : any[]) => {
              this.currentMatch.playerList = list;
              resolve("Ok");
            })
            .catch((error) => {
              this.utilSvc.returnToHomeMsg("errorReadingPlayerList");
            });
          })
          .catch((error) => {
            this.utilSvc.returnToHomeMsg("errorUpdatingPlayerList");
          });
        }));
      }
      Promise.all(promiseList) //wait for all critical promises to update
      .then(() => {
        //setup a Match log object to use to build the Match object
        mData.userId = this.userInfo.profile.id;
        mData.dt = this.matchInfo.date;
        mData.tm = this.matchInfo.time;
        mData.du = this.matchInfo.duration;
        mData.dV = ML_DATA_VERSION;
        mData.sortDate = this.utilSvc.formatSortDate(mData.dt, mData.tm);
        mData.tn = this.matchInfo.tournament;
        mData.l = this.matchInfo.location;
        mData.e = this.matchInfo.event;
        mData.r = this.matchInfo.round;
        mData.pI = parseInt(this.matchInfo.playerId,10);
        mData.pH = this.currentMatch.playerList[this.getPlayerListIndex(mData.pI)].handed;
        mData.oI = parseInt(this.matchInfo.opponentId,10);
        mData.oH = this.currentMatch.playerList[this.getPlayerListIndex(mData.oI)].handed;
        mData.sI = parseInt(this.matchInfo.serverId,10);
        mData.f = parseInt(this.matchInfo.format,10);
        mData.nA = this.matchInfo.noAd == "true" ? true : false;
        if(!this.selectedMatch){ //need to build the Match object?
          this.currentMatch.match = this.selectedMatch = Match.build(mData);
          this.currentMatch.matchList.push(this.currentMatch.match);
          this.currentMatch.pointsLogged = 0;
          this.graphsSvc.clearAllGraphs();
          this.emit('setSelectedMatch');
        }
        else { //just update Match properties
          if(!this.currentMatch.pointsLogged){
            this.selectedMatch.sets = [];
          }
          this.selectedMatch.setMatchProperties(mData);
        }
        //now prepare to log points and display the match as we go
        promiseList = [];
        this.emit('matchUpdated');
        this.emit('resetLogForm');
        this.emit('selectLogTab');
        this.utilSvc.scrollToTop();
      });
    });
  }

  //return whether the points stream has been initiated for this match
  pointsLogged = () => {
    return this.currentMatch.pointsLogged !== 0;
  }

  private getFormattedTime(ms: number) : string { //given milliseconds, return LocaleTimeString without the seconds
    return this.utilSvc.formatTime(new Date((ms+600000)-((ms+600000) % 900000)));
  }

  addADay = () => {
    var t = new Date(this.matchInfo.date).getTime();
    this.matchInfo.date = this.utilSvc.formatDate(new Date(t+86400000));
  }

  subtractADay = () => {
    var t = new Date(this.matchInfo.date).getTime();
    this.matchInfo.date = this.utilSvc.formatDate(new Date(t-86400000));
  }

  //add 15 minutes to the time
  addTime = () => {
    this.matchInfo.tTime += 900000;
    this.matchInfo.time = this.getFormattedTime(this.matchInfo.tTime);
  }

  //subtract 15 minutes to the time
  subtractTime = () => {
    this.matchInfo.tTime -= 900000;
    this.matchInfo.time = this.getFormattedTime(this.matchInfo.tTime);
  }

  //find the playerList item that contains the given id
  private getPlayerListIndex = (id: number) => {
    var i;

    for(i=0; i<this.currentMatch.playerList.length; i++){
      if( this.currentMatch.playerList[i].id == id){
        return i;      //id found at position i
      }
    }
    return 999;       //not found?
  }

  //return the name of the player with the given id
  playerName = (id: number, newFlag = "") => {
    var i: number = this.getPlayerListIndex(id);
    if(i != 999){
      return this.currentMatch.playerList[i].name;
    }
    else{
      if((newFlag == 'P') && this.newPlayer.firstName && this.newPlayer.lastName){
        return this.newPlayer.firstName +' '+ this.newPlayer.lastName;
      }
      else{
        if((newFlag == 'O') && this.newOpponent.firstName && this.newOpponent.lastName){
          return this.newOpponent.firstName +' '+ this.newOpponent.lastName;
        }
        else{
          return "Unknown";
        }
      }
    }
  }

  // add an item to the status messages object
  private setStatusMessage = (item : string) => {
    this.requestStatus[item] = true; 
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {}; 
  }

  //indicate whether there are any status messages
  public haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  //verify the validity of entries from the form and report any errors
  private checkForProblems(form: any, player: string, opponent: string) : boolean {
    if(form.invalid){
      this.setStatusMessage("formHasErrors");
    }
    if((player && (player != "999")) && (opponent == player)){
      this.setStatusMessage("playerNamesMatch");
    }
    return this.haveStatusMessages();
  }

  filterPlayerLists = () : void => {
    if(this.currentMatch.playerList){
      this.playerSelectList = this.currentMatch.playerList.filter(this.playerFilter).sort(this.playerSort);
      this.opponentSelectList = this.currentMatch.playerList.filter(this.opponentFilter).sort(this.playerSort);
    }
  }

  //use this filter to create a menu of players that doesn't include the PLAYER
  public opponentFilter = (value) : boolean => {
    return (value.id != this.matchInfo.playerId);
  }

  //use this filter to create a menu of players that doesn't include the OPPONENT
  public playerFilter= (value) : boolean => {
    return (value.id != this.matchInfo.opponentId);
  }

  //use this as the playerList sort compare function to sort ascending by last name
  private playerSort = (a,b) : number => {return a.lastName < b.lastName ? -1 : 1;}

  // resume the current match after being paused
  resumeMatch = () => {
    this.currentMatch.matchList = [];
    this.currentMatch.selectedMatches = [];
    this.resumePausedMatch(this.currentMatch.match);
  }

  //resume a match that was pausedd
  resumePausedMatch(m: Match) : void {
    var resumeInfo : any = {};

    //fill in matchInfo form
    resumeInfo.date       = m.date;
    resumeInfo.time       = m.time; 
    resumeInfo.tTime      = new Date(m.time).getTime();
    resumeInfo.duration   = m.duration;
    resumeInfo.tournament = m.tournament;
    resumeInfo.newTournamentName = "";
    resumeInfo.location   = m.location;
    resumeInfo.newLocationName = "";
    resumeInfo.event      = m.event;
    resumeInfo.newEventName = "";
    resumeInfo.round      = m.round;
    resumeInfo.format     = m.format.toString();
    resumeInfo.noAd       = m.noAd ? "true" : "false";
    resumeInfo.playerId   = m.playerId.toString();
    resumeInfo.opponentId = m.opponentId.toString();
    resumeInfo.serverId   = m.serverId.toString();
    this.matchInfo = resumeInfo;
    this.currentMatch.hasBeenSaved = true;    // indicate match has been saved before
    this.graphsSvc.clearAllGraphs();

    this.currentMatch.match = this.selectedMatch = m;
    this.currentMatch.matchList.push(m);       // add match to list of matches (only one)
    this.currentMatch.selectedMatches.push(m); // add match to list of selected matches (1)
    this.currentMatch.startTimer = 0;
    this.currentMatch.match.duration = m.duration;
    this.currentMatch.pointsLogged = 1;        // indicate points logged
    this.currentMatch.mode = "Create";
    this.currentMatch.match.status = "Logging";
    m.readyForPoint();                     // make sure match object is ready for a point
    this.emit('setSelectedMatch');  // set match for display
    this.emit('resetLogForm');      // get point log form ready
    this.emit('selectLogTab');      // switch to point log form
    this.utilSvc.scrollToTop();
  }

  // delete a match that was pausedd
  deletePausedMatch = (m: Match) => {
    this.utilSvc.confirmMatchAction('Delete Match', this.playerName(m.playerId),
                                    this.playerName(m.opponentId), m.date, 'Delete')
    .then((deleteIt) => {
      this.dataSvc.deleteMatch(m.sortDate)
      .then((success) => {
          this.emit('removeResponders');
          this.stateService.go('logsResume',{task: 'Resume'},{reload: true});
        })
      .catch((error) => {
          this.utilSvc.displayThisUserMessage("errorDeletingMatch");
      });
    })
    .catch((dontDelete) => {
    });
  }

    // move to the next tab in the tab set
  public nextTab = () => {
    this.emit("nextTab");
  }

  // move to the next tab in the tab set
  public prevTab = () => {
    this.emit("prevTab");
  }

  // close the View Logs display
  public closeView = () => {
    this.utilSvc.emitEvent("closeView");
  }

}
