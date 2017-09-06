import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { DataSvc, EVENT_TABLE_NAME } from '../model/dataSvc'

    // COMPONENT for MANAGE EVENTS feature

@Component({
  templateUrl: 'event.list.component.html'
})
export class EventListComponent implements OnInit {
  constructor(private user: UserInfo, private utilSvc: UtilSvc, private dataSvc: DataSvc){
  };


  itemName  = "";
  action    = "";

  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  itemList            : string[]  = undefined;
  requestStatus       : { [key: string]: any }  = {};
  working             : boolean   = false;
  formOpen            : boolean   = false;
  formWasOpen         : boolean   = false;

  ngOnInit() {
  // make the user log in to manage lists
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessLists"); // let user know they need to log in
    }
    else{
      // update the current help context and open the Event Management form
      this.utilSvc.setCurrentHelpContext("ManageEvents"); // note current state
      this.utilSvc.displayUserMessages();;
      this.dataSvc.getList(EVENT_TABLE_NAME)
      .then((list) => {
          this.itemList = <string[]>list;
          this.formOpen = true;
          this.formWasOpen = true;
      })
      .catch((error) => {
          this.utilSvc.displayThisUserMessage("noEventsFound");
          this.itemList = [];
          this.formOpen = true;
          this.formWasOpen = true;
      });
    }
  }

  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var msg   : string, 
        msgId : string,
        action: string;

    this.clearRequestStatus();
    if(this.checkForProblems(form)){   // can't do anything yet, form still has errors
      return;
    }
    this.working = true;
    this.itemName = this.newItemName;
    msg = "Event " + "'" + this.itemName + "'";
    // now set the action to perform and the status message for the user
    if(this.selectedItem == "999"){  // user specify new item name?
      msgId = "listItemAdded";
      action = "Add";
    } 
    else {
      if(!this.deleteItem){
        msgId = "listItemUpdated";
        action = "Update";
      } else {
        msgId = "listItemRemoved";
        action = "Remove";
      }
    }
    this.dataSvc.updateList(EVENT_TABLE_NAME, this.itemName, action, parseInt(this.selectedItem))   // send the update
    .then((success) => {
      this.utilSvc.setUserMessage(msgId, msg);
      this.utilSvc.displayUserMessages();
      this.resetForm(form);
      this.dataSvc.getList(EVENT_TABLE_NAME)  // re-read the list
      .then((list) => {
        this.requestStatus.updateSuccess = true;
        this.itemList = <string[]>list;
        this.working = false;
      })
      .catch((error) => {
          this.utilSvc.displayThisUserMessage("errorReadingEventList");
          this.working = false;
      });
    })
    .catch((error) => {
        this.utilSvc.displayThisUserMessage("errorUpdatingEventList");
        this.resetForm(form);
        this.working = false;
    });
  }

  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    setTimeout( () => {
      if(this.selectedItem != "999"){
        this.newItemName = this.itemList[this.selectedItem];
      }
      else{
        this.newItemName = "";
      }
    }, 50);
  }

  // get the form ready for another operation
  resetForm(form : NgForm) : void {
    if(form){
      form.resetForm();
      // document.getElementById("deleteCheckBox").focus();
    }
    this.selectedItem = "";
    this.deleteItem   = false;
    this.newItemName  = "";
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () => {
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

  // return true if there is something wrong with the form input
  checkForProblems(form: NgForm) : boolean {
    if(form.invalid){
       this.requestStatus.formHasErrors = true;
      return true;
    }
    return this.selectedItem == "";
 }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
