import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { DataSvc } from '../model/dataSvc';
import { Player, PlayerData } from '../model/player';

    // COMPONENT for MANAGE PLAYERS feature

@Component({
  templateUrl: 'player.list.component.html'
})
export class PlayerListComponent implements OnInit {
  
  constructor(private user: UserInfo, private utilSvc: UtilSvc, private dataSvc: DataSvc){};

  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  item                : PlayerData = {
    id          : 0,
    firstName   : "",
    lastName    : "",
    handed      : Player.DEFAULT_HANDED_TYPE,
    gender      : Player.DEFAULT_GENDER_TYPE,
    notes       : "",
    createdOn   : this.utilSvc.formatDate()
  };
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
        this.utilSvc.setUserMessage("noPlayersFound");
        this.utilSvc.displayUserMessages();
        this.itemList = [];
        this.formOpen = true;
        this.formWasOpen = true;
      });
    }
  }
  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var pData : PlayerData = <PlayerData>{};
    var action = "";
    var msg = "", msgId = "";

    this.clearRequestStatus();
    if(form.invalid){   // can't do anything yet, form still has errors
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.working = true;
    msg = "Player '" + this.item.firstName + " " + this.item.lastName + "'";
    if(this.selectedItem == "999"){   // give new player the next id number
      this.item.id = this.user.profile.getNextPlayerId();
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
    pData.id            = this.item.id;
    pData.firstName     = this.item.firstName;
    pData.lastName      = this.item.lastName;
    pData.handed        = this.item.handed;
    pData.gender        = this.item.gender;
    pData.createdOn     = this.item.createdOn;
    if(this.item.notes != ""){pData.notes = this.item.notes;} // can't store empty string in Database
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
  resetForm(form : NgForm) : void {
    this.selectedItem = "";  // set no selected player
    this.deleteItem   = false;
    this.setItemFields();
    if(form){
      form.reset();
      // the following line thwarts a display problem on mobile(Android) when
      // focus stays with the itemName field after completion of an operation
      // document.getElementById("deleteCheckBox").focus();
    }
  }

  // set the form fields to reflect the selected player or empty
  setItemFields = () => {
    var i = this.getItemListIndex(parseInt(this.selectedItem));

    if(i != 999){
      this.item.id        = this.itemList[i].id;
      this.item.firstName = this.itemList[i].firstName;
      this.item.lastName  = this.itemList[i].lastName;
      this.item.handed    = this.itemList[i].handed;
      this.item.gender    = this.itemList[i].gender;
      this.item.notes     = this.itemList[i].notes;
      this.item.createdOn = this.itemList[i].createdOn;
    }
    else{
      this.item.id        = 0;
      this.item.firstName = "";
      this.item.lastName  = "";
      this.item.handed    = Player.DEFAULT_HANDED_TYPE;
      this.item.gender    = Player.DEFAULT_GENDER_TYPE;
      this.item.notes     = "";
      this.item.createdOn = this.utilSvc.formatDate();
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
    return this.requestStatus.length !== 0;
  }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
