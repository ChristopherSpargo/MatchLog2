import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from "@angular/forms";
import { StateService } from "@uirouter/angular";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { DataSvc, TOURNAMENT_TABLE_NAME, EVENT_TABLE_NAME, LOCATION_TABLE_NAME } from '../model/dataSvc';
import { GraphsSvc } from '../model/graphsSvc';
import { MENU_TAB, MENU_TAB_ID } from './logs.view.component'
import { Match, MATCH_FORMATS, MatchData, MatchPosition } from '../model/match'
import { TSet, TIEBREAK_SET_TYPE } from '../model/set'
import { Game, TIEBREAK_GAME_TYPE } from '../model/game'
import { Player, PlayerData, DEFAULT_GENDER_TYPE, DEFAULT_HANDED_TYPE } from '../model/player'
import { Point, PointData, UNFORCED_ERROR_POINT_ENDING, UNFORCED_ERROR_DETAILS, POINT_ENDINGS,
         WINNER_POINT_ENDING, ACE_POINT_ENDING, DEFAULT_POINT_ENDING, DOUBLE_FAULT_POINT_ENDING,
         BAD_CALL_POINT_ENDING, FORCED_ERROR_POINT_ENDING, DEFAULT_UNFORCED_ERROR_DETAIL } from '../model/point'
import { PLAYER_ID, PLAYER_ID_STR, OPPONENT_ID, OPPONENT_ID_STR, ML_DATA_VERSION } from '../constants'

@Component({
  selector: '<app-logs-point-info>',
  templateUrl: 'logs.pointInfo.component.html'
})
export class LogsPointInfoComponent implements OnInit, OnDestroy {

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private currentMatch: CurrentMatch, private graphsSvc: GraphsSvc,
              private stateService: StateService){};

  ngOnInit() {
    this.setMessageResponders();
    // pre-fill some fields and pre-fetch some tables that will be needed
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  // exposed properties
  pointInfo = {
    playerScore     : "0",
    opponentScore   : "0",
    first           : false,
    second          : false,
    ace             : false,
    double          : false,
    serve           : "",
    return          : false,
    missedReturn    : false,
    returnWinner    : false,
    returnWing      : "",
    shots           : "1",
    serverId        : "0",
    winnerId        : "0",
    lastShotWing    : "",
    playerAtNet     : false,
    opponentAtNet   : false,
    pointEndedBy    : "",
    unforcedErrorDetail: "99",
    breakPoint      : false,
    gamePoint       : false
  };

  ACE_ENDING                   = ACE_POINT_ENDING.toString();
  DOUBLE_FAULT_ENDING          = DOUBLE_FAULT_POINT_ENDING.toString();
  WINNER_ENDING                = WINNER_POINT_ENDING.toString();
  FORCED_ERROR_ENDING          = FORCED_ERROR_POINT_ENDING.toString();
  UNFORCED_ERROR_ENDING        = UNFORCED_ERROR_POINT_ENDING.toString();
  BAD_CALL_ENDING              = BAD_CALL_POINT_ENDING.toString();
  DEFAULT_ENDING               = DEFAULT_POINT_ENDING.toString();

  pointEndings = [
    {id: WINNER_POINT_ENDING, name: POINT_ENDINGS[WINNER_POINT_ENDING]},
    {id: FORCED_ERROR_POINT_ENDING, name: POINT_ENDINGS[FORCED_ERROR_POINT_ENDING]},
    {id: UNFORCED_ERROR_POINT_ENDING, name: POINT_ENDINGS[UNFORCED_ERROR_POINT_ENDING]},
    {id: BAD_CALL_POINT_ENDING, name: POINT_ENDINGS[BAD_CALL_POINT_ENDING]}];

  DEFAULT_ERROR_DETAIL         = DEFAULT_UNFORCED_ERROR_DETAIL.toString();
  errorDetails                 = UNFORCED_ERROR_DETAILS;
  PLAYER_ID                    = PLAYER_ID;
  OPPONENT_ID                  = OPPONENT_ID;
  servingLabel                 = "";
  specialPoint                 = "";
  requestStatus                = {};

  //exposed methods
  // submitPointInfo      = submitPointInfo;
  // updateLogForm        = updateLogForm;
  // addAShot             = addAShot;
  // subtractAShot        = subtractAShot;
  // getPlayerName        = getPlayerName;
  // getOpponentName      =  getOpponentName;
  // clearRequestStatus   = clearRequestStatus;
  // insertActive         = insertActive;
  // editActive           = editActive;
  // cancelInsertOrEdit   = cancelInsertOrEdit;
  // matchStatus          = matchStatus;


  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  //set up the message responders for this module
  private setMessageResponders() : void {
    document.addEventListener("deletePoint", this.deletePoint);
    document.addEventListener("insertPoint", this.insertPoint);
    document.addEventListener("editPoint", this.editPoint);
    document.addEventListener("movePointRight", this.movePointRight);
    document.addEventListener("movePointLeft", this.movePointLeft);
    document.addEventListener("formatServingLabel", this.formatServingLabel);
    document.addEventListener("resetLogForm", this.resetLogForm);
    document.addEventListener("finishMatch", this.finishMatch);
  }

  //remove all the message responders set in this module
  private deleteMessageResponders() : void {
    document.removeEventListener("deletePoint", this.deletePoint);
    document.removeEventListener("insertPoint", this.insertPoint);
    document.removeEventListener("editPoint", this.editPoint);
    document.removeEventListener("movePointRight", this.movePointRight);
    document.removeEventListener("movePointLeft", this.movePointLeft);
    document.removeEventListener("formatServingLabel", this.formatServingLabel);
    document.removeEventListener("resetLogForm", this.resetLogForm);
    document.removeEventListener("finishMatch", this.finishMatch);
  }

  // emit message to select the Review Tab
  selectReviewTab = () => {
    this.emit('selectReviewTab');
  }

  // emit a message to close the view
  closeView = () => {
    this.emit('closeView');
  }

  
  submitPointInfo = (form : NgForm) => {
    var pData : PointData = <PointData>{};
    var newPoint : Point;
    var lastPoint : Point;

    this.clearRequestStatus();
    if(form && this.checkForProblems(form)) {
      return;
    }
    //create a Point log object to use to create a Point object
    pData.s = parseInt(this.pointInfo.shots,10);
    pData.pS = this.pointInfo.playerScore;
    pData.oS = this.pointInfo.opponentScore;
    pData.wI = parseInt(this.pointInfo.winnerId,10);
    pData.sI = parseInt(this.pointInfo.serverId,10);
    pData.fSI = this.pointInfo.first;
    pData.rI = this.pointInfo.return;
    if(this.pointInfo.returnWing){pData.rW = this.pointInfo.returnWing;}
    if(this.pointInfo.lastShotWing){pData.lW = this.pointInfo.lastShotWing;}
    pData.pAN = this.pointInfo.playerAtNet;
    pData.oAN = this.pointInfo.opponentAtNet;
    pData.pEB = parseInt(this.pointInfo.pointEndedBy,10);
    if(this.pointInfo.unforcedErrorDetail != "99"){
      pData.uED = parseInt(this.pointInfo.unforcedErrorDetail,10);}
    pData.bP = this.pointInfo.breakPoint;
    pData.gP = this.pointInfo.gamePoint;

    newPoint = Point.build(pData);    //create the newPoint
    if(this.currentMatch.insertActive) { //insert point in front of selected point
      this.currentMatch.match.insertPoint(newPoint,this.currentMatch.selectedSetNumber,
                                      this.currentMatch.selectedGameNumber,
                                      this.currentMatch.selectedPointNumber);
      this.currentMatch.selectedPointNumber++;
      this.currentMatch.pointsLogged++;
    }
    else {
      if(this.currentMatch.editActive){ //replace selected point with newPoint
        this.currentMatch.match.replacePoint(newPoint,this.currentMatch.selectedSetNumber,
                                          this.currentMatch.selectedGameNumber,
                                          this.currentMatch.selectedPointNumber);
        this.currentMatch.selectedPoint = newPoint;
      }
      else {
        this.currentMatch.match.addNewPoint(newPoint);
        this.currentMatch.pointsLogged++;
      }
    }
    if(!this.currentMatch.startTimer){
      //note when we started logging points
      this.currentMatch.startTimer = new Date().getTime();
    }
    if(!this.currentMatch.match.duration){
      //initialize duration to 1ms if necessary (not necessary on Resume)
      this.currentMatch.match.duration = 1;
    }
    this.emit('matchUpdated');
    if(this.currentMatch.insertActive || this.currentMatch.editActive){
      this.currentMatch.insertActive = this.currentMatch.editActive = false;
      this.emit('selectReviewTab');
      this.emit('resetSelectedPoint');
    }
    if(!this.currentMatch.match.winnerId){
      form.reset();
      this.resetLogForm();
    } else {
      this.currentMatch.match.status = "Complete";
      this.currentMatch.mode = "Review";
      this.finishMatch();
    }
  }

  finishMatch = () => {
    this.currentMatch.match.dataVersion = ML_DATA_VERSION;
    if(this.currentMatch.startTimer){
      this.currentMatch.match.duration += (new Date().getTime() - this.currentMatch.startTimer);
    }
    this.dataSvc.saveMatch(this.currentMatch.match)
    .then((success) => {
      this.currentMatch.hasBeenSaved = true;
      this.reviewFinishedMatch("matchLogSaved"); //let user know match log was saved
    })
    .catch((error) => {
      this.reviewFinishedMatch("errorSavingMatch"); //let user know match log was NOT saved
    });
  }

  reviewFinishedMatch = (msg : string) => {
      this.utilSvc.displayThisUserMessage(msg);
      this.emit('selectLogTab');
  }

  // resume logging the current match (after pausing)
  resumeMatch = () => {
    this.emit('resumeMatch');
  }

  loggingMatch = () => {
    if(!this.currentMatch) {return false;}
    return (this.currentMatch.mode == "Create");
  }

  matchStatus = () => {
    if(!this.currentMatch.match) {return "";}
    return this.currentMatch.match.status;
  }

  resetLogForm = () => {
    this.formatServingLabel();
    this.pointInfo.playerScore    = <string>this.currentMatch.match.currentScore(PLAYER_ID);
    this.pointInfo.opponentScore  = <string>this.currentMatch.match.currentScore(OPPONENT_ID);
    this.pointInfo.gamePoint      = this.currentMatch.gamePoint;
    this.pointInfo.breakPoint     = this.currentMatch.breakPoint;
    this.pointInfo.first          = false;
    this.pointInfo.second         = false;
    this.pointInfo.ace            = false;
    this.pointInfo.double         = false;
    this.pointInfo.return         = false;
    this.pointInfo.missedReturn   = false;
    this.pointInfo.returnWinner   = false;
    this.pointInfo.returnWing     = "";
    this.pointInfo.lastShotWing   = "";
    this.pointInfo.playerAtNet    = false;
    this.pointInfo.opponentAtNet  = false;
    this.pointInfo.shots          = "0";
    this.pointInfo.winnerId       = "";
    this.pointInfo.serverId       = this.currentMatch.match.serverId.toString();
    this.pointInfo.pointEndedBy   = "";
    this.pointInfo.unforcedErrorDetail = "99";
  }

  // toggle the state of the return wing value after updating the logForm
  toggleReturnWing = () => {
    var pi = this.pointInfo;
    if((pi.first || pi.second) && !pi.double) {
      if(pi.returnWing == 'F'){
        this.updateLogForm('returnWingB');
        pi.returnWing = 'B';
      } else {
        this.updateLogForm('returnWingF');
        pi.returnWing = 'F';
      }    
    }
  }

  // toggle the state of the return wing value after updating the logForm
  toggleLastShotWing = () => {
    var pi = this.pointInfo;
    if(!pi.ace && !pi.missedReturn && !pi.double) {
      if(pi.lastShotWing == 'F'){
        this.updateLogForm('lastShotWingB');
        pi.lastShotWing = 'B';
      } else {
        this.updateLogForm('lastShotWingF');
        pi.lastShotWing = 'F';
      }
    }
  }

  // handle updates to the point information form

  updateLogForm = (item : string) => {
    var pi = this.pointInfo;

    this.clearRequestStatus();
    switch(item){
      case "Ace":
        if(pi.ace){
          pi.pointEndedBy = this.ACE_ENDING;
          pi.winnerId = pi.serverId == PLAYER_ID_STR ? PLAYER_ID_STR : OPPONENT_ID_STR;
          if(!pi.returnWing){pi.returnWing = "F"};
          pi.lastShotWing = "";
          pi.shots = "1";
          if(!pi.first && !pi.second){
            pi.first = true;
          }
          pi.return = pi.missedReturn = pi.returnWinner =
            pi.double = pi.playerAtNet = pi.opponentAtNet = false;
          pi.unforcedErrorDetail = "99";
        }
        else {
          pi.pointEndedBy = "";
          pi.winnerId = "";
          pi.first = pi.second = false;
          pi.shots = "0";
        }
        break;
        case "Double":
        if(pi.double){
          pi.pointEndedBy = this.DOUBLE_FAULT_ENDING;
          pi.winnerId = pi.serverId == PLAYER_ID_STR ? OPPONENT_ID_STR : PLAYER_ID_STR;
          pi.shots = "1";
          pi.returnWing = pi.lastShotWing = "";
          pi.first = pi.second = pi.ace = pi.playerAtNet = pi.opponentAtNet = false;
          pi.return = pi.missedReturn = false;
          pi.unforcedErrorDetail = "99";
        }
        else {
          pi.pointEndedBy = "";
          pi.winnerId = "";
          pi.shots = "0";
        }
        break;
      case "first":
        if(pi.first){
          pi.second = pi.double = false;
          if(!(pi.return || pi.returnWinner || pi.missedReturn || pi.ace)){ 
            pi.return = true;
            if(!pi.returnWing){pi.returnWing = "F"};
            pi.pointEndedBy = pi.winnerId = "";
            pi.shots = "3";
          }
        }
        else 
        { pi.shots = "0";
          pi.return = pi.returnWinner = pi.missedReturn = pi.ace = false;
        }
        break;
      case "second":
        if(pi.second){
          pi.first = pi.double = false;
          if(!(pi.return || pi.returnWinner || pi.missedReturn || pi.ace)){ 
            pi.return = true;
            if(!pi.returnWing){pi.returnWing = "F"};
            pi.pointEndedBy = pi.winnerId = "";
            pi.shots = "3";
          }
        }
        else 
        { pi.shots = "0";
          pi.return = pi.returnWinner = pi.missedReturn = pi.ace = false;
        }
        break;
      case "return":
        if(pi.first || pi.second){
          if(pi.return){
            pi.missedReturn = pi.ace = pi.double = false;
            if(!pi.returnWing){pi.returnWing = "F"};
            pi.pointEndedBy = pi.winnerId = "";
            pi.shots = "3";
          }
          else {
              pi.shots = "2";
          }
        }
        break;
      case "missedReturn":
        if(pi.first || pi.second){
          if(pi.missedReturn){
            pi.pointEndedBy = this.UNFORCED_ERROR_ENDING;
            pi.unforcedErrorDetail = this.DEFAULT_ERROR_DETAIL;
            pi.winnerId = pi.serverId == PLAYER_ID_STR ? PLAYER_ID_STR : OPPONENT_ID_STR;
            pi.return = pi.returnWinner = pi.playerAtNet = pi.opponentAtNet = false;
            if(!pi.returnWing){pi.returnWing = "F"};
            pi.lastShotWing = pi.returnWing;
            pi.shots = "2";
          }
          else {
            pi.pointEndedBy = "";
            pi.winnerId = "";
            pi.shots = "2";
          }
        }
        break;
      case "returnWinner":
        if(pi.first || pi.second){
          if(pi.returnWinner){
            if(!pi.returnWing){pi.returnWing = "F"};
            pi.lastShotWing = pi.returnWing;
            pi.pointEndedBy = this.WINNER_ENDING;
            pi.winnerId = pi.serverId == PLAYER_ID_STR ? OPPONENT_ID_STR : PLAYER_ID_STR;
            pi.shots = "2";
            pi.return = true;
            pi.ace = pi.missedReturn = pi.double = pi.playerAtNet = pi.opponentAtNet = false;
            pi.unforcedErrorDetail = "99";
          }
          else {
            pi.pointEndedBy = "";
            pi.winnerId = "";
            if(pi.return){
              pi.shots = "3";}
            else{
              pi.shots = "0";
            }
          }
        }
        break;
      case "returnWingF":
        if(!pi.ace && (pi.returnWinner || pi.missedReturn || !pi.lastShotWing)){
          pi.lastShotWing = "F";
        }
        break;
      case "returnWingB":
        if(!pi.ace && (pi.returnWinner || pi.missedReturn || !pi.lastShotWing)){
          pi.lastShotWing = "B";
        }
        break;
      case "lastShotWingF":
        if(pi.shots == "2"){
          pi.returnWing = "F";
        }
        break;
      case "lastShotWingB":
        if(pi.shots == "2"){
          pi.returnWing = "B";
        }
        break;
      case POINT_ENDINGS[WINNER_POINT_ENDING]:
        if(!pi.ace && (pi.first || pi.second)){
          if(parseInt(pi.shots,10) % 2 == 1){  // SERVER hits the odd numbered shots
            pi.winnerId = pi.serverId == PLAYER_ID_STR ? PLAYER_ID_STR : OPPONENT_ID_STR;
          } else {
            pi.winnerId = pi.serverId == PLAYER_ID_STR ? OPPONENT_ID_STR : PLAYER_ID_STR;
          }
          if(parseInt(pi.shots,10) == 2){pi.lastShotWing = pi.returnWing};
          if(!pi.lastShotWing){pi.lastShotWing = "F"};
          pi.unforcedErrorDetail = "99";
          this.clearRequestStatus();
        }
        break;
      case POINT_ENDINGS[UNFORCED_ERROR_POINT_ENDING]:
      case POINT_ENDINGS[FORCED_ERROR_POINT_ENDING]:
      case POINT_ENDINGS[BAD_CALL_POINT_ENDING]:
        if(!pi.ace && (pi.first || pi.second)){
          if(parseInt(pi.shots,10) % 2 == 1){  // SERVER hits the odd numbered shots
            pi.winnerId = pi.serverId == PLAYER_ID_STR ? OPPONENT_ID_STR : PLAYER_ID_STR;
          } else {
            pi.winnerId = pi.serverId == PLAYER_ID_STR ? PLAYER_ID_STR : OPPONENT_ID_STR;
          }
          if(parseInt(pi.shots,10) == 2){pi.lastShotWing = pi.returnWing};
          if(!pi.lastShotWing){pi.lastShotWing = "F"};
          if(item == POINT_ENDINGS[UNFORCED_ERROR_POINT_ENDING]){
            if(pi.unforcedErrorDetail == "99"){
              pi.unforcedErrorDetail = this.DEFAULT_ERROR_DETAIL;
            }
          } else {
              pi.unforcedErrorDetail = "99";
          }
          this.clearRequestStatus();
        }
        break;
      case "playerWon":
        if(!pi.ace && (pi.first || pi.second)){
          this.checkShotCount(PLAYER_ID_STR);
        }
        break;
      case "opponentWon":
        if(!pi.ace && (pi.first || pi.second)){
          this.checkShotCount(OPPONENT_ID_STR);
        }
        break;
      default:
    }

  }

  // check for inconsistent winner/shot count combination
  checkShotCount = (wId : string) => {
    var pi = this.pointInfo;
    
    if(wId){
      switch(parseInt(pi.pointEndedBy,10)){
        case ACE_POINT_ENDING:
        case DOUBLE_FAULT_POINT_ENDING:
          break;
        case WINNER_POINT_ENDING:
          if((parseInt(pi.shots,10) % 2 == 1) && (pi.serverId != wId)){
            this.setStatusMessage("questionableShotCount");
          }
          if((parseInt(pi.shots,10) % 2 == 0) && (pi.serverId == wId)){
            this.setStatusMessage("questionableShotCount");
          }
          break;
        case FORCED_ERROR_POINT_ENDING:
        case UNFORCED_ERROR_POINT_ENDING:
        case BAD_CALL_POINT_ENDING:
          if((parseInt(pi.shots,10) % 2 == 1) && (pi.serverId == wId)){
            this.setStatusMessage("questionableShotCount");
          }
          if(((parseInt(pi.shots,10) % 2 == 0) || (pi.shots == "1")) && (pi.serverId != wId)){
            this.setStatusMessage("questionableShotCount");
          }
          break;
        default:
          if(parseInt(pi.shots,10) % 2 == 1){
            pi.pointEndedBy = (pi.serverId == wId) ? this.WINNER_ENDING 
                                                    : this.UNFORCED_ERROR_ENDING;
          } else {
            pi.pointEndedBy = (pi.serverId != wId) ? this.WINNER_ENDING : this.UNFORCED_ERROR_ENDING;
          }
          if((pi.pointEndedBy == this.UNFORCED_ERROR_ENDING) && (pi.unforcedErrorDetail == "99")){
            pi.unforcedErrorDetail = this.DEFAULT_ERROR_DETAIL;
          }
      }
      if(!pi.lastShotWing){ pi.lastShotWing = 'F';}
    }
    else {
      this.setStatusMessage("noWinner");
    }
  }

  addAShot = (n : number) => {
    if(!this.pointInfo.shots){
      this.pointInfo.shots = "0";
    }
    this.pointInfo.shots = (parseInt(this.pointInfo.shots,10) + n).toString();
  }

  subtractAShot = () => {
    if(!this.pointInfo.shots){
      this.pointInfo.shots = "0";
    }
    if(this.pointInfo.shots != "0"){
      this.pointInfo.shots = (parseInt(this.pointInfo.shots,10) - 1).toString();
    }
  }

  getPlayerName = () => {
    return this.currentMatch.playerName;
  }

  getOpponentName = () => {
    return this.currentMatch.opponentName;
  }

  // format the label that says who is serving and what the score is from their perspective
  formatServingLabel = () => {
    var msg = "Point started with";
    var specialPointServer;
    var position : MatchPosition = {
      set: 0,
      game: 0,
      point: 0
    };

    this.specialPoint = "";
    if(this.currentMatch.match !== undefined){
      specialPointServer = this.currentMatch.sId;
      if(this.currentMatch.insertActive || this.currentMatch.editActive){
        //when editing or inserting a point, display the score at that point
        position.set = this.currentMatch.selectedSetNumber;
        position.game = this.currentMatch.selectedGameNumber;
        position.point = this.currentMatch.selectedPointNumber-1;
        this.currentMatch.match.computeScore(position);
        this.currentMatch.setPoint = this.currentMatch.selectedSet.setPoint;
        this.currentMatch.breakPoint = this.currentMatch.selectedPoint.breakPoint;
        this.currentMatch.gamePoint = this.currentMatch.selectedPoint.gamePoint;
        this.currentMatch.tiebreak = (this.currentMatch.selectedSet.type == TIEBREAK_SET_TYPE) ||
                                  (this.currentMatch.selectedGame.type == TIEBREAK_GAME_TYPE);
        specialPointServer = this.currentMatch.selectedPoint.serverId == PLAYER_ID ? this.currentMatch.pId
                                                                                   : this.currentMatch.oId;
        msg = 
        (this.currentMatch.selectedPoint.serverId == PLAYER_ID
          ? this.currentMatch.playerName : this.currentMatch.opponentName) +
          " serving: "+ this.formatCurrentMatchScore(true) + this.formatCurrentGameScore(true);
      } else{
        //when not edit/insert, display the current score
        msg = 
        (this.currentMatch.sId == this.currentMatch.pId ? this.currentMatch.playerName : this.currentMatch.opponentName) +
          " serving: "+ this.formatCurrentMatchScore(false) + this.formatCurrentGameScore(false);
      }
      if(this.currentMatch.match.matchPoint) {
        this.specialPoint = "match point";
      } else {
        if(this.currentMatch.setPoint) {
          this.specialPoint = "set point";
        } else {
          if( this.currentMatch.breakPoint || this.currentMatch.gamePoint){
            if(this.currentMatch.gamePoint && this.currentMatch.breakPoint) {
              this.specialPoint = specialPointServer == this.currentMatch.pId ? "game point" : "break point";
            } 
            else {
              if(this.currentMatch.breakPoint) {
                this.specialPoint = "break point";
              }
              if(this.currentMatch.gamePoint) {
                this.specialPoint = "game point";
              }
            }
          }
          else {
            if(this.currentMatch.tiebreak) {
              this.specialPoint = "tiebreak";
            }
          }
        }
      }
    }
    this.servingLabel = msg;
  }

  formatCurrentMatchScore = (insertOrEdit : boolean) => {
    var sets : TSet[] = this.currentMatch.match.sets;
    var msg : string = "";
    var i : number;

    if(insertOrEdit){
      for(i = 0; i < this.currentMatch.selectedSetNumber; i++){
        if( this.currentMatch.selectedPoint.serverId == PLAYER_ID ){
          msg += "(" + sets[i].playerScore + "," + sets[i].opponentScore + ")";
        } else {
          msg += "(" + sets[i].opponentScore + "," + sets[i].playerScore + ")";
        }
      }
    }
    else {
      sets.forEach((set) => {
        if( this.currentMatch.sId == this.currentMatch.pId ){
          msg += "(" + set.playerScore + "," + set.opponentScore + ")";
        } else {
          msg += "(" + set.opponentScore + "," + set.playerScore + ")";
        }
      })
    }
    return msg;
  }

  formatCurrentGameScore = (insertOrEdit : boolean) => {

    if(insertOrEdit){
      if(this.currentMatch.selectedSet.type != TIEBREAK_SET_TYPE){
        return "(" + this.currentMatch.selectedPoint.getServerScore() +
            "-"+ this.currentMatch.selectedPoint.getReturnerScore() +")";
      }
    }
    else{
      if(this.currentMatch.match.currGame !== undefined){
        return " " + this.currentMatch.match.
          currGame[this.currentMatch.sId == this.currentMatch.pId ? 0 : 1] +
            "-"+this.currentMatch.match.
            currGame[this.currentMatch.sId == this.currentMatch.pId ? 1 : 0];
      }
    }
    return "";
  }

  // add an item to the status messages object
  setStatusMessage(item : string) : void {
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

  checkForProblems = (form : any) => {
    if(form.invalid){
      this.setStatusMessage("formHasErrors");
    }
    if(this.pointInfo.shots == "0"){
      this.setStatusMessage("zeroShotCount");
    } else {
        this.checkShotCount(this.pointInfo.winnerId);
    }
    return this.haveStatusMessages();
  }

  //prompt the user for confirmation of point deletion then delete if OK
  deletePoint = () => {
    var msg = "Delete Set " +this.currentMatch.selectedSetNumber +
          "/Game " + this.currentMatch.selectedGameNumber +
          "/Point " + this.currentMatch.selectedPointNumber +" ?";
    this.utilSvc.getConfirmation('Delete Point', msg, 'Delete')
      .then((deletePt) => {
        this.currentMatch.match.deletePoint(this.currentMatch.selectedSetNumber,
                                          this.currentMatch.selectedGameNumber,
                                          this.currentMatch.selectedPointNumber);
        this.emit('resetSelectedGame');
        this.currentMatch.selectedPointNumber = this.currentMatch.selectedSet.getEndPointNumber();
        this.emit('resetSelectedPoint');
        this.emit('matchUpdated');
        this.resetLogForm();
        this.utilSvc.setUserMessage("pointDeleted");
        this.utilSvc.displayUserMessages();
      })
      .catch((dontDelete) => {}
      );
  }

  // change the currently selected point's position in the point list
  movePoint = (offset : number) => {
    if(this.currentMatch.match.movePoint(offset, this.currentMatch.selectedSetNumber,
                                          this.currentMatch.selectedGameNumber,
                                          this.currentMatch.selectedPointNumber)){
      this.currentMatch.selectedPointNumber += offset;
      // this.emit('resetSelectedGame');
      this.emit('matchUpdated');       
      this.resetLogForm();     
    }
  }
  // move the selected point one position earlier in the point list
  movePointLeft = () => {
    this.movePoint(-1);
  }

  // move the selected point one position later in the point list
  movePointRight = () => {
    this.movePoint(1);
  }

  // insert a new point right before the currently selected point
  insertPoint = () => {
    this.currentMatch.insertActive = true;
    this.pointInfo.serverId = this.currentMatch.selectedPoint.serverId.toString();
    this.emit('selectLogTab');
  }

  // edit the currently selected point
  editPoint = () => {
    var p : Point = this.currentMatch.selectedPoint;

    this.pointInfo.playerScore          = p.playerScore;
    this.pointInfo.opponentScore        = p.opponentScore;
    this.pointInfo.gamePoint            = p.gamePoint;
    this.pointInfo.breakPoint           = p.breakPoint;
    this.pointInfo.first                = p.firstServeIn;
    this.pointInfo.double               = p.pointEndedBy == DOUBLE_FAULT_POINT_ENDING;
    this.pointInfo.second               = !p.firstServeIn && !this.pointInfo.double;
    this.pointInfo.ace                  = p.pointEndedBy == ACE_POINT_ENDING;
    this.pointInfo.return               = p.returnIn;
    this.pointInfo.returnWing           = p.returnWing;
    this.pointInfo.lastShotWing         = p.lastShotWing;
    this.pointInfo.playerAtNet          = p.playerAtNet;
    this.pointInfo.opponentAtNet        = p.opponentAtNet;
    this.pointInfo.missedReturn         = !p.returnIn;
    this.pointInfo.returnWinner         = p.returnIn && (p.shots == 2);
    this.pointInfo.shots                = p.shots.toString();
    this.pointInfo.winnerId             = p.winnerId.toString();
    this.pointInfo.serverId             = p.serverId.toString();
    this.pointInfo.pointEndedBy         = p.pointEndedBy.toString();
    this.pointInfo.unforcedErrorDetail  = p.unforcedErrorDetail ? p.unforcedErrorDetail.toString() : "99";
    this.currentMatch.editActive          = true;
    this.emit('selectLogTab');
  }

  // getter for insertActive flag
  insertActive = () => {
    return this.currentMatch.insertActive;
  }

  // getter for editActive flag
  editActive = () => {
    return this.currentMatch.editActive;
  }

  //user clicked CANCEL in edit or insert mode
  cancelInsertOrEdit = (form : NgForm) => {
    this.currentMatch.insertActive = this.currentMatch.editActive = false;
    this.emit('matchUpdated');
    this.emit('selectReviewTab');
    this.resetLogForm();
    form.reset();
  }

    // move to the next tab in the tab set
  public nextTab = () => {
    this.emit("nextTab");
  }

  // move to the next tab in the tab set
  public prevTab = () => {
    this.emit("prevTab");
  }

}
