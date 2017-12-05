import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { MENU_TAB, MENU_TAB_ID } from '../logs/logs.view.component'
import { Player, PlayerData, DEFAULT_GENDER_TYPE, DEFAULT_HANDED_TYPE } from '../model/player'
import { Point, PointData, UNFORCED_ERROR_POINT_ENDING, UNFORCED_ERROR_DETAILS, POINT_ENDINGS,
         WINNER_POINT_ENDING, ACE_POINT_ENDING, DEFAULT_POINT_ENDING, DOUBLE_FAULT_POINT_ENDING,
         BAD_CALL_POINT_ENDING, FORCED_ERROR_POINT_ENDING, DEFAULT_UNFORCED_ERROR_DETAIL } from '../model/point'
import { PLAYER_ID, PLAYER_ID_STR, OPPONENT_ID, OPPONENT_ID_STR, ML_DATA_VERSION,
         IMAGE_DIRECTORY, FORM_HEADER_ICON  } from '../constants'
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'logs.point.filter.modal.component.template.html'
})
export class LogsPointFilterModalComponentTemplate implements OnInit {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;
  
  @Input() title          : string;
  @Input() playerName     : string;
  @Input() opponentName   : string;
  @Input() playerId       : number;
  @Input() opponentId     : number;
  @Input() pointInfo      : any;
  @Input() okText         : string;
  @Input() cancelText     : string;
  @Input() clearText      : string;
  @Input() openModal      : boolean;
  @Input() toggleAbout    : Function;

  constructor(public activeModal: NgbActiveModal) {}
  oldPointInfo            : any = {};

  // pointInfo = {
  //   playerName      : "",
  //   opponentName    : "",
  //   playerId        : 0,
  //   opponentId      : 0,
  //   playerServed    : false,
  //   opponentServed  : false,
  //   breakPoint      : false,
  //   gamePoint       : false,
  //   setPoint        : false,
  //   matchPoint      : false,
  //   first           : false,
  //   second          : false,
  //   ace             : false,
  //   double          : false,
  //   return          : false,
  //   missedReturn    : false,
  //   returnWinner    : false,
  //   returnWingB     : false,
  //   returnWingF     : false,
  //   shots           : 0,
  //   shotsLessThan   : false,
  //   shotsMoreThan   : false,
  //   playerWon       : false,
  //   opponentWon     : false,
  //   playerAtNet     : false,
  //   opponentAtNet   : false,
  //   lastShotWingF   : false,
  //   lastShotWingB   : false,
  //   winnerEnd       : false,
  //   forcedEnd       : false,
  //   unforcedEnd     : false,
  //   badCallEnd      : false
  // };

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
  requestStatus                = {};

  ngOnInit() {
    this.copyPointInfo();
  }

  copyPointInfo = () => {
    for(var item in this.pointInfo){
      this.oldPointInfo[item] = this.pointInfo[item];
    }
  }

  restorePointInfo = () => {
    for(var item in this.oldPointInfo){
      this.pointInfo[item] = this.oldPointInfo[item];
    }
  }

  resetPointFilterForm = () => {
    this.pointInfo.playerServed   = false;
    this.pointInfo.opponentServed = false;
    this.pointInfo.gamePoint      = false;
    this.pointInfo.breakPoint     = false;
    this.pointInfo.setPoint       = false;
    this.pointInfo.matchPoint     = false;
    this.pointInfo.first          = false;
    this.pointInfo.second         = false;
    this.pointInfo.ace            = false;
    this.pointInfo.double         = false;
    this.pointInfo.return         = false;
    this.pointInfo.missedReturn   = false;
    this.pointInfo.returnWinner   = false;
    this.pointInfo.returnWingF    = false;
    this.pointInfo.returnWingB    = false;
    this.pointInfo.shots          = "0";
    this.pointInfo.shotsLessThan  = false;
    this.pointInfo.shotsMoreThan  = false;
    this.pointInfo.playerWon      = false;
    this.pointInfo.opponentWon    = false;
    this.pointInfo.playerAtNet    = false;
    this.pointInfo.opponentAtNet  = false;
    this.pointInfo.lastShotWingF  = false;
    this.pointInfo.lastShotWingB  = false;
    this.pointInfo.winnerEnd      = false;
    this.pointInfo.forcedEnd      = false;
    this.pointInfo.unforcedEnd    = false;
    this.pointInfo.badCallEnd     = false;
  }

  // create the filter conditions array
  // condition objects are: {'conditionID': comparisonValue}, or {'OR': conditionArray}
  // ex: [{'item': 'playerServed', 'test': true}, {'item': 'gamePoint', 'test': true}, 
  //      {'ORCondition':[{'item': 'pointEnd', 'test': 2}, {'item': 'poinEnd', 'test': 4}]}]
  // conditions are AND-ed except inside an ORCondition where the are OR-ed
  createFilterSpec = () => {
    var fSpec   : any = [];
    var specNum : number = 0;
    var pi      : any = this.pointInfo;
    var i       : number;

    if(pi.playerServed || pi.opponentServed){
      if(!(pi.playerServed && pi.opponentServed)){  // if both are set then it doesn't matter
        fSpec[specNum++]= pi.playerServed ? {'item': 'whoServed', 'test': PLAYER_ID} 
                                        : {'item': 'whoServed', 'test': OPPONENT_ID};
      }
    }

    if(pi.gamePoint || pi.breakPoint || pi.setPoint || pi.matchPoint){
      i = 0;
      fSpec[specNum] = {'item': 'OR', 'test': []};
      if(pi.gamePoint) { fSpec[specNum].test[i++] = {'item': 'gamePoint', 'test': true}; }
      if(pi.breakPoint){ fSpec[specNum].test[i++] = {'item': 'breakPoint', 'test': true}; }
      if(pi.setPoint)  { fSpec[specNum].test[i++] = {'item': 'setPoint', 'test': true}; }
      if(pi.matchPoint){ fSpec[specNum].test[i++] = {'item': 'matchPoint', 'test': true}; }
      specNum++;
    }

    if(pi.first || pi.second){
      i = 0;
      fSpec[specNum] = {'item': 'OR', 'test': []};
      if(pi.first) { fSpec[specNum].test[i++] = {'item': 'first', 'test': true}; }
      if(pi.second){ fSpec[specNum].test[i++] = {'item': 'second', 'test': true}; }
      specNum++;
    }

    if(pi.ace || pi.double){
      i = 0;
      fSpec[specNum] = {'item': 'OR', 'test': []};
      if(pi.ace)      { fSpec[specNum].test[i++] = {'item': 'ace', 'test': true}; }
      if(pi.double){ fSpec[specNum].test[i++] = {'item': 'double', 'test': true}; }
      specNum++;
    }
    
    if(pi.return || pi.returnWinner || pi.missedReturn){
      i = 0;
      fSpec[specNum] = {'item': 'OR', 'test': []};
      if(pi.return)      { fSpec[specNum].test[i++] = {'item': 'return', 'test': true}; }
      if(pi.returnWinner){ fSpec[specNum].test[i++] = {'item': 'returnWinner', 'test': true}; }
      if(pi.missedReturn){ fSpec[specNum].test[i++] = {'item': 'missedReturn', 'test': true}; }
      specNum++;
    }
    
    if(pi.returnWingF || pi.returnWingB){
      if(!pi.returnWingF || !pi.returnWingB){  // if both are set then it doesn't matter
        fSpec[specNum++]= pi.returnWingF ? {'item': 'returnWing', 'test': 'F'} 
                                        : {'item': 'returnWing', 'test': 'B'};
      }
    }
    
    if(pi.shots != 0){
      fSpec[specNum++]= pi.shotsLessThan ? {'item': 'shotsLT', 'test': pi.shots} : 
                        (pi.shotsMoreThan ? {'item': 'shotsGT', 'test': pi.shots} : {'item': 'shotsEQ', 'test': pi.shots});
    }
    
    if(pi.playerWon || pi.opponentWon){
      if(!pi.playerWon || !pi.opponentWon){  // if both are set then it doesn't matter
        fSpec[specNum++]= pi.playerWon ? {'item': 'whoWon', 'test': PLAYER_ID} 
                                      : {'item': 'whoWon', 'test': OPPONENT_ID};
      }
    }
    
    if(pi.playerAtNet || pi.opponentAtNet){
      i = 0;
      fSpec[specNum] = {'item': 'OR', 'test': []};
      if(pi.playerAtNet)  { fSpec[specNum].test[i++] = {'item': 'playerAtNet', 'test': true}; }
      if(pi.opponentAtNet){ fSpec[specNum].test[i++] = {'item': 'opponentAtNet', 'test': true}; }
      specNum++;
    }
    
    if(pi.lastShotWingF || pi.lastShotWingB){
      if(!pi.lastShotWingF || !pi.lastShotWingB){  // if both are set then it doesn't matter
        fSpec[specNum++]= pi.lastShotWingF ? {'item': 'lastShotWing', 'test': 'F'} 
                                          : {'item': 'lastShotWingB', 'test': 'B'};
      }
    }
    
    if(pi.winnerEnd || pi.forcedEnd || pi.unforcedEnd || pi.badCallEnd){
      i = 0;
      fSpec[specNum] = {'item': 'OR', 'test': []};
      if(pi.winnerEnd)  { fSpec[specNum].test[i++] = {'item': 'winnerEnd', 'test': true}; }
      if(pi.forcedEnd)  { fSpec[specNum].test[i++] = {'item': 'forcedEnd', 'test': true}; }
      if(pi.unforcedEnd){ fSpec[specNum].test[i++] = {'item': 'unforcedEnd', 'test': true}; }
      if(pi.badCallEnd) { fSpec[specNum].test[i++] = {'item': 'badCallEnd', 'test': true}; }
      specNum++;
    }
    
    return (fSpec.length ? fSpec : undefined);
  }

  // handle updates to the point information form
  updatePointFilterForm = (item : string) => {
    var pi = this.pointInfo;

    this.clearRequestStatus();
    switch(item){
      case "Ace":
        if(pi.ace){
          pi.lastShotWingF = pi.lastShotWingB = false;
          pi.shots = "0";
          pi.return = pi.missedReturn = pi.returnWinner =
            pi.playerAtNet = pi.opponentAtNet = false;
        }
        break;
        case "Double":
        if(pi.double){
          pi.shots = "0";
          pi.returnWingF = pi.returnWingB = pi.lastShotWingF = pi.lastShotWingF = false;
          pi.first = pi.second = pi.playerAtNet = pi.opponentAtNet = false;
          pi.return = pi.missedReturn = pi.returnWinner = false;
        }
        break;
      case "first":
        if(pi.first){
          pi.second = pi.double = false;
        }
        break;
      case "second":
        if(pi.second){
          pi.first = pi.double = false;
        }
        break;
      case "shots":
        if(pi.shots > 1){
          pi.ace = pi.double = false;
        }
        break;
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
    return this.haveStatusMessages();
  }

  // call the resolve method after waiting for closing animation
  close = (form : NgForm) => {
    var result : any;

    this.clearRequestStatus();
    if(form && this.checkForProblems(form)) {
      return; //not done yet, there is a problem
    }
    result = this.createFilterSpec(); //create the filter spec from the form fields
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.close(result);
    }, 400);
  }

  // call the resolve method after waiting for closing animation
  dismiss = () => {
    this.restorePointInfo();
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.dismiss("CANCEL");
    }, 400)
  }

}
