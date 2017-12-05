import { Component, OnInit } from '@angular/core';
import { NgForm, AbstractControl } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { DataSvc } from '../model/dataSvc';
import { PlayerData, DEFAULT_GENDER_TYPE, DEFAULT_HANDED_TYPE } from '../model/player';

    // COMPONENT for MANAGE PLAYERS feature

@Component({
  templateUrl: 'player.list.component.html'
})
export class PlayerListComponent implements OnInit {
  
  constructor(private user: UserInfo, private utilSvc: UtilSvc, private dataSvc: DataSvc){};

  checkAll            : boolean   = false; //true if form fields to be checked for errors (touched or not)
  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  todaysDate          : string    = this.utilSvc.formatDate();
    id          : number = 0;
    firstName   : string = "";
    lastName    : string = "";
    handed      : string = DEFAULT_HANDED_TYPE;
    gender      : string = DEFAULT_GENDER_TYPE;
    notes       : string = "";
    createdOn   : string = this.todaysDate;
  itemList            : PlayerData[]  = [];
  requestStatus       : { [key: string]: any } = {};
  working             : boolean   = false;
  formOpen            : boolean   = false;
  formWasOpen         : boolean   = false;

  ngOnInit() {
    // make the user log in to manage lists
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessLists"); // let user know they need to log in
    }
    else{
      // update the current help context and open the Player Management form
      this.utilSvc.setCurrentHelpContext("ManagePlayers"); // note current state
      this.utilSvc.displayUserMessages();
      this.dataSvc.getPlayers()
      .then((list) => {
        this.itemList = <PlayerData[]>list;
        this.itemList.sort((a,b) : number => {return a.lastName < b.lastName ? -1 : 1;});
        this.formOpen = true;
        this.formWasOpen = true;
      })
      .catch((error) => {
        this.utilSvc.displayThisUserMessage("noPlayersFound");
        this.itemList = [];
        this.formOpen = true;
        this.formWasOpen = true;
      });
    }
  }

  // delete the item that has been selected
  deleteSelectedItem = (form : NgForm) => {
    this.deleteItem = true;
    this.submitRequest(form)
  }
  
  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var pData : PlayerData = <PlayerData>{};
    var action = "";
    var msg = "", msgId = "";

    this.checkAll = true;
    this.clearRequestStatus();
    if(form.invalid){   // can't do anything yet, form still has errors
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.working = true;
    msg = "Player '" + this.firstName + " " + this.lastName + "'";
    if(this.selectedItem == "999"){   // give new player the next id number
      this.id = this.user.profile.getNextPlayerId();
      this.dataSvc.updateUserProfile(this.user);
      action = "Add";
      msgId = "listItemAdded";
    }
    else {
      if(!this.deleteItem){
        action = "Update";
        msgId = "listItemUpdated";
      } else {
        action = "Remove";
        msgId = "listItemRemoved";
      }
    }
    pData.id            = this.id;
    pData.firstName     = this.firstName;
    pData.lastName      = this.lastName;
    pData.handed        = this.handed;
    pData.gender        = this.gender;
    pData.createdOn     = this.createdOn;
    // this.selectedItem = "999";
    if(this.notes != ""){pData.notes = this.notes;} // can't store empty string in Database
    this.dataSvc.updatePlayerList(pData, action)   //  send the update
    .then((success) => {
      this.dataSvc.getPlayers()  //  re-read the player list
      .then((list) => {
        this.working = false;
        this.resetForm(form);
        this.itemList = <PlayerData[]>list;
        this.itemList.sort((a,b) : number => {return a.lastName < b.lastName ? -1 : 1;});
        this.utilSvc.setUserMessage(msgId, msg);
        this.utilSvc.displayUserMessages();
      })
      .catch((error) => {
        this.resetForm(form);
        this.utilSvc.displayThisUserMessage("errorReadingPlayerList");
        this.working = false;
      });            
    })
    .catch((error) => {
      this.resetForm(form);
      this.utilSvc.displayThisUserMessage("errorUpdatingPlayerList");
      this.working = false;
    });
  }

  // find the playerList item that contains the given id
  getItemListIndex(id : number) : number {
    var i;

    if(id){
      for(i=0; i<this.itemList.length; i++){
        if( this.itemList[i].id == id){
          return i;      // id found at position i
        }
      }
    }
    return 999;       // not found?
  }

  // get the form ready for another operation
  resetForm = (form ?: NgForm) => {
    this.clearRequestStatus();
    if(form){
      form.controls.itemName.markAsUntouched();
      form.controls.pFirst.markAsUntouched();
      form.controls.pLast.markAsUntouched();
      form.controls.pNotes.markAsUntouched();
    }
    this.checkAll = false;
    this.selectedItem = "";  // set no selected player
    this.deleteItem   = false;
    this.setItemFields();
    this.utilSvc.scrollToTop();
  }

  // set the form fields to reflect the selected player or empty
  setItemFields = () => {
    var i = (this.selectedItem === '' || this.selectedItem === '999')
                     ? 999 : this.getItemListIndex(parseInt(this.selectedItem));

    if(i != 999){
      this.id        = this.itemList[i].id;
      this.firstName = this.itemList[i].firstName;
      this.lastName  = this.itemList[i].lastName;
      this.handed    = this.itemList[i].handed;
      this.gender    = this.itemList[i].gender;
      this.notes     = this.itemList[i].notes;
      this.createdOn = this.itemList[i].createdOn;
    }
    else{
      this.id        = 0;
      this.firstName = "";
      this.lastName  = "";
      this.handed    = DEFAULT_HANDED_TYPE;
      this.gender    = DEFAULT_GENDER_TYPE;
      this.notes     = "";
      this.createdOn = this.todaysDate;
    }
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () =>  {
    return ((this.selectedItem != "") && (this.selectedItem != "999"));
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
