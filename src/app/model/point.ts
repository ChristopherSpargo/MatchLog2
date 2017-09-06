import { PLAYER_ID, OPPONENT_ID } from '../constants'

// CONSTANT values used by the Point class
export const POINT_ENDINGS = ["Ace","Double Fault","Winner","Error Forced","Error","Bad Call"];
export const ACE_POINT_ENDING = 0;
export const DOUBLE_FAULT_POINT_ENDING = 1;
export const WINNER_POINT_ENDING = 2;
export const FORCED_ERROR_POINT_ENDING = 3;
export const UNFORCED_ERROR_POINT_ENDING = 4;
export const BAD_CALL_POINT_ENDING = 5;
export const DEFAULT_POINT_ENDING = 4;
export const UNFORCED_ERROR_DETAILS = ["Selection","Positioning","Execution"];
export const UNFORCED_ERROR_DETAIL_SELECTION = 0;
export const UNFORCED_ERROR_DETAIL_POSITION = 1;
export const UNFORCED_ERROR_DETAIL_EXECUTION = 2;
export const DEFAULT_UNFORCED_ERROR_DETAIL = 2;

// this is the record stored for a Point in the database
export interface PointData {
s:    number;       // number of shots in the point (counting serve)
pS:   string;       // Player score (0, 15, 30, 40, AD, G)
oS:   string;       // Opponent score
wI:   number;       // winner Id (PLAYER_ID or OPPONENT_ID)
sI:   number;       // server Id (PLAYER_ID or OPPONENT_ID)
fSI:  boolean;      // first serve was in
rI:   boolean;      // return was in
rW:   string;       // return wing (forehand or backhand)
lW:   string;       // last shot wing
pAN:  boolean;      // Player was at net when point ended
oAN:  boolean;      // Opponent was at net when point ended
pEB:  number;       // point ended by (Ace, Winner, etc.)
uED:  number;       // detail attribute if point ended by unforced ERROR
bP:   boolean;      // point was a break point for returner
gP:   boolean;      // point was a game point for server
}

export class Point {
  
  //Point properties
  shots:                  number;
  playerScore:            string;
  opponentScore:          string;
  winnerId:               number;
  serverId:               number;
  firstServeIn:           boolean;
  returnIn:               boolean;
  returnWing:             string;
  lastShotWing:           string;
  playerAtNet:            boolean;
  opponentAtNet:          boolean;
  pointEndedBy:           number;
  unforcedErrorDetail:    number;
  breakPoint:             boolean;
  gamePoint:              boolean;
  playerWon:              boolean;
  opponentWon:            boolean;
  playerServed:           boolean;
  opponentServed:         boolean;

  //static method to validate the data and call the constructor
  static build(pLog: PointData) : Point {
    return new Point(pLog);
  }

  //define Point constructor
  constructor(pLog: PointData) {
    this.setPointProperties(pLog);
  };

  //set the properties of the point from a JSON object
  setPointProperties(pLog: PointData) : void {
    this.shots =               pLog.s || 0;
    this.playerScore =         pLog.pS || "0";
    this.opponentScore =       pLog.oS || "0";
    this.winnerId =            pLog.wI || 0;
    this.serverId =            pLog.sI || 0;
    this.firstServeIn =        pLog.fSI || false;
    this.returnIn =            pLog.rI || false;
    this.returnWing =          pLog.rW;
    this.lastShotWing =        pLog.lW;
    this.playerAtNet =         pLog.pAN;
    this.opponentAtNet =       pLog.oAN;
    this.pointEndedBy =        pLog.pEB;
    this.unforcedErrorDetail = pLog.uED;
    this.breakPoint =          pLog.bP;
    this.gamePoint =           pLog.gP;
    this.playerWon =           this.winnerId == PLAYER_ID;
    this.opponentWon =         this.winnerId == OPPONENT_ID;
    this.playerServed =        this.serverId == PLAYER_ID;
    this.opponentServed =      this.serverId == OPPONENT_ID;
  };

  //return the properties of the Point
  getPointLog() : PointData {
    var pLog: PointData = {
      s:    this.shots,
      pS:   this.playerScore,
      oS:   this.opponentScore,
      sI:   this.serverId,
      wI:   this.winnerId,
      fSI:  this.firstServeIn,
      rI:   this.returnIn,
      rW:   this.returnWing,
      lW:   this.lastShotWing,
      pAN:  this.playerAtNet,
      oAN:  this.opponentAtNet,
      pEB:  this.pointEndedBy,
      uED:  this.unforcedErrorDetail,
      bP:   this.breakPoint,
      gP:   this.gamePoint
    }
    return pLog;
  };

  //return the display properties of the Point
  getPointInfo() : any {
    var result: any = {
      shots:          this.shots,
      playerScore:    this.playerScore,
      opponentScore:  this.opponentScore,
      serverId:       this.serverId,
      winnerId:       this.winnerId,
      serve:          this.firstServeIn ? "1st" : "2nd",
      firstServeIn:   this.firstServeIn ? "In" : "Out",
      returnIn:       this.returnIn ? "In" : "Out",
      pointEndedBy:   POINT_ENDINGS[this.pointEndedBy],
      breakPoint:     this.breakPoint,
      gamePoint:      this.gamePoint
    };
    if(this.playerAtNet != undefined){
      result.playerAtNet = this.playerAtNet ? "Yes" : "No";
    }
    if(this.opponentAtNet != undefined){
      result.opponentAtNet = this.opponentAtNet ? "Yes" : "No";
    }
    result.winnerAtNet = this.winnerId == PLAYER_ID ? result.playerAtNet : result.opponentAtNet;
    result.loserAtNet = this.winnerId == PLAYER_ID ? result.opponentAtNet : result.playerAtNet;
    if(this.returnWing != undefined){
      result.returnWing = this.returnWing == "F" ? "Forehand" : "Backhand";
    }
    if(this.lastShotWing != undefined){
      result.lastShotWing = this.lastShotWing == "F" ? "Forehand" : "Backhand";
    }
    if(this.pointEndedBy == UNFORCED_ERROR_POINT_ENDING){
      result.errorDetail = UNFORCED_ERROR_DETAILS[this.unforcedErrorDetail];
    }
    if(this.pointEndedBy == DOUBLE_FAULT_POINT_ENDING){
      result.endedByDouble = true;
      result.secondServeIn = "Out";
      result.serve = "Double";
      result.returnIn = "";          
    }
    else {
      result.endedByDouble = false;
      result.secondServeIn = this.firstServeIn ? "" : "In";
    }
    result.endedByForceOrAce = result.endedByAce = result.endedByForce = false;
    switch(this.pointEndedBy){
      case ACE_POINT_ENDING:
        result.returnIn = ""; 
        result.endedByAce = true;         
      case FORCED_ERROR_POINT_ENDING:
        result.endedByForceOrAce = true;
        if(!result.endedByAce){result.endedByForce = true;}
      case BAD_CALL_POINT_ENDING:
      case WINNER_POINT_ENDING:
        result.enderId = this.winnerId;
        result.endedByWinner = true;
        break;
      case DOUBLE_FAULT_POINT_ENDING:
        result.returnIn = "";          
      case UNFORCED_ERROR_POINT_ENDING:
        result.enderId = 0;
        result.endedByWinner = false;
        break;
    }
    return result;
  };

  //return the score for the server in this Point
  getServerScore() : string {
    return (this.serverId == PLAYER_ID ? this.playerScore : this.opponentScore);
  }

  //return the score for the returner in this Point
  getReturnerScore() : string {
    return (this.serverId != PLAYER_ID ? this.playerScore : this.opponentScore);
  }

  //return the formatted score for this Point
  getFormattedScore() : string {
    return (this.getServerScore() + "-" + this.getReturnerScore());
  }

}
