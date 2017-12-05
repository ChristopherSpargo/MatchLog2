import { Component, OnInit, Input } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { GraphsSvc } from '../model/graphsSvc';
import { UserInfo, CurrentMatch, PointReference } from '../app.globals';
import { PLAYER_ID, OPPONENT_ID, IMAGE_DIRECTORY, SCORE_BALL_IMAGE } from '../constants'
import { DataSvc } from '../model/dataSvc';
import { Match, MATCH_FORMATS, MatchPosition } from '../model/match';
import { TSet, TIEBREAK_SET_TYPE } from '../model/set';
import { Game, REGULAR_GAME_TYPE, TIEBREAK_GAME_TYPE } from '../model/game';
import { Point, PointData, DOUBLE_FAULT_POINT_ENDING, 
         ACE_POINT_ENDING, WINNER_POINT_ENDING, FORCED_ERROR_POINT_ENDING,
        UNFORCED_ERROR_POINT_ENDING, BAD_CALL_POINT_ENDING } from '../model/point';
import { Player, PlayerData } from '../model/player';
import { VIEW_TAB } from './logs.view.component'

    // COMPONENT for DISPLAY MATCH LOG feature

@Component({
  selector: '<app-logs-display>',
  templateUrl: 'logs.display.component.html'
})
export class LogsDisplayComponent implements OnInit {
  @Input() matchViewOpen      : boolean;  // indicates this tab should be open
  
  constructor(private user : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
            private currentMatch : CurrentMatch, private graphsSvc : GraphsSvc){};

  ngOnInit() {
    this.setMessageResponders(); 
    this.currentMatch.filteredPoints = undefined; 
  }
  
  ngOnDestroy() {
    this.deleteMessageResponders();  
  }

  ballImage                    : string  = IMAGE_DIRECTORY+SCORE_BALL_IMAGE;
  matchFormats                 : string[] = MATCH_FORMATS;
  PLAYER_ID                    : number  = PLAYER_ID;
  OPPONENT_ID                  : number  = OPPONENT_ID;
  playerWon                    : boolean = false;
  opponentWon                  : boolean = false;
  playerServed                 : boolean = false;
  opponentServed               : boolean = false;
  playerBroke                  : boolean = false;
  opponentBroke                : boolean = false;
  playerServing                : boolean = false;
  opponentServing              : boolean = false;
  stats                        : any     = {};
  trendStats                   : any[]   = [];
  opponentNames                : string[] = [];
  pointInfo                    : any     = {};
  speedDialOpen                : boolean = false;
  synopsisOpen                 : boolean = true;
  synopsisTextOpen             : boolean = false;
  serveStatsOpen               : boolean = true;
  servesTextOpen               : boolean = false;
  returnStatsOpen              : boolean = true;
  returnsTextOpen              : boolean = false;
  riskStatsOpen                : boolean = true;
  riskTextOpen                 : boolean = false;
  bigPointStatsOpen            : boolean = true;
  servesBreakdownOpen          : boolean = false;
  firstReturnsBreakdownOpen    : boolean = false;
  secondReturnsBreakdownOpen   : boolean = false;
  returnsBreakdownOpen         : boolean = false;
  winnersBreakdownOpen         : boolean = false;
  errForcedBreakdownOpen       : boolean = false;
  unfErrorsBreakdownOpen       : boolean = false;
  filterNavDisplay             : string  = "0/0";

  pointFilterInfo = {
    playerName      : "",
    opponentName    : "",
    playerId        : 0,
    opponentId      : 0,
    playerServed    : false,
    opponentServed  : false,
    breakPoint      : false,
    gamePoint       : false,
    setPoint        : false,
    matchPoint      : false,
    first           : false,
    second          : false,
    ace             : false,
    double          : false,
    return          : false,
    missedReturn    : false,
    returnWinner    : false,
    returnWingB     : false,
    returnWingF     : false,
    shots           : 0,
    shotsLessThan   : false,
    shotsMoreThan   : false,
    playerWon       : false,
    opponentWon     : false,
    playerAtNet     : false,
    opponentAtNet   : false,
    lastShotWingF   : false,
    lastShotWingB   : false,
    winnerEnd       : false,
    forcedEnd       : false,
    unforcedEnd     : false,
    badCallEnd      : false
  };

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }
  // set up the message responders for this module
  setMessageResponders() : void {
    document.addEventListener("matchUpdated", this.displayMatch);
    document.addEventListener("setSelectedMatch", this.setSelectedMatch);
    document.addEventListener("resetSelectedGame", this.resetSelectedGame);
    document.addEventListener("resetSelectedPoint", this.resetSelectedPoint);
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    document.removeEventListener("matchUpdated", this.displayMatch);
    document.removeEventListener("setSelectedMatch", this.setSelectedMatch);
    document.removeEventListener("resetSelectedGame", this.resetSelectedGame);
    document.removeEventListener("resetSelectedPoint", this.resetSelectedPoint);
  }

  // return the current display tab index
  viewTabOpen = () => {
    return this.currentMatch.selectedTab === VIEW_TAB;
    // return this.matchViewOpen;
  } 

  // return the dataVersion of the this.currentMatch
  dataVersion = () => {
    return (this.currentMatch.match ? this.currentMatch.match.dataVersion : 0);
  }

  // return the duration of the this.currentMatch in hh:mm format
  matchDuration =() => {
    var t : number;
    var m : number;
    var h : number;

    if(!this.currentMatch.match || !this.currentMatch.match.duration){
      return "";
    }
    t  = this.currentMatch.match.duration;
    if(this.currentMatch.mode == "Create" && this.currentMatch.startTimer){
      t += new Date().getTime() - this.currentMatch.startTimer;
    }
    m = Math.round(t/60000) % 60;
    h = Math.floor(t/(3600000));
    return (h + ':' + (m < 10 ? '0' : '' ) + m);
  }

  // check if displaying trend graphs now
  displayTrend = () => {
    return this.currentMatch.mode == "Trend";
  }

  // check if editing points is allowed now
  canEdit = () => {
    return this.currentMatch.mode == "Create";
  }

  // open/close the speed dial menu for point editing
  toggleSpeedDial = () => {
    this.speedDialOpen = !this.speedDialOpen;
  }
  // close the speed dial menu and emit the given event
  closeSpeedDial = (evName : string) => {
    this.speedDialOpen = false;
    this.emit(evName);
  }
    closeSDMoveRight = () => {
      this.closeSpeedDial('movePointRight');
    }
    closeSDMoveLeft = () => {
      this.closeSpeedDial('movePointLeft');
    }
    closeSDInsert = () => {
      this.closeSpeedDial('insertPoint');
    }
    closeSDDelete = () => {
      this.closeSpeedDial('deletePoint');
    }
    closeSDEdit = () => {
      this.closeSpeedDial('editPoint');
    }

  // return whether we are looking at a single match or  not
  singleMatch = () => {
    return (this.selectedMatchCount() <= 1);
  }

  // return how many matches have been selected for the display
  selectedMatchCount = () => {
    if(!this.currentMatch.selectedMatches){
      return 1;
    }
    return this.currentMatch.selectedMatches.length;
  }

  // format a string with the date range represented by the selected matches
  getSelectionsDateRange = () => {
    return (this.currentMatch.selectedMatches[this.currentMatch.selectedMatches.length-1].date + 
            ' - ' + this.currentMatch.selectedMatches[0].date)
  }

  // format a string that represents the opponents from the selections
  getOpponentsLabel = () => {
    return (this.stats.playerFirstName + ' ' + this.stats.playerName + ' .vs. ' +
            this.stats.opponentFirstName + ' ' + this.stats.opponentName);
  } 

  // get the player's name from the given id
  getPlayerName = (id: number) => {
    return this.currentMatch.playerList[this.getPlayerListIndex(id)].lastName;
  }

  // count how many unique opponents are in the selected list of matches
  countUniqueOpponents = () => {
    var i     : number;
    var oList : number[]  = []; 
    var count : number    = 0;
    var ml    : Match[]   = this.currentMatch.selectedMatches;

    for(i=0; i < ml.length; i++){
      if(oList.indexOf(ml[i].opponentId) == -1){
        oList.push(ml[i].opponentId);
        count++;
      }
    }
    return count;
  }

  // return the currently selected Match object
  selectedMatch = () => {
    return this.currentMatch.match;
  }

  // return the currently selected Set object
  selectedSet = () => {
    return this.currentMatch.selectedSet;
  }

  // return the currently selected Game object
  selectedGame = () => {
    return this.currentMatch.selectedGame;
  }

  // return the currently selected Point object
  selectedPoint = () => {
    return this.currentMatch.selectedPoint;
  }

  // make sure the given name is 8 chars or less
  shortenedDisplayName = (name: string) => {
    if(name.length > 8){
      return name.substr(0,7) + String.fromCharCode(8229);  // replace end with elipsis
    }
    return name;
  }

  // set some information to help display the stats
  setPlayerStatLabels = (matchFlag: boolean) => {
    if(!matchFlag){
      this.playerServing = this.opponentServing = false;
      this.stats.playerId = this.currentMatch.pId;
      this.stats.opponentId = this.currentMatch.oId;
      if(this.stats.winnerId == PLAYER_ID){
        this.stats.winnerId = this.currentMatch.pId;
      }
      if(this.stats.winnerId == OPPONENT_ID){
        this.stats.winnerId = this.currentMatch.oId;
      }
    }
    this.currentMatch.playerName = this.stats.playerName = 
        this.currentMatch.playerList[this.currentMatch.pIndex].lastName;
    this.stats.shortPlayerName = this.shortenedDisplayName(this.stats.playerName);
    this.stats.playerFirstName = this.currentMatch.playerList[this.currentMatch.pIndex].firstName;
    this.stats.playerInitial = this.currentMatch.playerList[this.currentMatch.pIndex].firstInitial;
    this.stats.playerNameAndInitial = this.stats.playerInitial + 
        (this.stats.playerInitial ? '. ' : '') + this.stats.playerName;
    if(this.currentMatch.oId){
      this.currentMatch.opponentName = this.stats.opponentName = 
          this.currentMatch.playerList[this.currentMatch.oIndex].lastName;
      this.stats.shortOpponentName = this.shortenedDisplayName(this.stats.opponentName);
      this.stats.opponentFirstName = this.currentMatch.playerList[this.currentMatch.oIndex].firstName;
      this.stats.opponentInitial = this.currentMatch.playerList[this.currentMatch.oIndex].firstInitial;
    }
    else {
      var i: number =  this.countUniqueOpponents()
      this.stats.opponentInitial = i;
      this.stats.opponentFirstName = i + ' Different';
      this.currentMatch.opponentName = this.stats.opponentName = this.stats.shortOpponentName = "Opponents";
    }
    this.stats.opponentNameAndInitial = this.stats.opponentInitial + 
        (this.stats.opponentInitial ? '. ' : '') + this.stats.opponentName;
  }

  // save the object that has been selected from the match list 
  setSelectedMatch = () => {
    this.clearSelectedSet();
    this.currentMatch.filteredPoints = this.filterPoints(this.currentMatch.match); //clear filered points
    this.currentMatch.eventInfoOpen = false;
    this.displayMatch();
  }

  // extract the information from the Match object for displaying
  // set the stats object to reflect the whole match
  displayMatch = () => {
    var s : TSet;
    switch(this.currentMatch.mode){
      case "Review":
      case "Create":
        this.currentMatch.match.computeScore();
        s = this.currentMatch.match.sets[this.currentMatch.match.sets.length-1];
        // now, don't show game score(0-0) in "View Match Logs" if last game was finished
        if(this.currentMatch.mode == "Review" && 
            s.type != TIEBREAK_SET_TYPE && s.games[s.games.length-1].winnerId){
          this.currentMatch.match.currGame = undefined; 
        }
        this.currentMatch.setPoint = s.setPoint;
        this.currentMatch.gamePoint = s.gamePoint;
        this.currentMatch.breakPoint = s.breakPoint;
        this.currentMatch.tiebreak = (s.type == TIEBREAK_SET_TYPE) || 
                  (s.games[s.games.length-1].type == TIEBREAK_GAME_TYPE);
        this.stats = this.currentMatch.match.computeStats();
        this.currentMatch.pId = this.stats.playerId;
        this.currentMatch.pIndex = this.getPlayerListIndex(this.currentMatch.pId);
        this.currentMatch.oId = this.stats.opponentId;
        this.currentMatch.oIndex = this.getPlayerListIndex(this.currentMatch.oId);
        this.currentMatch.sId = this.stats.serverId == PLAYER_ID ? 
                  this.currentMatch.pId : this.currentMatch.oId;
        this.currentMatch.sIndex = this.currentMatch.sId == this.currentMatch.pId ? 
                  this.currentMatch.pIndex : this.currentMatch.oIndex;
        this.playerServing = this.canEdit() && (this.stats.serverId == PLAYER_ID) ? true : false;
        this.opponentServing = this.canEdit() && (this.stats.serverId == OPPONENT_ID) ? true : false;
        this.setPlayerStatLabels(true);
        this.setStatsTitle();
        this.getWinnerInfo(this.stats.winnerId, 0);
        if(this.viewTabOpen()){ this.graphsSvc.displayGraphs(this.stats); }
        break;
      case "Combine":
        this.stats = undefined;
        this.currentMatch.selectedMatches.forEach(
          (m, index) => {
            this.stats = m.computeStats(this.stats);
          });
        this.stats.winnerId = 0;
        this.currentMatch.setPoint = this.currentMatch.gamePoint = this.currentMatch.breakPoint = this.currentMatch.tiebreak = false;
        this.currentMatch.pId = this.stats.playerId;
        this.currentMatch.pIndex = this.getPlayerListIndex(this.currentMatch.pId);
        this.currentMatch.oId = 0;
        if(this.countUniqueOpponents() == 1){
          this.currentMatch.oId = this.stats.opponentId;
          this.currentMatch.oIndex = this.getPlayerListIndex(this.currentMatch.oId);
        };
        this.currentMatch.sId = 0;
        this.playerServing = false;
        this.opponentServing = false;
        this.setPlayerStatLabels(true);
        this.setStatsTitle();
        this.getWinnerInfo(9999, 9999);
        if(this.viewTabOpen()){ this.graphsSvc.displayGraphs(this.stats); }
        break;
      case "Trend":
        this.stats = undefined;
        this.trendStats = [];
        this.opponentNames = [];
        this.currentMatch.selectedMatches.forEach(
          (m, index) => {
            this.stats = m.computeStats(this.stats);
            this.trendStats.push(m.computeStats());
            this.opponentNames.unshift(this.getPlayerName(m.opponentId));
          });
        this.stats.winnerId = 0;
        this.currentMatch.setPoint = this.currentMatch.gamePoint = this.currentMatch.breakPoint = this.currentMatch.tiebreak = false;
        this.currentMatch.pId = this.stats.playerId;
        this.currentMatch.pIndex = this.getPlayerListIndex(this.currentMatch.pId);
        this.currentMatch.oId = 0;
        if(this.countUniqueOpponents() == 1){
          this.currentMatch.oId = this.stats.opponentId;
          this.currentMatch.oIndex = this.getPlayerListIndex(this.currentMatch.oId);
        };
        this.currentMatch.sId = 0;
        this.playerServing = false;
        this.opponentServing = false;
        this.setPlayerStatLabels(true);
        this.setStatsTitle();
        this.getWinnerInfo(9999, 9999);
        if(this.viewTabOpen()){ 
          this.graphsSvc.displayTrends(this.trendStats, this.currentMatch.selectedMatches, 
            this.stats.playerName, this.stats.opponentName, this.opponentNames); 
        }
        break;
    }
  }

  setSelectedSet = (index: number) => {
    this.selectSet(index);
    if(this.viewTabOpen()){ this.graphsSvc.displayGraphs(this.stats); }
  }

  // save the object that has been selected from the set list 
  // reset the stats object to refelct just the selected set
  selectSet = (index: number) => {
    this.clearSelectedGame();
    this.currentMatch.selectedSet = this.currentMatch.match.sets[index];
    this.currentMatch.selectedSetNumber = index+1;
    this.stats = this.currentMatch.selectedSet.computeStats();
    this.setPlayerStatLabels(false);
    this.setStatsTitle();
    this.getWinnerInfo(this.stats.winnerId, 0);
  }

  // re-establish the current game selection after point move/delete
  resetSelectedGame = () => {
    if(this.currentMatch.selectedSet.games.length >= this.currentMatch.selectedGameNumber){
      this.setSelectedGame(this.currentMatch.selectedGameNumber-1); // must have removed last game
    }
    else {
      if(this.currentMatch.selectedSet.games.length){
        this.setSelectedGame(this.currentMatch.selectedGameNumber-2);
      }
      else { this.clearSelectedGame();}
    }
  }

  setSelectedGame = (index: number) => {
    this.clearSelectedPoint();
    this.selectGame(index);
  }

  // save the object that has been selected from the game list 
  // reset the stats object to refelct just the selected game
  selectGame = (index: number) => {
    this.graphsSvc.clearGraphs();
    this.currentMatch.selectedGame = this.currentMatch.selectedSet.games[index];
    this.currentMatch.selectedGameNumber = index+1;
    this.stats = this.currentMatch.selectedGame.computeStats();
    this.setPlayerStatLabels(false);
    this.setStatsTitle();
    this.getWinnerInfo(this.stats.winnerId, 
      this.stats.type == REGULAR_GAME_TYPE ? this.stats.serverId : 0);
  }

  // re-establish the current point selection after point edit
  resetSelectedPoint = () => {
    this.setSelectedPoint(this.currentMatch.selectedPointNumber-1);
  }

  // save the object that has been selected from the point list 
  // reset the pointInfo object to refelct the selected point
  setSelectedPoint = (index: number) => {
    var ebIndex : number;
    var wIndex  : number;

    this.speedDialOpen = false;
    if(index >= 0){
      this.graphsSvc.clearGraphs();
      if(this.currentMatch.selectedGame){
        this.currentMatch.selectedPoint = this.currentMatch.selectedGame.points[index];
      }
      else{
        this.currentMatch.selectedPoint = this.currentMatch.selectedSet.points[index];
      }
      this.currentMatch.selectedPointNumber = index+1;
      this.pointInfo = this.currentMatch.selectedPoint.getPointInfo();
      wIndex = this.pointInfo.winnerId == PLAYER_ID ? 
                this.currentMatch.pIndex : this.currentMatch.oIndex;
      this.pointInfo.winnerId = wIndex == this.currentMatch.pIndex ? 
                this.currentMatch.pId : this.currentMatch.oId;
      this.pointInfo.winnerName = this.currentMatch.playerList[wIndex].lastName;
      if( this.pointInfo.enderId != 0 ){
        ebIndex = wIndex;
      }
      else {
        ebIndex = (this.pointInfo.winnerId == this.currentMatch.pId) ? 
                  this.currentMatch.oIndex : this.currentMatch.pIndex;
      }
      this.pointInfo.endedByName = this.currentMatch.playerList[ebIndex].lastName;
      this.setStatsTitle();
      this.getWinnerInfo(this.pointInfo.winnerId, this.pointInfo.serverId);
    }
  }

  // set the current set/game/point selections to the last point in the log
  // if there are no points in the last game, use last game-1
  // if there are no games in the last set use the last set-1
  // if there are sets in the match then return
  selectLastPoint = () => {
    var cpi : number;
    var s : TSet;
    var g : Game;
    var pRef : PointReference = <PointReference>{};

    pRef.set = this.currentMatch.match.sets.length-1;
    s = this.currentMatch.match.sets[pRef.set];
    if(s.type != TIEBREAK_SET_TYPE){
      pRef.game = s.games.length-1;
      g = s.games[pRef.game];
      if(!g.points.length){
        if(s.games.length > 1){
          pRef.game--;
          g = s.games[pRef.game];
        }
      }
      pRef.point = g.points.length-1;
    }
    else{
      pRef.point = s.points.length-1;
    }
    this.displaySpecificPoint(pRef);

  }

  displaySpecificPoint = (pRef : PointReference) : void => {
    this.setSelectedSet(pRef.set);
    if(pRef.game !== undefined){ this.setSelectedGame(pRef.game); }
    this.setSelectedPoint(pRef.point);

    // now make sure the selected game and point are showing
    setTimeout( () => {
      if(pRef.game === undefined){
        document.getElementById('gamesDisplay').scrollLeft = (pRef.point * 48);
      } else{
        document.getElementById('gamesDisplay').scrollLeft = (pRef.game * 48);
        document.getElementById('pointsDisplay').scrollLeft = (pRef.point * 48);
      }
      },50);  // allow some time for the divs to be populated
  }

  // clear the object that has been selected from the match list 
  clearSelectedMatch = () => {
    this.clearSelectedSet();
    this.currentMatch.pId = this.currentMatch.oId = 0;
  }

  // clear the object that has been selected from the set list 
  clearSelectedSet = () => {
    this.clearSelectedGame();
    this.currentMatch.selectedSet = undefined;
    this.currentMatch.selectedSetNumber = 0;
  }

  // clear the object that has been selected from the game list 
  clearSelectedGame = () =>{
    this.clearSelectedPoint();  
    this.currentMatch.selectedGame = undefined;
    this.currentMatch.selectedGameNumber = 0;
  }

  // clear the object that has been selected from the point list 
  clearSelectedPoint = () => {
    this.currentMatch.selectedPoint = undefined;
    this.currentMatch.selectedPointNumber = 0;
  }

  // show match level stats
  showMatchLevel = () => {
    this.clearSelectedSet();
    this.displayMatch();
  }

  // set items indicating who won the point/game/set/match and if it was a Break
  getWinnerInfo = (winnerId : number, serverId : number) => {
    this.playerServed =   serverId == PLAYER_ID;
    this.opponentServed = serverId == OPPONENT_ID;
    this.playerWon =      winnerId == this.currentMatch.pId;
    this.opponentWon =    winnerId == this.currentMatch.oId;
    this.playerBroke =    this.playerWon && this.opponentServed;
    this.opponentBroke =  this.opponentWon && this.playerServed;
  }

  // return if selected point/game/set was won against serve by the PLAYER
  playerBrokeToGetHere = (list : any[], index : number) => {
    if(index > 0 && list[index-1].winnerId == PLAYER_ID && list[index-1].serverId != PLAYER_ID){
      return true;
    }
    return false;
  }

  // return if given point was won on serve by the PLAYER
  playerHeldThisPoint = (p : Point) => {
    return ((p.winnerId == PLAYER_ID) && (p.serverId == PLAYER_ID));
  }

  // return if given point was won against serve by the PLAYER
  playerBrokeThisPoint = (p : Point) => {
    return ((p.winnerId == PLAYER_ID) && (p.serverId != PLAYER_ID));
  }

  // return if given point was won on serve by the OPPONENT
  opponentHeldThisPoint = (p : Point) => {
    return ((p.winnerId == OPPONENT_ID) && (p.serverId == OPPONENT_ID));
  }

  // return if given point was won against serve by the OPPONENT
  opponentBrokeThisPoint = (p : Point ) => {
    return ((p.winnerId == OPPONENT_ID) && (p.serverId != OPPONENT_ID));
  }

  // find the playerList item that contains the given id
  getPlayerListIndex = (id : number ) => {
    var i : number;

    for(i=0; i<this.currentMatch.playerList.length; i++){
      if( this.currentMatch.playerList[i].id == id){
        return i;      // id found at position i
      }
    }
    return 999;       // not found?
  }

  // set the appropriate title for the stats display
  setStatsTitle = () => {

    var position : MatchPosition = {  // prepare a position object to describe the current display selections
      game: this.currentMatch.selectedGameNumber ? this.currentMatch.selectedGameNumber : undefined,
      point: this.currentMatch.selectedPointNumber ? this.currentMatch.selectedPointNumber-1 : undefined
    }
    // if there is no selected point within the selected game, only display score upto the selected game
    if(this.currentMatch.selectedGameNumber && !this.currentMatch.selectedPointNumber) position.game--; 

    if(this.currentMatch.selectedSet){ // is display selection at set level or below?
      if(this.currentMatch.selectedPoint || this.currentMatch.selectedGame){ // how about game or point level
        this.stats.title1 = "Set " + this.currentMatch.selectedSetNumber;
        this.stats.title2 = this.currentMatch.selectedSet.getFormattedScore(position);
        this.currentMatch.selectedSet.computeScore();
      } else{
        this.stats.title1 = "";
        this.stats.title2 = "Set " + this.currentMatch.selectedSetNumber;
      }
    } else { // display is at match level, account for multiple match selections
      this.stats.title1 = this.currentMatch.selectedMatches.length == 1 ? "" : this.currentMatch.selectedMatches.length;
      this.stats.title2 = this.currentMatch.selectedMatches.length == 1 ? "Match" : "Matches";
    }
  }

  haveFilterList = () : boolean => {
    return this.currentMatch.filteredPoints !== undefined;
  }

  isFirstFilterPoint = () : boolean => {
    return (this.haveFilterList() ? (this.currentMatch.filteredPointsIndex < 2) : true);
  }


  isLastFilterPoint = () : boolean => {
    return (this.haveFilterList() ? 
            (this.currentMatch.filteredPointsIndex === this.currentMatch.filteredPoints.length) : true);
  }

  setNavDisplay = () : void => {
    this.filterNavDisplay = (' ' + this.currentMatch.filteredPointsIndex + ' / ' +
                             this.currentMatch.filteredPoints.length + ' ');
  }

  previousFilterPoint = () : void => {
    if(!this.isFirstFilterPoint()){
      this.currentMatch.filteredPointsIndex--;
    }
    this.displayFilterPoint();
  }

  nextFilterPoint = () : void => {
    if(!this.isLastFilterPoint()){
      this.currentMatch.filteredPointsIndex++;
    }
    this.displayFilterPoint();
  }

  displayFilterPoint = () : void => {
    var pt : PointReference;

    pt = this.currentMatch.filteredPoints[this.currentMatch.filteredPointsIndex-1];
    this.displaySpecificPoint(pt);
    this.setNavDisplay();
  }
  openPointFilter = () : void => {
    var oldHelpContext = this.utilSvc.getCurrentHelpContext();

    this.utilSvc.setCurrentHelpContext("PointFilter");
    this.pointFilterInfo.playerName = this.currentMatch.playerName;
    this.pointFilterInfo.opponentName = this.currentMatch.opponentName;
    this.pointFilterInfo.playerId = this.currentMatch.pId;
    this.pointFilterInfo.opponentId = this.currentMatch.oId;
    this.utilSvc.openPointFilterModal("Point Filter", this.pointFilterInfo, "Apply")
    .then((filterSpec) => {
        this.utilSvc.setCurrentHelpContext(oldHelpContext);
        this.currentMatch.filteredPoints = this.filterPoints(this.currentMatch.match, filterSpec);
        if(this.currentMatch.filteredPoints !== undefined){
          this.currentMatch.filteredPointsIndex = 1;
          this.displayFilterPoint();
        }
    })
    .catch((cancel) => {
      this.utilSvc.setCurrentHelpContext(oldHelpContext)
    });
  }

  // return a list of PointReferences from the given match that meet the given point filter spec
  filterPoints = (m : Match, filterSpec?: any[]) : PointReference[] => {
    var pointList : PointReference[]= [];
    var plIndex = 0;

    m.sets.forEach( (s, sIndex) => {
      s.hasFilterPoint = undefined;
      if(s.type === TIEBREAK_SET_TYPE){
        s.points.forEach((p, pIndex) => {
          p.hasFilterPoint = undefined;
          if(this.checkFilter(p, filterSpec)){
            pointList[plIndex++] = {'set': sIndex, 'point': pIndex};
            p.hasFilterPoint = s.hasFilterPoint = true;
          }
        })
      } else{
        s.games.forEach((g, gIndex) => {
          g.hasFilterPoint = undefined;
          g.points.forEach((p, pIndex) => {
            p.hasFilterPoint = undefined;
            if(this.checkFilter(p, filterSpec)){
              pointList[plIndex++] = {'set': sIndex, 'game': gIndex, 'point': pIndex};
              p.hasFilterPoint = g.hasFilterPoint = s.hasFilterPoint = true;
            }
          })
        })
      }
    })
    return (pointList.length ? pointList : undefined);
  }

  // check if the given point matches the given point filter spec
  checkFilter = (p : Point, spec : any[]) : boolean => {
    var result : boolean = true;
    var orRes  : boolean;
    var cond   : any;
    var orCond : any;

    if(spec === undefined){return false;}
    for(var i = 0; i < spec.length; i++){
      cond = spec[i];
      switch(cond.item){
        case 'whoServed':
          result = result && p.serverId === cond.test;
          break;
        case 'returnWing':
          result = result && p.returnWing === cond.test;
          break;
        case 'shotsEQ':
          result = result && p.shots == cond.test;
          break;
        case 'shotsLT':
          result = result && p.shots < cond.test;
          break;
        case 'shotsGT':
          result = result && p.shots > cond.test;
          break;
        case 'whoWon':
          result = result && p.winnerId === cond.test;
          break;
        case 'lastShotWing':
          result = result && p.lastShotWing === cond.test;
          break;
        case 'OR':
          orRes = false;
          for(var j = 0; j < cond.test.length; j++){
            orCond = cond.test[j];
            switch(orCond.item){
              case 'gamePoint':
                orRes = orRes || p.gamePoint === true;
                break;
              case 'breakPoint':
                orRes = orRes || p.breakPoint === true;
                break;
              case 'setPoint':
                orRes = orRes || p.setPointFor !== undefined;
                break;
              case 'matchPoint':
                orRes = orRes || p.matchPointFor != undefined;
                break;
              case 'ace':
                orRes = orRes || (p.pointEndedBy === ACE_POINT_ENDING);
                break;
              case 'double':
                orRes = orRes || (p.pointEndedBy === DOUBLE_FAULT_POINT_ENDING);
                break;
              case 'first':
                orRes = orRes || p.firstServeIn;
                break;
              case 'second':
                orRes = orRes || (!p.firstServeIn && (p.pointEndedBy !== DOUBLE_FAULT_POINT_ENDING));
                break;
              case 'return':
                orRes = orRes || p.returnIn;
                break;
              case 'returnWinner':
                orRes = orRes || (p.returnIn && (p.shots === 2) && (p.pointEndedBy === WINNER_POINT_ENDING));
                break;
              case 'missedReturn':
                orRes = orRes || (!p.returnIn && (p.pointEndedBy !== DOUBLE_FAULT_POINT_ENDING));
                break;
              case 'playerAtNet':
                orRes = orRes || p.playerAtNet;
                break;
              case 'opponentAtNet':
                orRes = orRes || p.opponentAtNet;
                break;
              case 'winnerEnd':
                orRes = orRes || (p.pointEndedBy === WINNER_POINT_ENDING);
                break;
              case 'forcedEnd':
                orRes = orRes || (p.pointEndedBy === FORCED_ERROR_POINT_ENDING);
                break;
              case 'unforcedEnd':
                orRes = orRes || (p.pointEndedBy === UNFORCED_ERROR_POINT_ENDING);
                break;
              case 'badCallEnd':
                orRes = orRes || (p.pointEndedBy === BAD_CALL_POINT_ENDING);
                break;
              default:
                orRes = false;
            }
            if(orRes){break;}
          }
          result = result && orRes;
          break;
        default:
          result = false;
      }
      if(!result){break;}
    }
    return result;
  }

  // return the status of the event info display
  getEventInfoOpen = () => {
    return this.currentMatch.eventInfoOpen;
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
