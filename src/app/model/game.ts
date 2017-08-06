import { Point, PointData, WINNER_POINT_ENDING, FORCED_ERROR_POINT_ENDING, UNFORCED_ERROR_POINT_ENDING,
UNFORCED_ERROR_DETAIL_EXECUTION, UNFORCED_ERROR_DETAIL_POSITION, UNFORCED_ERROR_DETAIL_SELECTION,
ACE_POINT_ENDING, DOUBLE_FAULT_POINT_ENDING } from './point';
import { PLAYER_ID, OPPONENT_ID } from '../constants'
import { MatchPosition } from './match'

//this is the record stored for a Game in the database
export interface GameData{
  t:   number;              //game type
  nA:  boolean;             //no-ad scoring used
  pS?:  string | number;     //player's score
  oS?:  string | number;     //opponent's score
  wI?:  number;              //winner Id (PLAYER_ID or OPPONENT_ID)
  sI?:  number;              //server Id (PLAYER_ID or OPPONENT_ID)
  pL?:  any[];               //point list
}

// CONSTANT values used by the Game class
export const GAME_TYPES = ["Regular","Tiebreak"];
export const DEFAULT_GAME_TYPE = 0;
export const REGULAR_GAME_TYPE = 0;
export const TIEBREAK_GAME_TYPE = 1;


export class Game {

  //static method to validate the data and call the constructor
  static build(gameLog: GameData) : Game {
    return new Game(gameLog);
  }


  //define Game constructor
  constructor(gameLog: GameData) {
    this.setGameProperties(gameLog);
  };

  // Game properties
  type:              number;
  noAd:              boolean;
  playerScore:       string | number;
  opponentScore:     string | number;
  winnerId:          number;
  serverId:          number;
  playerServed:      boolean;
  playerWon:         boolean;
  opponentServed:    boolean;
  opponentWon:       boolean;
  points:            any[];
  gamePoint:         boolean;
  breakPoint:        boolean;

  //set the game object properties from the given JSON object
  setGameProperties(gLog: GameData) : void {
    this.type =           gLog.t  || DEFAULT_GAME_TYPE;
    this.noAd =           gLog.nA || false;
    this.playerScore =    gLog.pS || "0";
    this.opponentScore =  gLog.oS || "0";
    this.winnerId =       gLog.wI || 0;
    this.serverId =       gLog.sI || 0;
    this.playerServed =   this.serverId == PLAYER_ID;
    this.playerWon =      this.winnerId == PLAYER_ID;
    this.opponentServed = this.serverId == OPPONENT_ID;
    this.opponentWon =    this.winnerId == OPPONENT_ID;
    this.buildPointList(gLog.pL);
  };

  //add a new point to this game
  addNewPoint(newPoint: Point) : void {
    this.points.push(newPoint);
    if(this.type == TIEBREAK_GAME_TYPE){
      if(this.points.length % 2 == 1){ //odd number of points played, change serverId
        this.serverId = this.serverId == PLAYER_ID ? OPPONENT_ID : PLAYER_ID;
      }
    }
    this.computeScore();  //computeScore will denote whether this point ends the game
  }

  //insert into or delete from the point list of this game
  insertOrDeletePoint(pointNum : number, newPoint : Point) : void {

    if(newPoint){
      this.points.splice(pointNum-1,0,newPoint); //insert
    } else {
      this.points.splice(pointNum-1,1);          //delete
    }
  }

  //add and remove the last point of this game
  cycleLastPoint(): void {
    var lastPoint;

    if(this.points.length){
      lastPoint = this.points.pop();      //remove last point
      this.addNewPoint(lastPoint);        //re-add last point
    }
  }


  // return the Game properties
  getGameLog() : GameData {
    var gameLog: GameData = {
      t:  this.type,
      nA: this.noAd,
      pS: this.playerScore,
      oS: this.opponentScore,
      wI: this.winnerId,
      sI: this.serverId,
      pL: this.buildPointLog()
    };
    return gameLog;
  }
    
  //build an array of Point objects from an array of Point logs (JSON)
  buildPointList(pointLogList: PointData[]): void {
    if(this.points === undefined || !this.points.length){
      if(this.points === undefined){
        this.points = [];
      }
      if(pointLogList){
        for(var i=0; i<pointLogList.length; i++) {
          this.points.push(Point.build(pointLogList[i]));
        };
      };
    };
  }

  //build an array of point logs (JSON) from an array of Point objects
  buildPointLog(): PointData[] {
    var pointLogList: any[] = [];

    for(var i=0; i<this.points.length; i++) {
      pointLogList.push(this.points[i].getPointLog());
    };
    return pointLogList;
  }

  // return the serverId for the requested point
  getServerId(pointIndex: number): number{

    if(pointIndex != undefined){ // use value from point if specified (TIEBREAK case)
      return this.points[pointIndex].serverId;
    }
    return this.serverId;     //use value for game
  }

  // analyze the point list to compute the score of the game
  computeScore(position?: MatchPosition): void {
    var numPoints = (position && (position.point != undefined)) ? position.point : this.points.length;
    var pScore = 0;
    var oScore = 0;
    var ad = (this.noAd && (this.type == REGULAR_GAME_TYPE)) ? 0 : 1;
    var gamePtAt = this.type == REGULAR_GAME_TYPE ? 3 : 6
    var scores = ["0","15","30","40","AD","G"];
    var self = this;

    // check if the current score combination represents a game point/break point situation
    function isGamePoint(): number {
      //return 1 for gamePt, 2 for breakPt and 0 if neither
      if((pScore >= gamePtAt) && (pScore > oScore)){
        return self.serverId == PLAYER_ID ? 1 : 2;
      }
      if((oScore >= gamePtAt) && (oScore > pScore)){
        return self.serverId == OPPONENT_ID ? 1 : 2;
      }
      return 0;
    }

    function checkForGameOver(): void {
      //now see if the game is over
      //if over, determine the winner and the score at the final game point
      switch(self.type){
        case REGULAR_GAME_TYPE:
          if( ((pScore > gamePtAt) && (pScore > oScore+ad)) || 
              ((oScore > gamePtAt) && (oScore > pScore+ad)) ) {  //game over
            if(pScore > oScore) {  
              self.winnerId = PLAYER_ID;
              self.playerWon = true;
              self.playerScore = scores[5];
              oScore = oScore > 3 ? 3 : oScore;
              self.opponentScore  = scores[oScore];
            }
            else {
              self.winnerId = OPPONENT_ID;
              self.opponentWon = true;
              self.opponentScore = scores[5];
              pScore = pScore > 3 ? 3 : pScore;
              self.playerScore = scores[pScore];
            }
          }
          else { //game not over
            if(pScore <= gamePtAt){
              self.playerScore = scores[pScore];
              if(oScore <= gamePtAt){
                self.opponentScore = scores[oScore]; //game not over, deuce or less
              }
              else {
                self.opponentScore = scores[4];  //gamePt OPPONENT
              }
            }
            else {  
              if(pScore == oScore){
                self.playerScore = scores[3];    //deuce 
                self.opponentScore = scores[3];
              }
              else { //score must game point after being tied at gamePtAt
                if(pScore > oScore){
                  self.playerScore = scores[4]; //gamePt PLAYER
                  self.opponentScore = scores[3];
                }
                else {
                  self.playerScore = scores[3];
                  self.opponentScore = scores[4]; //gamePt OPPONENT
                }
              }
            }
          }
          break;
        case TIEBREAK_GAME_TYPE:
          self.playerScore = pScore;
          self.opponentScore  = oScore;
          if( ((pScore > gamePtAt) && (pScore > oScore+ad)) || ((oScore > gamePtAt) && (oScore > pScore+ad)) ) {
            if(pScore > oScore) {  //game over
              self.winnerId = PLAYER_ID;
              self.playerWon = true;
            }
            else {
              self.winnerId = OPPONENT_ID;
              self.opponentWon = true;
            }
          }
          break;
      }
      self.gamePoint = self.breakPoint = false;
      switch(isGamePoint()){
        case 1: //game pt
          self.gamePoint = true;
          break;
        case 2: //break pt
          self.breakPoint = true;
          break;
      }
    }        

    this.winnerId =       0;
    this.playerScore =    this.opponentScore = scores[0];
    this.opponentWon =    this.playerWon = false;
    this.gamePoint =      this.breakPoint = undefined;

    //first, count all the points for each player
    for(var i=0; (i<numPoints) && !this.winnerId; i++) {
      if(this.points[i].winnerId == PLAYER_ID){ pScore++;}
      if(this.points[i].winnerId == OPPONENT_ID){ oScore++;}
      this.points[i].playerScore =    this.playerScore;
      this.points[i].opponentScore =  this.opponentScore;
      this.points[i].gamePoint =      this.gamePoint;
      this.points[i].breakPoint =     this.breakPoint;
      checkForGameOver();
    }
  }


  // compute statistics for the game and return a result object
  computeStats(statsIn?: any): any {
    var self = this;
    var statsOut = statsIn ||  {      //define the stats object
      winnerId:       this.winnerId,
      serverId:       this.serverId,
      type:           this.type,
      fsIn:           [0,0],          //# 1st serves in
      fsInRatio:      [[0,0],[0,0]],  //# 1st serves in vs service pts
      fhFsIn:         [0,0],          //# 1st serves in to FH
      bhFsIn:         [0,0],          //# 1st serves in to BH
      fsPct:          [0,0],          //% 1st serves in
      fsWon:          [0,0],          //# 1st serve pts won
      fsWonRatio:     [[0,0],[0,0]],  //# 1st serves won vs 1st serves in
      fsPctWon:       [0,0],          //% 1st serve pts won

      sServes:        [0,0],          //# 2nd serves hit
      ssIn:           [0,0],          //# 2nd serves in
      ssInRatio:      [[0,0],[0,0]],  //# 2nd serves in vs 2nd serves
      fhSsIn:         [0,0],          //# 2nd serves in to FH
      bhSsIn:         [0,0],          //# 2nd serves in to BH
      ssPct:          [0,0],          //% 2nd serves in
      ssWon:          [0,0],          //# 2nd serve pts won
      ssWonRatio:     [[0,0],[0,0]],  //# 2nd serves won vs 2nd serves in
      ssPctWon:       [0,0],          //% 2nd serve pts won

      aces:           [0, 0],         //# aces
      dblFaults:      [0,0],          //# double faults
      revDblFaults:   [0,0],          //# double faults reversed
      pServed:        [0,0],          //# pts serving
      spWon:          [0,0],          //# service pts won
      spWonRatio:     [[0,0],[0,0]],  //# service points won vs service points
      fhSpWonRatio:   [[0,0],[0,0]],  //# serves to FH pt won
      bhSpWonRatio:   [[0,0],[0,0]],  // serves to BH pt won
      spWonPct:       [0,0],          //% all service pts won
      fReturns:       [0,0],          //# 1st serve returns hit
      frIn:           [0,0],          //# 1st serve returns in
      frInRatio:      [[0,0],[0,0]],  //# 1st serve returns in vs hit
      fhFrInRatio:    [[0,0],[0,0]],  //# forehand 1st returns in and attempted
      bhFrInRatio:    [[0,0],[0,0]],  //# backhand 1st returns in and attempted
      frPct:          [0,0],          //% 1st serve returns in
      frWon:          [0,0],          //# 1st serve returns in and pt won
      frWonRatio:     [[0,0],[0,0]],  //# 1st serve returns won vs 1st serve returns in
      frPctWon:       [0,0],          //% 1st serve returns in and pt won
      sReturns:       [0,0],          //# 2nd serve returns hit
      srIn:           [0,0],          //# 2nd serve returns in
      srInRatio:      [[0,0],[0,0]],  //# 2nd serve returns in vs hit
      fhSrInRatio:    [[0,0],[0,0]],  //# forehand 2nd returns in and attempted
      bhSrInRatio:    [[0,0],[0,0]],  //# backhand 2nd returns in and attempted
      srPct:          [0,0],          //% 2nd serve returns in
      srWon:          [0,0],          //# 2nd serve return in and pt won
      srWonRatio:     [[0,0],[0,0]],  //# 2nd serve returns won vs 2nd serve returns in
      srPctWon:       [0,0],          //% 2nd serve return in and pt won
      fhRpWonRatio:   [[0,0],[0,0]],  //# forehand returns won and attempted
      bhRpWonRatio:   [[0,0],[0,0]],  //# backhand returns won and attempted
      retPct:         [0,0],          //% all hit returns in
      pReturned:      [0,0],          //# pts returning
      rpWon:          [0,0],          //# return pts won
      rpWonRatio:     [[0,0],[0,0]],  //# return points won vs return points
      rpWonPct:       [0,0],          //% all return pts won
      winners:        [0,0],          //# groundstroke winners
      fhWinners:      [0,0],          //# forehand winners
      bhWinners:      [0,0],          //# backhand winners
      errForced:      [0, 0],         //# groundstroke forced errors made (pt winner)
      fhErrForced:    [0,0],          //# errors forced on forehand
      bhErrForced:    [0,0],          //# errors forced on backhand
      unfErrors:      [0,0],          //# groundstroke unforced errors made
      fhUnfErrors:    [0,0],          //# unforced errors on forehand
      bhUnfErrors:    [0,0],          //# unforced errors on backhand
      weRatio:        [[0,0],[0,0]],  //# winner-error ratio (winners+errForced-unfErrors)
      ufeSelection:   [0,0],          //# unforced errors from bad shot selection
      ufePosition:    [0,0],          //# unforced errors from bad positioning
      ufeExecution:   [0,0],          //# unforced errors from bad execution
      gpWon:          [[0,0],[0,0]],  //# game pts won/game points (ratio)
      bpWon:          [[0,0],[0,0]],  //# break pts won/break points
      bigRatio:       [[0,0],[0,0]],  //# big points won/ big points
      aggressionPct:  [0, 0],         //% (winners+forced)/(winners+forced+unforced)
      tPoints:        0,              //# total points in match
      tShots:         0,              //# total shots in rally
      maxShots:       0,              //# max shots in any rally
      avgRally:       [0,0],          //# average rally length
      maxRally:       [0,0],          //# longest rally
      netPoints:      [[0,0],[0,0]],  //# net points won/net points (ratio)
      tpWon:          [0,0]           //# pts won
    };    

    function processPoint(p: Point, index: number) : void {
      var w,l,s,r;              //point winner, loser, server, returner
      statsOut.tPoints++;
      statsOut.tShots += p.shots;                  //add to shot count
      statsOut.maxShots = p.shots > statsOut.maxShots ? p.shots : statsOut.maxShots;  //keep track of longest rally
      if(p.playerAtNet){statsOut.netPoints[0][1]++;}
      if(p.opponentAtNet){statsOut.netPoints[1][1]++;}
      if( p.playerWon ){
        w = 0;
        l = 1;
        if(p.playerAtNet){statsOut.netPoints[0][0]++;}
      }
      else {
        w = 1;
        l = 0;
        if(p.opponentAtNet){statsOut.netPoints[1][0]++;}
      }
      statsOut.tpWon[w]++;              //count point won
      if(p.pointEndedBy == WINNER_POINT_ENDING){
        statsOut.winners[w]++;          //count winner
        if(p.lastShotWing){             //note the wing
          if(p.lastShotWing == "F"){statsOut.fhWinners[w]++;}
          else{statsOut.bhWinners[w]++;}
        }
      }
      if(p.pointEndedBy == FORCED_ERROR_POINT_ENDING){
        statsOut.errForced[w]++;          //count forced
        if(p.lastShotWing){               //note the wing
          if(p.lastShotWing == "F"){statsOut.fhErrForced[w]++;}
          else{statsOut.bhErrForced[w]++;}
        }
      }
      if(p.pointEndedBy == UNFORCED_ERROR_POINT_ENDING){
        statsOut.unfErrors[l]++;          //count unforced on point loser
        if(p.lastShotWing){               //note the wing
          if(p.lastShotWing == "F"){statsOut.fhUnfErrors[l]++;}
          else{statsOut.bhUnfErrors[l]++;}
        }
        if(p.unforcedErrorDetail == UNFORCED_ERROR_DETAIL_SELECTION){
          statsOut.ufeSelection[l]++;
        }
        if(p.unforcedErrorDetail == UNFORCED_ERROR_DETAIL_POSITION){
          statsOut.ufePosition[l]++;
        }
        if(p.unforcedErrorDetail == UNFORCED_ERROR_DETAIL_EXECUTION){
          statsOut.ufeExecution[l]++;
        }
      }
      if(p.playerServed){             //PLAYER serving
        s = 0;
        r = 1;
      }
      else{                           //OPPONENT serving
        s = 1;
        r = 0;
      }
      statsOut.pServed[s]++;        //count point svd
      statsOut.pReturned[r]++;      //count point ret
      if(w == s){
        statsOut.spWon[w]++;        //count point svd won
      }
      else {
        statsOut.rpWon[w]++;     //count point ret won
      }
      if(p.firstServeIn == true){   ///FIRST SERVE
        statsOut.fsIn[s]++;         //count 1st sv in
        if(w == s){
          statsOut.fsWon[w]++;      //count 1st sv won
        }
        statsOut.fReturns[r]++;        //count 1st ret situation
        if(p.returnWing){               //note the return wing
          if(p.returnWing == "F"){
            statsOut.fhFsIn[s]++;
            statsOut.fhFrInRatio[r][1]++;
          }
          else{
            statsOut.bhFsIn[s]++;
            statsOut.bhFrInRatio[r][1]++;
          }
        }
        if(p.pointEndedBy == ACE_POINT_ENDING){
          statsOut.aces[s]++;         //count ace
        } else {
          if(p.returnIn == true){
            statsOut.frIn[r]++;          //count 1st ret in
            if(p.returnWing){
              if(p.returnWing == "F"){statsOut.fhFrInRatio[r][0]++;}
              else{statsOut.bhFrInRatio[r][0]++;}
            }
            if(w == r){
              statsOut.frWon[w]++;      //count 1st ret won
            }
          }
        }
      }
      else {    ///SECOND SERVE
        if(p.pointEndedBy == DOUBLE_FAULT_POINT_ENDING){
          statsOut.dblFaults[s]++;      //count dbl
        }
        else { 
          statsOut.sReturns[r]++;       //count 2nd ret situation
          if(p.returnWing){               //note the return wing
            if(p.returnWing == "F"){
              statsOut.fhSsIn[s]++;
              statsOut.fhSrInRatio[r][1]++;
            }
            else{
              statsOut.bhSsIn[s]++;
              statsOut.bhSrInRatio[r][1]++;
            }
          }
          if(p.pointEndedBy == ACE_POINT_ENDING){
            statsOut.aces[s]++;         //count ace (2nd sv)
          } 
          else {
            if(p.returnIn){
              statsOut.srIn[r]++;         //count 2nd ret in
              if(p.returnWing){
                if(p.returnWing == "F"){statsOut.fhSrInRatio[r][0]++;}
                else{statsOut.bhSrInRatio[r][0]++;}
              }
            }
          }
          if(w == s){
            statsOut.ssWon[w]++;       //count 2nd sv win
          }
          else {
            statsOut.srWon[w]++;      //count 2nd ret win
          }
        }
      }
      if(p.pointEndedBy != DOUBLE_FAULT_POINT_ENDING){
        if(p.returnWing){     //count # of FH/BH returns won vs attempted
          if(p.returnWing == "F"){statsOut.fhRpWonRatio[r][1]++;}
          else{statsOut.bhRpWonRatio[r][1]++;}
          if(w == r){
            if(p.returnWing == "F"){statsOut.fhRpWonRatio[r][0]++;}
            else{statsOut.bhRpWonRatio[r][0]++;}
          }
        }
      }
      if(p.breakPoint){
        statsOut.bpWon[r][1]++;            //count break pt
        if(w == r){
          statsOut.bpWon[r][0]++;          //count bp won
        }
      }
      if(p.gamePoint){
        statsOut.gpWon[s][1]++;            //count game pt
        if(w == s){
          statsOut.gpWon[s][0]++;          //count gp won
        }
      }
    }

    //first, tally the data items from each point
    this.points.forEach(processPoint);

    //set an property that represents the other player's double fault tally
    statsOut.revDblFaults[0] = statsOut.dblFaults[1];
    statsOut.revDblFaults[1] = statsOut.dblFaults[0];

    //compute average rally length
    statsOut.avgRally[0] = statsOut.avgRally[1] = Math.round(statsOut.tShots/statsOut.tPoints +.5);
    if(isNaN(statsOut.avgRally[0])){ statsOut.avgRally[0] = statsOut.avgRally[1] = 0; }

    //tally max rally length
    statsOut.maxRally[0] = statsOut.maxRally[1] = statsOut.maxShots;

    //tally 1st returns in and 1st return points
    statsOut.frInRatio[0][0] = statsOut.frIn[0];
    statsOut.frInRatio[0][1] = statsOut.fReturns[0];
    statsOut.frInRatio[1][0] = statsOut.frIn[1];
    statsOut.frInRatio[1][1] = statsOut.fReturns[1];

    //tally 1st returns won and 1st returns in
    statsOut.frWonRatio[0][0] = statsOut.frWon[0];
    statsOut.frWonRatio[0][1] = statsOut.frIn[0];
    statsOut.frWonRatio[1][0] = statsOut.frWon[1];
    statsOut.frWonRatio[1][1] = statsOut.frIn[1];

    //compute 1st returns in percentage
    statsOut.frPct[0] = Math.round(statsOut.frIn[0] / statsOut.fReturns[0] * 100);
    if(isNaN(statsOut.frPct[0])){ statsOut.frPct[0] = 0; }
    statsOut.frPct[1] = Math.round(statsOut.frIn[1] / statsOut.fReturns[1] * 100);
    if(isNaN(statsOut.frPct[1])){ statsOut.frPct[1] = 0; }

    //compute 1st returns won percentage
    statsOut.frPctWon[0] = Math.round(statsOut.frWon[0] / statsOut.frIn[0] * 100);
    if(isNaN(statsOut.frPctWon[0])){ statsOut.frPctWon[0] = 0; }
    statsOut.frPctWon[1] = Math.round(statsOut.frWon[1] / statsOut.frIn[1] * 100);
    if(isNaN(statsOut.frPctWon[1])){ statsOut.frPctWon[1] = 0; }

    //tally serve returns in and total serve returns
    statsOut.srInRatio[0][0] = statsOut.srIn[0];
    statsOut.srInRatio[0][1] = statsOut.sReturns[0];
    statsOut.srInRatio[1][0] = statsOut.srIn[1];
    statsOut.srInRatio[1][1] = statsOut.sReturns[1];

    //tally serve returns won and serve returns in
    statsOut.srWonRatio[0][0] = statsOut.srWon[0];
    statsOut.srWonRatio[0][1] = statsOut.srIn[0];
    statsOut.srWonRatio[1][0] = statsOut.srWon[1];
    statsOut.srWonRatio[1][1] = statsOut.srIn[1];

    //compute serve return in percentage
    statsOut.srPct[0] = Math.round(statsOut.srIn[0] / statsOut.sReturns[0] * 100);
    if(isNaN(statsOut.srPct[0])){ statsOut.srPct[0] = 0; }
    statsOut.srPct[1] = Math.round(statsOut.srIn[1] / statsOut.sReturns[1] * 100);
    if(isNaN(statsOut.srPct[1])){ statsOut.srPct[1] = 0; }

    //compute serve return won percentage
    statsOut.srPctWon[0] = Math.round(statsOut.srWon[0] / statsOut.srIn[0] * 100);
    if(isNaN(statsOut.srPctWon[0])){ statsOut.srPctWon[0] = 0; }
    statsOut.srPctWon[1] = Math.round(statsOut.srWon[1] / statsOut.srIn[1] * 100);
    if(isNaN(statsOut.srPctWon[1])){ statsOut.srPctWon[1] = 0; }

    //tally winning aggression and total aggression
    statsOut.weRatio[0][0] = statsOut.winners[0] + statsOut.errForced[0] + statsOut.aces[0];
    statsOut.weRatio[0][1] = statsOut.weRatio[0][0] + statsOut.unfErrors[0] + statsOut.dblFaults[0];
    statsOut.weRatio[1][0] = statsOut.winners[1] + statsOut.errForced[1] + statsOut.aces[1];
    statsOut.weRatio[1][1] = statsOut.weRatio[1][0] + statsOut.unfErrors[1] + statsOut.dblFaults[1];

    //compute winning aggression percentage
    statsOut.aggressionPct[0] = Math.round((statsOut.weRatio[0][0]/statsOut.weRatio[0][1])*100);
    statsOut.aggressionPct[1] = Math.round((statsOut.weRatio[1][0]/statsOut.weRatio[1][1])*100);

    //tally big points won and total big points
    statsOut.bigRatio[0][0] = statsOut.bpWon[0][0] + statsOut.gpWon[0][0];
    statsOut.bigRatio[0][1] = statsOut.bpWon[0][1] + statsOut.gpWon[0][1];
    statsOut.bigRatio[1][0] = statsOut.bpWon[1][0] + statsOut.gpWon[1][0];
    statsOut.bigRatio[1][1] = statsOut.bpWon[1][1] + statsOut.gpWon[1][1];

    //tally 1st serves in and total points served
    statsOut.fsInRatio[0][0] = statsOut.fsIn[0];
    statsOut.fsInRatio[0][1] = statsOut.pServed[0];
    statsOut.fsInRatio[1][0] = statsOut.fsIn[1];
    statsOut.fsInRatio[1][1] = statsOut.pServed[1];

    //tally 1st serves won and total first serve points in
    statsOut.fsWonRatio[0][0] = statsOut.fsWon[0];
    statsOut.fsWonRatio[0][1] = statsOut.fsIn[0];
    statsOut.fsWonRatio[1][0] = statsOut.fsWon[1];
    statsOut.fsWonRatio[1][1] = statsOut.fsIn[1];

    //compute 1st serves in percentage
    statsOut.fsPct[0] = Math.round(statsOut.fsIn[0] / statsOut.pServed[0] * 100);
    if(isNaN(statsOut.fsPct[0])){ statsOut.fsPct[0] = 0; }
    statsOut.fsPct[1] = Math.round(statsOut.fsIn[1] / statsOut.pServed[1] * 100);
    if(isNaN(statsOut.fsPct[1])){ statsOut.fsPct[1] = 0; }

    //compute 1st serves won percentage
    statsOut.fsPctWon[0] = Math.round(statsOut.fsWon[0] / statsOut.fsIn[0] * 100);
    if(isNaN(statsOut.fsPctWon[0])){ statsOut.fsPctWon[0] = 0; }
    statsOut.fsPctWon[1] = Math.round(statsOut.fsWon[1] / statsOut.fsIn[1] * 100);
    if(isNaN(statsOut.fsPctWon[1])){ statsOut.fsPctWon[1] = 0; }

    //compute 2nd serves hit and 2nd serves in
    statsOut.sServes[0] = statsOut.pServed[0] - statsOut.fsIn[0]; 
    statsOut.sServes[1] = statsOut.pServed[1] - statsOut.fsIn[1]; 
    statsOut.ssIn[0] = statsOut.sServes[0] - statsOut.dblFaults[0];
    statsOut.ssIn[1] = statsOut.sServes[1] - statsOut.dblFaults[1];

    //tally 2nd serves in and 2nd serves hit
    statsOut.ssInRatio[0][0] = statsOut.ssIn[0];
    statsOut.ssInRatio[0][1] = statsOut.pServed[0]-statsOut.fsIn[0];
    statsOut.ssInRatio[1][0] = statsOut.ssIn[1];
    statsOut.ssInRatio[1][1] = statsOut.pServed[1]-statsOut.fsIn[1];

    //tally 2nd serves won and 2nd serves in
    statsOut.ssWonRatio[0][0] = statsOut.ssWon[0];
    statsOut.ssWonRatio[0][1] = statsOut.ssIn[0];
    statsOut.ssWonRatio[1][0] = statsOut.ssWon[1];
    statsOut.ssWonRatio[1][1] = statsOut.ssIn[1];

    //compute 2nd serves in percentage
    statsOut.ssPct[0] = Math.round(statsOut.ssIn[0] / statsOut.sServes[0] * 100);
    if(isNaN(statsOut.ssPct[0])){ statsOut.ssPct[0] = 0; }
    statsOut.ssPct[1] = Math.round(statsOut.ssIn[1] / statsOut.sServes[1] * 100);
    if(isNaN(statsOut.ssPct[1])){ statsOut.ssPct[1] = 0; }

    //compute 2nd serves won percentage
    statsOut.ssPctWon[0] = Math.round(statsOut.ssWon[0] / (statsOut.pServed[0]-statsOut.fsIn[0]) * 100);
    if(isNaN(statsOut.ssPctWon[0])){ statsOut.ssPctWon[0] = 0; }
    statsOut.ssPctWon[1] = Math.round(statsOut.ssWon[1] / (statsOut.pServed[1]-statsOut.fsIn[1]) * 100);
    if(isNaN(statsOut.ssPctWon[1])){ statsOut.ssPctWon[1] = 0; }

    //compute total serves won percentage
    statsOut.spWonPct[0] = Math.round(statsOut.spWon[0] / statsOut.pServed[0] * 100);
    if(isNaN(statsOut.spWonPct[0])){ statsOut.spWonPct[0] = 0; }
    statsOut.spWonPct[1] = Math.round(statsOut.spWon[1] / statsOut.pServed[1] * 100);
    if(isNaN(statsOut.spWonPct[1])){ statsOut.spWonPct[1] = 0; }

    //tally total service points won and serves hit
    statsOut.spWonRatio[0][0] = statsOut.spWon[0];
    statsOut.spWonRatio[0][1] = statsOut.pServed[0];
    statsOut.spWonRatio[1][0] = statsOut.spWon[1];
    statsOut.spWonRatio[1][1] = statsOut.pServed[1];

    //compute opponent total serves to forhand = player total return attempts on forhand
    statsOut.fhSpWonRatio[1][1] = statsOut.fhRpWonRatio[0][1]; 
    //compute opponent total serves to forhand won = player total return attempts on FH - player FH returns won
    statsOut.fhSpWonRatio[1][0] = statsOut.fhRpWonRatio[0][1] - statsOut.fhRpWonRatio[0][0]; 
    //compute opponent total serves to backhand = player total return attempts on backhand
    statsOut.bhSpWonRatio[1][1] = statsOut.bhRpWonRatio[0][1]; 
    //compute opponent total serves to backhand won = player total return attempts on BH - player BH returns won
    statsOut.bhSpWonRatio[1][0] = statsOut.bhRpWonRatio[0][1] - statsOut.bhRpWonRatio[0][0]; 
    //compute player total serves to forhand = opponent total return attempts on forhand
    statsOut.fhSpWonRatio[0][1] = statsOut.fhRpWonRatio[1][1]; 
    //compute player total serves to forhand won = opponent total return attempts on FH - player FH returns won
    statsOut.fhSpWonRatio[0][0] = statsOut.fhRpWonRatio[1][1] - statsOut.fhRpWonRatio[1][0]; 
    //compute player total serves to backhand = opponent total return attempts on backhand
    statsOut.bhSpWonRatio[0][1] = statsOut.bhRpWonRatio[1][1]; 
    //compute player total serves to backhand won = opponent total return attempts on BH - player BH returns won
    statsOut.bhSpWonRatio[0][0] = statsOut.bhRpWonRatio[1][1] - statsOut.bhRpWonRatio[1][0]; 

    //compute total returns in percentage
    statsOut.retPct[0] = Math.round((statsOut.frIn[0]+statsOut.srIn[0]) / 
                                    (statsOut.fReturns[0]+statsOut.sReturns[0]) * 100);
    if(isNaN(statsOut.retPct[0])){ statsOut.retPct[0] = 0; }
    statsOut.retPct[1] = Math.round((statsOut.frIn[1]+statsOut.srIn[1]) / 
                                    (statsOut.fReturns[1]+statsOut.sReturns[1]) * 100);
    if(isNaN(statsOut.retPct[1])){ statsOut.retPct[1] = 0; }

    //compute total returns won percentage
    statsOut.rpWonPct[0] = Math.round(statsOut.rpWon[0] / statsOut.pReturned[0] * 100);
    if(isNaN(statsOut.rpWonPct[0])){ statsOut.rpWonPct[0] = 0; }
    statsOut.rpWonPct[1] = Math.round(statsOut.rpWon[1] / statsOut.pReturned[1] * 100);
    if(isNaN(statsOut.rpWonPct[1])){ statsOut.rpWonPct[1] = 0; }

    //tally total returns won and total return points
    statsOut.rpWonRatio[0][0] = statsOut.rpWon[0];
    statsOut.rpWonRatio[0][1] = statsOut.pReturned[0];
    statsOut.rpWonRatio[1][0] = statsOut.rpWon[1];
    statsOut.rpWonRatio[1][1] = statsOut.pReturned[1];

    return statsOut;
  }
}
