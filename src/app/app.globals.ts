import { Injectable } from '@angular/core';
import { Profile } from './model/profile';
import { Match } from './model/match';
import { TSet } from './model/set';
import { Game } from './model/game';
import { Point } from './model/point';

@Injectable()
export class SlideoutStatus {
  slidenavOpen      : boolean = false;
  aboutMenuOpen     : boolean = false;
  accountMenuOpen   : boolean = false;
  logsMenuOpen      : boolean = false;
  publicLogsMenuOpen: boolean = false;
  listsMenuOpen     : boolean = false;
  aboutOpen         : boolean = false;
}

// definition of UserData

export interface UserData {
  userEmail       : string;           // email address of current user
  password        : string;           // password of current user
  authData        : any;              // authorization data object from sign in process
  profile         : Profile;          // profile object for this user
  messages        : any;              // process messages object (flash messages)
  messageOpen     : boolean;          // indicates a toast message is currently being displayed
  helpContext     : string;           // current context for help information
}

@Injectable()
export class UserInfo {
    userEmail   : string  = "";
    password    : string  = "";
    authData    : any     = null;
    profile     : Profile;
    messages    : { [key: string]: any } = null;
    messageOpen : boolean = false;
    helpContext : string  = "MatchLog";   //current context for help information
}

@Injectable()
export class AboutStatus {
    context : string  = "MatchLog";   //current context for help information
    open   : boolean = false;
}

    ////////////////////////////////////////////////////////////
    // Service to hold Match/Display information common to
    // Create and Review classes.
@Injectable()
export class CurrentMatch {
      mode                  : string = "";      // how match is being accessed (Create, Review)
      status                : string = "";      // saved status of match (Ended, Paused)
      hasBeenSaved          : boolean = false;  // true if match has been saved to database 
      matchList             : Match[];          // original list of matches from database query
      selectedMatches       : Match[];          // List of selected matches (Combine/Sequence) 
      matchSelectFlags      : boolean [];       // selection flags for each match in original matchList
      match                 : Match;            // Match object (Review/Create)
      pId                   : number = 0;       // Id of PLAYER from Match
      oId                   : number = 0;       // Id of OPPONENT from Match
      sId                   : number = 0;       // Id of SERVER from Match
      playerList            : any[];            // formatted list of players
      pIndex                : number = 0;       // index of PLAYER in current_Match.playerList
      oIndex                : number = 0;       // index of OPPONENT in current_Match.playerList
      sIndex                : number = 0;       // index of SERVER in current_Match.playerList
      matchPoint            : boolean = false;  // special point indicator for display
      setPoint              : boolean = false;  // special point indicator for display
      gamePoint             : boolean = false;  // special point indicator for display
      breakPoint            : boolean = false;  // special point indicator for display
      tiebreak              : boolean = false;  // true if display should indicate tiebreak situation
      playerName            : string = "";      // name of PLAYER for display
      opponentName          : string = "";      // name of OPPONENT for display
      selectedSet           : TSet = undefined;  // Set object for currently selected set in View tab
      selectedSetNumber     : number = 0;       // Ordinal number of selectedSet in list of sets for Match
      selectedGame          : Game = undefined; // Game object for currently selected game in View tab
      selectedGameNumber    : number = 0;       // Ordinal number of selectedGame in list of games for Set       
      selectedPoint         : Point = undefined;  // Point object for currently selected point in View tab
      selectedPointNumber   : number = 0;       // Ordinal number of selectedPoint in list of points for Set/Game
      eventInfoOpen         : boolean = false;  // indicates user has opened/closed the event info display area
      pointsLogged          : number = 0;       // indicates match logging has begun in Create mode
      insertActive          : boolean = false;  // indicates an insert action in progress for the point list
      editActive            : boolean = false;  // indicates an edit action in progress for the point list
      selectedTab           : number = undefined; // index of the current view tab
      startTimer            : number = 0        // time in milliseconds that logging most recently started
    }

