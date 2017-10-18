import { Game, REGULAR_GAME_TYPE, TIEBREAK_GAME_TYPE } from './game';
import { Point } from './point';
import { MatchPosition } from './match'
import { PLAYER_ID, OPPONENT_ID } from '../constants'

// CONSTANT values used by the TSet class
export const SET_TYPES =           ["Six Game","Eight Game","Tiebreak"];
export const SET_LENGTHS =         [6,8,10];
export const DEFAULT_SET_TYPE =    0;
export const SIX_GAME_SET_TYPE =   0;
export const EIGHT_GAME_SET_TYPE = 1;
export const TIEBREAK_SET_TYPE =   2;  

// this is the record stored for a Set in the database
export interface SetData{
  t   : number;
  nA  : boolean;
  sI  : number;
  wI  : number;
  pS  : number;
  oS  : number;
  pGS : string;
  oGS : string;
  gL? : Game[];
  pL? : Point[];
}

export class TSet {

  type:              number;
  noAd:              boolean;
  serverId:          number;
  winnerId:          number;
  playerScore:       number;
  opponentScore:     number;
  playerGameScore:   string;
  opponentGameScore: string;
  gamePoint:         boolean;
  breakPoint:        boolean;
  setPoint:          boolean;
  setPointFor:       number;
  games:             Game[];
  points:            Point[];

  //define TSet constructor
  constructor(setLog: SetData) {
    this.setSetProperties(setLog);
  }


  //static method to validate the data and call the constructor
  static build(setLog: SetData) : TSet {
    return new TSet(setLog);
  }

  // set the properties from the given SetData object
  setSetProperties(setLog: SetData): void {
    this.type =               setLog.t || DEFAULT_SET_TYPE;
    this.noAd =               setLog.nA || false;
    this.serverId =           setLog.sI || 0;
    this.winnerId =           setLog.wI || 0;
    this.playerScore =        setLog.pS || 0;
    this.opponentScore =      setLog.oS || 0;
    this.playerGameScore =    setLog.pGS || "0";
    this.opponentGameScore =  setLog.oGS || "0";
    if(this.type != TIEBREAK_SET_TYPE){
      this.buildGameList(setLog.gL);
    } else{
      this.buildPointList(setLog.pL);
    }
  }

  // return the properties of the TSet
  getSetLog(): SetData {
    var setLog: SetData = {
      t:   this.type,
      nA:  this.noAd,
      sI:  this.serverId,
      wI:  this.winnerId,
      pS:  this.playerScore,
      oS:  this.opponentScore,
      pGS: this.playerGameScore,
      oGS: this.opponentGameScore,
      gL:  undefined,
      pL:  undefined
    }
    if(this.type != TIEBREAK_SET_TYPE){
      setLog.gL = this.buildGameLog();
    } else{
      setLog.pL = this.buildPointLog();
    }
    return setLog;
  }

  //add a new point to this set
  addNewPoint(newPoint: any): void {
    var lastGame;

    switch(this.type){
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        if(this.games === undefined){
            this.buildGameList(); //add a 1st game
        }
        if(!this.games.length || this.games[this.games.length-1].winnerId){this.addNewGame();}
        lastGame = this.games.length-1
        this.games[lastGame].addNewPoint(newPoint);
        this.serverId = this.games[lastGame].serverId; //in case of a tibreak game
        this.checkNeedNewGame();
        break;
      case TIEBREAK_SET_TYPE:
        if(this.points === undefined){
          this.points = [];
        }
        this.points.push(newPoint);
        if(this.points.length % 2 == 1){ //odd number of points played, change serverId
          this.serverId = this.serverId == PLAYER_ID ? OPPONENT_ID : PLAYER_ID;
        }
        this.computeScore();
        break;
    }
  }

  //add and remove the last point of this game
  cycleLastPoint(): void{
    var lastPoint;

    if((this.type == TIEBREAK_SET_TYPE) &&  this.points.length){
      lastPoint = this.points.pop();      //remove last point
      this.addNewPoint(lastPoint);        //re-add last point
    }
  }

  //delete the specified point from this set
  insertOrDeletePoint(gameNum: number, pointNum: number, newPoint?: Point) : void {

    switch(this.type){
      case TIEBREAK_SET_TYPE:
        if(newPoint){
          this.points.splice(pointNum-1,0,newPoint);  //insert
        } else {
          this.points.splice(pointNum-1,1);           //delete
        }
        this.cycleLastPoint();
        break;
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        this.games[gameNum-1].insertOrDeletePoint(pointNum, newPoint);
        this.games[gameNum-1].cycleLastPoint();
        break;
    }
  }

  //change the specified point's position in its point list
  //return success or failure
  movePoint(offset: number, gameNum: number, pointNum: number): boolean {
    var list, lastPoint;
    var moved = false;

    switch(this.type){
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        list = this.games[gameNum-1].points;
        break;
      case TIEBREAK_SET_TYPE:
        list = this.points;
        break;
    }
    if((pointNum + offset > 0) && (pointNum + offset <= list.length)){ //can we make the move?
      var p = list[pointNum-1];
      list[pointNum-1] = 
      list[pointNum-1+offset];
      list[pointNum-1+offset] = p;
      moved = true;
      if( this.type != TIEBREAK_SET_TYPE){
        this.games[gameNum-1].cycleLastPoint();
      }
    }
    return moved;
  }

  //replace a given point in the set at the given game and point position
  replacePoint(newPoint: Point, gameNum: number, pointNum: number): void {
    var lastPoint;

    switch(this.type){
      case TIEBREAK_SET_TYPE:
        this.points[pointNum-1] = newPoint;
        this.cycleLastPoint();
        break;
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        this.games[gameNum-1].points[pointNum-1] = newPoint;
        this.games[gameNum-1].cycleLastPoint();
        break;
    }
  }

  //check to see if the set is empty
  //return the length of the point list for this game (or TIBREAK_SET)
  getEndPointNumber(): number {
    if(this.type == TIEBREAK_SET_TYPE){
      return this.points.length;
    }
    if(this.games && this.games.length){
      if(this.games[this.games.length-1].points)
        return this.games[this.games.length-1].points.length;
    }
    return 0;
  }
  
  //return: empty status
  isEmpty(): boolean {

    if(this.type == TIEBREAK_SET_TYPE){
      return (!this.points || !this.points.length);
    }
    return(!this.games || !this.games.length);
  }

  //remove an empty game at the end of the set if present
  removeLooseEnds(): void {
    if((this.type != TIEBREAK_SET_TYPE) && !this.isEmpty()){
      if(!this.games[this.games.length-1].points.length){
        this.games.pop();                    //remove final game if no points
        if(!this.isEmpty()) {this.serverId = this.games[this.games.length-1].serverId;}
      } 
    }
  }

  //make sure the set is ready for a new point. 
  //return true if we add a new game to receive the point
  readyForPoint(): boolean {
    var addedGame = false;
    
    if(!this.isEmpty() && this.games[this.games.length-1].winnerId && !this.winnerId){ //current game is over but not the set?
        this.addNewGame(); //add another game
        addedGame = true;
    }
    return addedGame;
  }

  //see if we need to add a new game to this set
  //return true if new game added
  checkNeedNewGame(): boolean  {
    var addedGame = false;

    switch(this.type){
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        this.removeLooseEnds();
        this.computeScore(); //computeScore will denote whether this point ends the game
        addedGame = this.readyForPoint();
        break;
    }
    return addedGame;
  }

  //add a game to this match
  addNewGame(): void {
    var gameLog: any = {};
    var tiebreakAt = this.type == EIGHT_GAME_SET_TYPE ? 8 : 6;
    var last = this.games.length;

    if(!last){ // figure out who serves this game
      gameLog.sI = this.serverId; //this is the 1st game of the set
    } else{
      var g = this.games[--last]; //set to player that didn't serve last game
      gameLog.sI = (g.serverId == PLAYER_ID) ? OPPONENT_ID : PLAYER_ID;
      this.serverId = gameLog.sI; //propogate serverId back up
    }
    if(this.playerScore != this.opponentScore || this.playerScore != tiebreakAt){
      gameLog.t = REGULAR_GAME_TYPE; //still in regular games
    } else{
      gameLog.t = TIEBREAK_GAME_TYPE; //time for a tiebreak
    }
    gameLog.nA = this.noAd;
    this.games.push(Game.build(gameLog));
  }

  //this is a REGULAR set of games, build an array of game objects from an array of game logs
  buildGameList(gameLogList?: any): void {

    if(this.games === undefined || !this.games.length){
      if(this.games === undefined){
        this.games = [];  //add a games array
      }
      if(gameLogList){
        for(var i=0; i<gameLogList.length; i++) {
          this.games.push(Game.build(gameLogList[i]));
        };
      }
      else{  //add a starting game for the set
        this.addNewGame();
      }
    }
  }

  //this is a TIEBREAK set, build an array of point objects from an array of point logs
  buildPointList(pointLogList: any[]): void {
    if(this.points === undefined || !this.points.length){
      if(this.points === undefined) {
        this.points = [];
      }
      if(pointLogList){
        for(var i=0; i<pointLogList.length; i++) {
          this.points.push(Point.build(pointLogList[i]));
        };
      }
    }
  }

  //this is a REGULAR set, build an array of Game logs from an array of Game objects
  buildGameLog(): any[] {
    var gameLogList: any[] = [];

    for(var i=0; i<this.games.length; i++) {
      gameLogList.push(this.games[i].getGameLog());
    };
    return gameLogList;
  }
    

  //this set is TIBREAK type, build an array of Point logs from an array of Point objects
  buildPointLog(): any[] {
    var pointLogList: any[] = [];

    for(var i=0; i<this.points.length; i++) {
      pointLogList.push(this.points[i].getPointLog());
    };
    return pointLogList;
  }

  //return the current game score for this set if applicable
  currentGameScore(): string[] {

    switch(this.type){
      case TIEBREAK_SET_TYPE:
        return undefined;
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        return  [this.playerGameScore, this.opponentGameScore];
    }
  }

  getServerId(setPosition: MatchPosition): number {
    var sId : number;

    switch(this.type){
      case TIEBREAK_SET_TYPE:
        sId = setPosition.point !== undefined ? this.points[setPosition.point].serverId : this.serverId;
        break;
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        //if no point index given, get the serverId from the game after the one specified in setPosition
        sId = this.games[(setPosition.point == undefined) ? setPosition.game : setPosition.game-1]
                          .getServerId(setPosition.point);
        break;
    }
    return sId;
  }

  //return the formatted current score for this set at the given position (game number and point index)
  getFormattedScore(setPosition: MatchPosition, sId?: number): string {
    var msg: string = "";

    this.computeScore(setPosition);
    if(sId === undefined){
      sId = this.getServerId(setPosition);
    }
    switch(this.type){
      case TIEBREAK_SET_TYPE:
        msg = ((sId == PLAYER_ID) ? this.playerScore : this.opponentScore) + "-" + 
              ((sId == PLAYER_ID) ? this.opponentScore : this.playerScore);
        break;
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        msg = "(" + ((sId == PLAYER_ID) ? this.playerScore : this.opponentScore) + "," + 
                    ((sId == PLAYER_ID) ? this.opponentScore : this.playerScore) + ")";
        if(setPosition.point != undefined){
          msg += " " + ((sId == PLAYER_ID) ? this.playerGameScore : this.opponentGameScore) + "-" + 
                      ((sId == PLAYER_ID) ? this.opponentGameScore : this.playerGameScore)
        }
        break;
    }
    return msg;
  }

  //return the current game score for this set if applicable
  currentPlayerScore(choice: number): number | string {

    switch(this.type){
      case TIEBREAK_SET_TYPE:
        return (choice == PLAYER_ID ? this.playerScore : this.opponentScore);
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        return (choice == PLAYER_ID ? this.playerGameScore : this.opponentGameScore);
    }
  }

  //compute the current score for this set
  computeScore(position?: MatchPosition): void {
    this.playerScore = 0;
    this.opponentScore = 0;
    this.playerGameScore = "0";
    this.opponentGameScore = "0";
    this.setPoint = undefined;
    this.winnerId = 0;

    switch(this.type) {
      case SIX_GAME_SET_TYPE:
      case EIGHT_GAME_SET_TYPE:
        var numGames =(position && (position.game != undefined)) ? position.game : this.games.length;
        for(var i=0; (i<numGames) && !this.winnerId; i++) {
          if(i == numGames-1){
            this.games[i].computeScore(position);
          } else{
              this.games[i].computeScore();
          }
          if(this.games[i].winnerId){
            if( this.games[i].winnerId == PLAYER_ID){
              this.playerScore++;
            }
            else {
              this.opponentScore++;
            }
            //check to see if set is over
            if(this.playerScore >= SET_LENGTHS[this.type]){
              if((this.playerScore > this.opponentScore+1) ||
                  ((this.playerScore > this.opponentScore) && (this.opponentScore == SET_LENGTHS[this.type]))){
                this.winnerId = PLAYER_ID;
              }
            }
            if(this.opponentScore >= SET_LENGTHS[this.type]){
              if((this.opponentScore > this.playerScore+1) ||
                  ((this.opponentScore > this.playerScore) && (this.playerScore == SET_LENGTHS[this.type]))){
                this.winnerId = OPPONENT_ID;
              }
            }
          }
          else {
            var g = this.games[i];
            this.playerGameScore = <string> g.playerScore;
            this.opponentGameScore = <string> g.opponentScore;
            this.breakPoint = g.breakPoint;
            this.gamePoint = g.gamePoint;
            if(this.gamePoint){
              if(this.serverId == PLAYER_ID){
                if((this.playerScore >= SET_LENGTHS[this.type]-1 &&
                  this.playerScore > this.opponentScore) ||
                  (this.playerScore == SET_LENGTHS[this.type] && //in a tiebreak?
                  this.playerScore == this.opponentScore)){
                  this.setPoint = true;
                  this.setPointFor = PLAYER_ID;
                } 
              }
              else {
                if((this.opponentScore >= SET_LENGTHS[this.type]-1 &&
                  this.opponentScore > this.playerScore) ||
                  (this.opponentScore == SET_LENGTHS[this.type] &&
                  this.playerScore == this.opponentScore)){
                  this.setPoint = true;
                  this.setPointFor = OPPONENT_ID;
                } 
              }
            }
            if(this.breakPoint){
              if(this.serverId != PLAYER_ID){
                if((this.playerScore >= SET_LENGTHS[this.type]-1 &&
                  this.playerScore > this.opponentScore) ||
                  (this.playerScore == SET_LENGTHS[this.type] &&
                  this.playerScore == this.opponentScore)){
                  this.setPoint = true;
                  this.setPointFor = PLAYER_ID;
                } 
              }
              else {
                if((this.opponentScore >= SET_LENGTHS[this.type]-1 &&
                  this.opponentScore > this.playerScore) ||
                  (this.opponentScore == SET_LENGTHS[this.type] &&
                  this.playerScore == this.opponentScore)){
                  this.setPoint = true;
                  this.setPointFor = OPPONENT_ID;
                } 
              }
            }
          }
        }
        break;
      case TIEBREAK_SET_TYPE:
        var numPoints = (position && (position.point != undefined)) ? position.point : this.points.length;
        for(var i=0; i<numPoints && !this.winnerId; i++) {
          if( this.points[i].winnerId == PLAYER_ID){
            this.playerScore++;}
          else {
            this.opponentScore++;}
          //check to see if set is over
          if(this.playerScore >= SET_LENGTHS[this.type] && this.playerScore > this.opponentScore+1){
              this.winnerId = PLAYER_ID;
          }
          else {
            if(this.playerScore >= SET_LENGTHS[this.type]-1 && this.playerScore > this.opponentScore){
              this.setPoint = true;
              this.setPointFor = PLAYER_ID;
            }
          }
          if(this.opponentScore >= SET_LENGTHS[this.type] && this.opponentScore > this.playerScore+1){
              this.winnerId = OPPONENT_ID;
          }
          else {
            if(this.opponentScore >= SET_LENGTHS[this.type]-1 && this.opponentScore > this.playerScore){
              this.setPoint = true;
              this.setPointFor = OPPONENT_ID;
            }
          }
        }
        break;
    }
  }
    
  // compute statistics for the set and return a result object
  computeStats(statsIn?: any): any {
    var statsOut = statsIn;

    switch(this.type){
      case TIEBREAK_SET_TYPE:
        var g : Game;
        var gLog = { //use a game object to tally stats on the tibreak points
          wI: 0,
          sI: 0,
          t: this.type,
          nA: this.noAd
        };
        g = Game.build(gLog);
        g.points = this.points,
        statsOut = g.computeStats(statsOut);
        break;
      default:
        for(var i = 0; i < this.games.length; i++){
          statsOut = this.games[i].computeStats(statsOut);
        };
        break;
    }
        statsOut.winnerId = this.winnerId;

    return statsOut;
  }
}
