import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { DataSvc } from '../model/dataSvc'
import { Player, PlayerData, DEFAULT_GENDER_TYPE } from '../model/player'

    // COMPONENT for PROFILE UPDATE feature

@Component({
  templateUrl: 'account.profile.component.html'
})
export class AccountProfileComponent implements OnInit {

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private dataSvc: DataSvc){
  };
    // CONTROLLER for PROFILE UPDATE feature

  profile            : any = {};
  playerList         : PlayerData[] = [];
  playerMenuLabel    : string = "";
  requestStatus      : { [key: string]: any } = {};
  working            : boolean = false;
  formOpen           : boolean = false;

  ngOnInit(){
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      // set initial values for form fields
      this.profile.defaultPlayerId = this.user.profile.defaultPlayerId.toString() || "";
      this.profile.defaultOpponentGender = this.user.profile.defaultOpponentGender || DEFAULT_GENDER_TYPE;

      // update the current help context and open the Profile Update form
      this.utilSvc.setCurrentHelpContext("ProfileUpdate"); //note current state
      this.dataSvc.getPlayers()
      .then((list : PlayerData[]) => {
        this.playerList = list;
        this.playerList.sort((a,b) : number => {return a.lastName < b.lastName ? -1 : 1;});
        this.playerMenuLabel = this.playerList.length == 0 ? "No Players" : "Players";
        this.utilSvc.displayUserMessages();
        this.formOpen = true;
      })
      .catch((error) => {
        this.utilSvc.displayThisUserMessage("noPlayersFound");
        this.playerMenuLabel = "No Players";
        this.formOpen = true;
      });
    }
  }

  // send profile update request to Data service
  submitRequest(form : NgForm) : void {
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.user.profile.defaultPlayerId =  parseInt(this.profile.defaultPlayerId,10);
    this.user.profile.defaultOpponentGender = this.profile.defaultOpponentGender;
    this.working = true;
    this.dataSvc.updateUserProfile(this.user)
    .then((success) => {
      this.utilSvc.displayThisUserMessage("profileUpdated");
      this.closeForm();
    })
    .catch((failure) => {
      this.utilSvc.displayThisUserMessage("profileUpdateFail");
      this.closeForm();
    })
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
