import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import {UIROUTER_DIRECTIVES} from '@uirouter/angular';
import { UtilSvc } from '../utilities/utilSvc';
import { CookieSvc } from '../utilities/cookieSvc';
import { UserInfo } from '../app.globals';
import { Profile } from '../model/profile'
import { DataSvc } from '../model/dataSvc'

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  formOpen              : boolean = false;
  userEmail             : string = '';
  userPassword          : string = '';
  passwordConfirm       : string = '';
  requestStatus         : { [key: string]: any } = {};
  createAccount         : boolean = false;
  newAccount            : boolean = false;
  rememberLogin         : boolean = true;
  working               : boolean = false;

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private cookieSvc: CookieSvc,
              private dataSvc: DataSvc){
  };

  ngOnInit() {

     this.utilSvc.displayUserMessages();
     this.utilSvc.setCurrentHelpContext("Login"); //note current state
     // determine if user is loggin in or logging out
     if (this.user.authData) { //user needs to log out
         this.user.authData = null;
         this.user.profile = Profile.build();
         this.utilSvc.setUserMessage("signOutSuccess");
         this.cancelLogin();
     }
     else { // user needs to log in
         this.userEmail = "";
         this.userPassword = "";

         // fetch email and password from cookie if possible
         this.userEmail = this.cookieSvc.getCookieItem('userEmail');
         if (this.userEmail != "") {
           this.userPassword = this.cookieSvc.getCookieItem('password');
         }
         // update the current help context and open the Login form
         this.formOpen = true;
     }
  }

      // finish up Login process.  Update user's cookie and read user's profile.  Report status message.
      reportLogin(authData : any) : void {
       this.user.userEmail = this.userEmail;
       this.user.password = this.userPassword;
       this.user.authData = authData;
       this.utilSvc.setUserMessage("signInSuccess");
       if (this.rememberLogin) {
         this.cookieSvc.setCookieItem('password', this.user.password);
         this.cookieSvc.setCookieItem('userEmail', this.user.userEmail);
       } else {
         this.cookieSvc.setCookieItem('password', "");
         this.cookieSvc.setCookieItem('userEmail', "");
       }
       this.dataSvc.readUserProfile(this.user)
       .then((profile) => {
         // maybe check here for difference in email in profile and login to correct error in 
         // Change Email updating profile. 
         this.user.profile = profile;
       })
       .catch((failure) => {  // no profile yet, create a profile
           this.user.profile = Profile.build();     // no profile yet, create a profile
           this.user.profile.id = authData.uid;
           this.user.profile.email = this.user.userEmail;
           this.dataSvc.createUserProfile(this.user)
           .then((profile) => {
             this.user.profile = <Profile>profile;
           })
           .catch((failure) => {
             this.utilSvc.setUserMessage("noProfile");
           })
       });
       this.working = false;
       this.closeForm();
     }

      // send login request to Firebase service
      sendLoginRequest(form : NgForm) : void {
        this.clearRequestStatus();
        if(form.invalid){
          this.requestStatus.formHasErrors = true;
          return;
        }
        this.working = true;
       if (this.createAccount && !this.newAccount) {  // creating new account
         this.dataSvc.createAccount(this.userEmail, this.userPassword)
         .then((success) => {
           this.requestStatus.createSuccess = true;
           this.requestStatus.accountCreated = true;
           this.newAccount = true;
           this.working = false;
         })
         .catch((failure) => {
           this.requestStatus.createFail = true;
           switch (failure) {
             case "EMAIL_TAKEN":
               this.requestStatus.emailInUse = true;
               break;
             case "INVALID_EMAIL":
               this.requestStatus.emailInvalid = true;
               break;
             default:
           }
           this.working = false;
         })
       }
       else {  // logging in
         this.dataSvc.authWithPassword(this.userEmail, this.userPassword)
         .then((authData) => {
           this.reportLogin(authData);
         })
         .catch((error) => {
           switch (error) {  // decide which message to give
             case "INVALID_USER":
               this.requestStatus.unrecognizedEmail = true;
               break;
             default:
               this.requestStatus.incorrectPassword = true;
           }
           this.requestStatus.authFail = true;
           this.user.authData = null;
           this.working = false;
         })
       }
     }

     // user got their password wrong and has clicked the FORGOT PASSWORD button
     // confirm that this is the case and allow them to receive an email with a temporary password
     requestPasswordReset(ev) : void {
       this.clearRequestStatus();
       this.utilSvc.getConfirmation('Forgot Password:', 'You can receive an email containing a temporary password '+
         'that you can use to log in.  You can then set your password to something else.' +
         '  Or, you can try to sign in again now.','Send Email','Try Again')
       .then(function () {
         this.working = true;
         this.dataSvc.resetPassword(this.userEmail)
         .then((success) => {
           this.requestStatus.passwordResetSent = true;
           this.requestStatus.enterTempPassword = true;
           this.haveStatusMessages = true;
         })
         .catch((error) => {
           switch (error) {  //decide which message to give
             case "INVALID_USER":
               this.requestStatus.unrecognizedEmail = true;  //this probably should not happen
               break;
             default:
           }
           this.requestStatus.passwordResetFail = true;
           this.haveStatusMessages = true;
         })
       });
       this.working = false;
     }


  cancelLogin = ()=> {
    this.utilSvc.returnToHomeState();
  }
     // clear status messages object
  clearRequestStatus= ()=> {
    this.requestStatus = {};
  }

  // determine if fields for new account should be showing in Login form
  showNewAccountFields = ()=> {
    return (this.createAccount && !this.newAccount);
  }


  // reset some fields associated with a new account
  clearNewAccountFields = ()=> {
    this.clearRequestStatus();
    this.passwordConfirm = "";
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return this.requestStatus.length !== 0;
  }

  //set form closed flag, wait for animation to complete before changing states
  closeForm = ()=>  {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
