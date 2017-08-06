import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { DataSvc } from '../model/dataSvc'
import { CookieSvc } from '../utilities/cookieSvc';

    // COMPONENT for CHANGE EMAIL feature

@Component({
  templateUrl: 'account.email.component.html'
})
export class AccountEmailComponent implements OnInit {

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private dataSvc: DataSvc,
              private cookieSvc: CookieSvc){
  };
    
    // CONTROLLER for CHANGE EMAIL address feature

  currEmail          : string = this.user.userEmail;
  password           : string = "";
  newEmail           : string = "";
  requestStatus      : { [key: string]: any } = {};
  rememberLogin      : boolean = (this.currEmail == this.cookieSvc.getCookieItem('userEmail'));
  working            : boolean = false;
  formOpen           : boolean = false;

  ngOnInit() {
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      //update the current help context and open the Email Change form
      this.utilSvc.setCurrentHelpContext("ChangeEmail"); //note current state
      this.utilSvc.displayUserMessages();
      setTimeout( () => {
        this.formOpen = true;}, 300);
    }
  }

  //finish up Email Change process.  Update user's cookie and profile.  Report status message.
  reportEmailChange() {
    this.user.userEmail = this.user.profile.email = this.newEmail;
    if (this.rememberLogin) {
      this.cookieSvc.setCookieItem('userEmail', this.user.userEmail);
    }
    this.dataSvc.updateUserProfile(this.user)
    .then((success) => {
      this.utilSvc.displayThisUserMessage("emailChanged");
      this.closeForm();
    })
    .catch((failure) => {
      this.utilSvc.displayThisUserMessage("profileEmailChangeFailed");
      this.closeForm();
    })
  }

  //send change email request to Firebase service
  submitRequest(form : NgForm) {
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.working = true;
    this.dataSvc.changeEmail(this.currEmail, this.password, this.newEmail)
    .then((success) => {
      this.reportEmailChange();
    })
    .catch((error) => {
      switch (error) {  //decide which status message to give
        case "EMAIL_TAKEN":
          this.requestStatus.emailInUse = true;
          break;
        case "INVALID_EMAIL":
          this.requestStatus.emailInvalid = true;
          break;
        case "INVALID_PASSWORD":
          this.requestStatus.incorrectPassword = true;
          break;
        case "INVALID_USER":
          this.requestStatus.unrecognizedEmail = true;
          break;
        default:
          this.utilSvc.displayThisUserMessage("emailChangeFailed");
      }
      this.requestStatus.emailChangeFail = true;
      this.working = false;
    });
  }

  // clear status messages object
  clearRequestStatus= ()=> {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  //set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = ()=>  {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}