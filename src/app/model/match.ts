import { TSet, SIX_GAME_SET_TYPE, EIGHT_GAME_SET_TYPE, TIEBREAK_SET_TYPE, SetData } from './set';
import { PLAYER_ID, OPPONENT_ID } from '../constants'
import { Point } from './point'
import { Game, TIEBREAK_GAME_TYPE } from './game'

// this object represents a location in a Match data stream
export interface MatchPosition {
  set?       : number;
  game       : number;
  point      : number;
}

// this is the record stored for a Match in the database
export interface MatchData {
  userId:     string;     // auth token number for owner of this data
  sortDate:   string;     // date-time for match (yyyymmddHHmm)
  dV:         number;     // data version number
  st:         string;     // status (Ended, Paused)
  dt:         string;     // match date mm/dd/yyyy
  tm:         string;     // start time (hh:mm)
  du:         number;     // duration in ms
  tn:         string;     // tournament name (CAZ Pot O' Gold L5)
  l:          string;     // location name (Paseo Racquet Complex)
  e:          string;     // event name (Girls 18s)
  r:          string;     // round name (Round 1)
  pI:         number;     // Player Id
  pH:         string;     // Player Handed (Left or Right)
  oI:         number;     // Opponend Id
  oH:         string;     // Opponent Handed
  sI:         number;     // current server Id (PLAYER_ID or OPPONENT_ID)
  f:          number;     // format (1 set (6 games), etc.)
  nA:         boolean;    // no-Ad scoring was used
  wI:         number;     // Winner Id
  sc:         number[][]; // score, array [n,n] for each set
  cG:         string[];   // score of the current game ["0","40"]
  sL:         TSet[];     // list of Sets
}


//CONSTANT values used by the Match class
export const MATCH_FORMATS =                  ["2 out of 3 sets","2 sets + Tiebreak",
                                        "1 set (6 games)", "1 set (8 games)", "10-Pt Tiebreak"];
export const TWO_OF_THREE_MATCH_FORMAT =      0;
export const TWO_PLUS_TIEBREAK_MATCH_FORMAT = 1;
export const ONE_SIX_SET_MATCH_FORMAT =       2;
export const ONE_EIGHT_SET_MATCH_FORMAT =     3;
export const ONE_TIEBREAK_MATCH_FORMAT =      4;
export const DEFAULT_MATCH_FORMAT =           1;

export class Match {

  //Match properties
  userId:         string;
  sortDate:       string;
  dataVersion:    number;
  status:         string;
  date:           string;
  time:           string;
  duration:       number;
  tournament:     string;
  location:       string;
  event:          string;
  round:          string;
  playerId:       number;
  playerHanded:   string;
  opponentId:     number;
  opponentHanded: string;
  serverId:       number;
  format:         number;
  noAd:           boolean;
  winnerId:       number;
  score:          number[][];
  currGame:       string[];
  sets:           any[];
  matchPoint:     boolean;
  
  //define Match constructor
  constructor (matchLog: MatchData) {
    this.setMatchProperties(matchLog);
  };

  //static method to validate the data and call the constructor
  static build(matchLog: MatchData) : Match {
    return new Match(matchLog);
  }

  // set the properties object for the match
  setMatchProperties(mLog: MatchData) : void {
    this.userId =         mLog.userId;
    this.sortDate =       mLog.sortDate;
    this.dataVersion =    mLog.dV || 1.0;
    this.status =         mLog.st || "Ended";
    this.date =           mLog.dt;
    this.time =           mLog.tm;
    this.duration =       mLog.du || 0;
    this.tournament =     mLog.tn;
    this.location =       mLog.l;
    this.event =          mLog.e;
    this.round =          mLog.r;
    this.playerId =       mLog.pI || 0;
    this.playerHanded =   mLog.pH || "Right";
    this.opponentId =     mLog.oI || 0;
    this.opponentHanded = mLog.oH || "Right";
    this.serverId =       mLog.sI || 0;
    this.format =         mLog.f;
    this.noAd =           mLog.nA || false;
    this.winnerId =       mLog.wI || 0;
    this.buildSetList(mLog.sL);
    this.computeScore(); 
  };

  // return the Match properties
  getMatchLog() : MatchData {
    
    var matchLog: MatchData = {
      userId:     this.userId,
      sortDate:   this.sortDate,
      dV:         this.dataVersion,
      st:         this.status,
      dt:         this.date,
      tm:         this.time,
      du:         this.duration,      //match duration in ms
      tn:         this.tournament,
      l:          this.location,
      e:          this.event,
      r:          this.round,
      pI:         this.playerId,
      pH:         this.playerHanded,
      oI:         this.opponentId,
      oH:         this.opponentHanded,
      sI:         this.serverId,
      f:          this.format,
      nA:         this.noAd,
      wI:         this.winnerId,
      sc:         this.score,
      cG:         this.currGame,
      sL:         this.buildSetLog()
    }
    return matchLog;
  };

  //make sure the match object is ready for a point to be added
  readyForPoint() : void {
    if(!this.winnerId){
      this.checkCurrentSet();            //make sure set is ready
      this.sets[this.sets.length-1].readyForPoint(); //make sure game is ready
    }
  }

  //see if we need to adjust the set list of this match
  //return whether the last set changed
  checkCurrentSet() : boolean {
    var setChange = false;
    var ns = this.sets.length-1;        //current number of sets-1

    this.computeScore();
    if(this.sets[ns].winnerId){     //current set is over 
      if(!this.winnerId){           //but not match?
        this.addNewSet();           //add another set
        setChange = true;
      }
    }
    else{
      if(ns > 0 && !this.sets[ns-1].winnerId){    //penultimate set has no winner either?
          setChange = this.removeLooseEnds();     //remove dangling empty set
      }
    }
    return setChange;
  }

  //return the formatted current score for this match at the given position
  //return score after last point in match if no position specified
  getFormattedScore(position: MatchPosition) : string {
    var i;
    var msg = "";
    var sId : number;
    var pos : MatchPosition = <MatchPosition>{};
    var setIndex = (position.set !== undefined) ? position.set-1 : this.sets.length-1;

    if(this.sets[setIndex].type !== TIEBREAK_SET_TYPE){
      pos.game = position.game !== undefined ? position.game :  this.sets[setIndex].games.length-1;
    }
    pos.point = position.point;
    sId = this.sets[setIndex].getServerId(pos);      //get the proper serverId
    pos.game = pos.point = undefined;
    for(i=0; i<setIndex; i++){
      msg += this.sets[i].getFormattedScore(pos, sId); //get scores of earlier sets
    }
    msg += this.sets[setIndex].getFormattedScore(position, sId);
    return msg;
  }

  //remove final set/game of match if not valid
  removeLooseEnds() : boolean {
    var nS = this.sets.length;
    var setRemoved = false;

    this.sets[nS-1].removeLooseEnds();
    if(this.sets[nS-1].isEmpty()){
      this.sets.pop()
      if(this.score.length == nS){ this.score.pop();} //remove score for empty final set
      this.serverId = this.sets[nS-2].serverId;
      this.currGame = undefined;       
      setRemoved = true; 
    }
    return setRemoved;
  }

  //Add a new point to this match
  addNewPoint(newPoint: Point) : void {

    if(!this.winnerId){   //do nothing if match is over
      if(this.sets === undefined || !this.sets.length){
        this.buildSetList(); //add a 1st set
      }
      this.sets[this.sets.length-1].addNewPoint(newPoint);
      if(this.checkCurrentSet()){
          this.computeScore();  //recompute score if new set added
      }
    }
  }

  //add a set of the given type to this match
  addNewSet() : void {
    var setLog: SetData = <SetData> {};
    var setsLen = this.sets.length;
    var lastSet = this.sets[setsLen-1];

    switch(this.format){ //first, decide what type of set to add
      case ONE_EIGHT_SET_MATCH_FORMAT:
        setLog.t = EIGHT_GAME_SET_TYPE;
        break;
      case ONE_SIX_SET_MATCH_FORMAT:
      case TWO_OF_THREE_MATCH_FORMAT:
        setLog.t = SIX_GAME_SET_TYPE;
        break;
      case TWO_PLUS_TIEBREAK_MATCH_FORMAT:
        if(setsLen < 2){
          setLog.t = SIX_GAME_SET_TYPE;
        } else{
          setLog.t = TIEBREAK_SET_TYPE;
        }
        break;
      case ONE_TIEBREAK_MATCH_FORMAT:
        setLog.t = TIEBREAK_SET_TYPE;
        break;
      default:
    }
    if(!setsLen){ // now figure out who serves first in the new set
      setLog.sI = this.serverId;
    } else{
      //use server id from first point of last game in case of tiebreak at end of last set
      setLog.sI = lastSet.games[lastSet.games.length-1].points[0].serverId == PLAYER_ID
                                                                  ? OPPONENT_ID : PLAYER_ID;
      this.serverId = setLog.sI;
    }
    setLog.nA = this.noAd;
    this.sets.push(TSet.build(setLog));
  }

  //insert a given point into the match at the given set,game,point position
  insertPoint(newPoint: Point, setNum: number, gameNum: number, pointNum: number) : void {
    var s : TSet = this.sets[setNum-1];

    s.insertOrDeletePoint(gameNum, pointNum, newPoint)
    s.checkNeedNewGame();
    this.checkCurrentSet();
  }

  //remove the point at the given set,game,point position from the match
  deletePoint(setNum: number, gameNum: number, pointNum: number) : void {
    var s : TSet = this.sets[setNum-1];

    s.insertOrDeletePoint(gameNum, pointNum);
    s.checkNeedNewGame();
    this.checkCurrentSet();
  }

  //replace a given point in the match at the given set,game,point position
  replacePoint(newPoint: any, setNum: number, gameNum: number, pointNum: number) : void {
    var s = this.sets[setNum-1];

    s.replacePoint(newPoint, gameNum, pointNum);
    s.checkNeedNewGame();
    this.checkCurrentSet();
  }

  //change the specified point's position in its point list
  movePoint(offset: number, setNum: number, gameNum: number, pointNum: number) : void {
    return this.sets[setNum-1].movePoint(offset, gameNum, pointNum);
  }

  //build an array of TSet objects from an array of set logs (JSON)
  buildSetList(setLogList?: any[]) : void {
    if(this.sets === undefined || !this.sets.length){
      if(this.sets === undefined){
        this.sets = [];
      }
      if(setLogList){
        for(var i=0; i<setLogList.length; i++) {
          this.sets.push(TSet.build(setLogList[i]));
        };
      }
      else{  //add a starting set for the match
        this.addNewSet();
      }
    }
  }
    
  //build an array of TSet logs (JSON) from an array of TSet objects
  buildSetLog() : any[] {
    var setLogList: any[] = [];

    for(var i=0; i<this.sets.length; i++) {
      setLogList.push(this.sets[i].getSetLog());
    };
    return setLogList;
  }

  //return the current player score for the current set of this match
  currentScore(choice: number) : number | string {
      return this.sets[this.sets.length-1].currentPlayerScore(choice);
  }

    
  // compute the current score for the Match at the given position
  // compute score after last point if no position specified
  computeScore(position?: MatchPosition) : void {
    var pScore = 0;
    var oScore = 0;
    var currSet;
    var numSets = position ? position.set : this.sets.length;

    this.score = [[0,0]];
    this.currGame = undefined;
    this.winnerId = 0;
    this.matchPoint = undefined;

    for(var i = 0; (i < numSets) && !this.winnerId; i++) {
      currSet = this.sets[i];
      if(i == numSets-1){
        currSet.computeScore(position);
      } else{
          currSet.computeScore();
      }
      this.score[i] = [currSet.playerScore, currSet.opponentScore]; 
      if( currSet.winnerId == PLAYER_ID ){ pScore++; } 
      if( currSet.winnerId == OPPONENT_ID ) { oScore++; } 
      if( currSet.winnerId == 0 ){
        this.currGame = currSet.currentGameScore();
        this.serverId = currSet.serverId;
      }
      //now check for match over
      switch(this.format){
        case TWO_OF_THREE_MATCH_FORMAT:
        case TWO_PLUS_TIEBREAK_MATCH_FORMAT:
            if(pScore == 2){ this.winnerId = this.playerId;}
            if(oScore == 2){ this.winnerId = this.opponentId;}
            if(pScore == 1 && currSet.setPoint && currSet.setPointFor == PLAYER_ID){
              this.matchPoint = true;}
            if(oScore == 1 && currSet.setPoint && currSet.setPointFor == OPPONENT_ID){
              this.matchPoint = true;}
          break;
        case ONE_SIX_SET_MATCH_FORMAT:
        case ONE_EIGHT_SET_MATCH_FORMAT:
        case ONE_TIEBREAK_MATCH_FORMAT:
            if(pScore == 1){ this.winnerId = this.playerId;}
            if(oScore == 1){ this.winnerId = this.opponentId;}
            if(pScore == 0 && currSet.setPoint && currSet.setPointFor == PLAYER_ID){
              this.matchPoint = true;}
            if(oScore == 0 && currSet.setPoint && currSet.setPointFor == OPPONENT_ID){
              this.matchPoint = true;}
          break;
      }
    }
  }
  
  // compute statistics for the match and return a result object
  computeStats(statsIn?: any) : any {
    var statsOut = statsIn;

    for(var i = 0; i < this.sets.length; i++){
      statsOut = this.sets[i].computeStats(statsOut);
    };
    if(statsOut === undefined){
      statsOut = {};
    }
    statsOut.playerId = this.playerId;
    statsOut.opponentId = this.opponentId;
    statsOut.serverId = this.serverId;
    statsOut.winnerId = this.winnerId;

    return statsOut;
  }
}
