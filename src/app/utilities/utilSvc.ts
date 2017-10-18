
  //SERVICE to perform various UTILITY functions
import { Injectable } from '@angular/core';
import { StateService } from "@uirouter/angular";
import { ToasterService, Toast, BodyOutputType } from 'angular2-toaster';
import { AboutStatus, UserInfo } from '../app.globals';
import { ModalComponent } from '../modal/modal.component';

@Injectable()
export class UtilSvc {

    constructor(private user: UserInfo, private stateService: StateService, private aboutStatus: AboutStatus,
      private toasterService: ToasterService, private modalSvc: ModalComponent) {
    }

    // scroll to top of window
    scrollToTop = () => {
      document.body.style.overflowY ="scroll";
      document.body.style.height = "auto";
      setTimeout( () => {
        document.body.style.height = "";
        document.body.style.overflowY = "";
      },50);
    }

    //emit a custom event with the given name and detail data (if any)
    emitEvent(name : string, data? : any) : void {
      document.dispatchEvent(new CustomEvent(name, {detail: data}));
    }

    // return a random integer from 0 upto but not icluding the given value
    randomIndex(maxVal: number) : number {
      return Math.floor(Math.random() * maxVal);
    };

    // format a given date to hh:mm a
    formatTime(t?: Date) : string {
      var dt    : Date    = t ? new Date(t) : new Date();
      var h     : number  = dt.getHours();
      var m     : number  = dt.getMinutes();
      var ampm  : string  = "AM";    
      var fd    : string;

      if( h > 11 ){
        ampm = "PM";
        if( h > 12){
          h -= 12;
        }
      }
      fd = ((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + " " + ampm);
      return fd;
    };

    // format a given date to MM/dd/yyyy
    formatDate(d?: Date) : string {
      var dt    : Date    = d ? new Date(d) : new Date();
      var month : number  = dt.getMonth() + 1;
      var day   : number  = dt.getDate();
      var year  : number  = dt.getFullYear();
      var fd    : string;

      fd = ((month < 10 ? "0" : "") + month + "/" + (day < 10 ? "0" : "") + day + "/" + year);
      return fd;
    };

    // create a date-time string for sorting as yyyyMMddhhmm from the given date and time fields
    formatSortDate(d?: any, t?: string) : string {
      var dt    : Date;
      var year  : number;
      var month : number;
      var day   : number;
      var h     : number;
      var m     : number;
      var fd    : string;

      if(d){
        dt = t ? new Date(d + ' ' + t) : new Date(d);
      } else {
        dt = new Date();    // no date, use current time
      }
      year = dt.getFullYear();
      month = dt.getMonth() + 1;
      day = dt.getDate();
      h = dt.getHours();
      m = dt.getMinutes();
      fd = (year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day + 
              (h < 10 ? "0" : "") + h + (m < 10 ? "0" : "") + m);
      return fd;
    };

    //set an item in the user.message object so the corresponding message can be displayed
    setUserMessage(msg: string, text?: string) : void {
      if (this.user.messages === null){
        this.user.messages = {};
      } 
      this.user.messages[msg] = text ? text : true;
    };

    //display the given message now
    displayThisUserMessage(msg: string) : void {
      this.setUserMessage(msg);
      this.displayUserMessages();
    };

    //display a toast for each message in user.messages object
    displayUserMessages() : void {
      if ((this.user.messages !== null) && (!this.user.messageOpen)) {
        var self = this;
        var msgArray = Object.getOwnPropertyNames(this.user.messages);  //get messages from object to array
        if (msgArray.length) {    //if there are any messages left...
          var msgText = "";
          var msgType = 'info';
          var msgDuration = 2000;
          var key = msgArray[0];  //get next message from messages object
          switch (key) {          //decide which message to display
            case 'signInSuccess':
              msgText = "You're in!";
              msgType = 'success';
              break;
            case 'signOutSuccess':
              msgText = "You're out...";
              msgType = 'success';
              break;
            case 'noProfile':
              msgText = "Unable to create user profile.";
              msgType = 'error';
              break;
            case 'signInToLog':
              msgText = "Please sign in to log a match.";
              msgDuration = 2500;
              break;
            case 'signInToReview':
              msgText = "Please sign in to review matches.";
              msgDuration = 2500;
              break;
            case 'signInToAccessLists':
              msgText = "Please sign in to manage lists.";
              msgDuration = 2500;
              break;
            case 'signInToAccessAccount':
              msgText = "Please sign in for account access.";
              msgDuration = 2500;
              break;
            case 'profileUpdated':
              msgText = "Profile successfully updated.";
              msgType = 'success';
              break;
            case 'matchLogSaved':
              msgText = "Match log saved.";
              msgType = 'success';
              break;
            case 'noMatchLogsToResume':
              msgText = "No match logs to resume.";
              msgType = 'warning';
              break;
            case 'databaseAccessError':
              msgText = "Database access error";
              msgType = 'error';
              break;
            case 'listItemAdded':
              msgType = 'success';
              msgText = this.user.messages[key]+" added to list.";
              break;
            case 'listItemUpdated':
              msgText = this.user.messages[key]+" updated.";
              msgType = 'success';
              break;
            case 'listItemRemoved':
              msgText = this.user.messages[key]+" removed from list.";
              msgType = 'success';
              break;
            case 'noMatchesFound':
              msgText = "No matches found for given search values.";
              msgType = 'warning';
              break;
            case 'errorReadingMatchesTable':
              msgText = "Error reading Matches table.";
              msgType = 'error';
              break;
            case 'profileUpdateFail':
              msgText = "Profile not updated.";
              msgType = 'error';
              break;
            case 'emailChanged':
              msgText = "Your email address has been changed.";
              msgType = 'success';
              break;
            case 'emailChangeFailed':
              msgText = "Email not changed.";
              msgType = 'error';
              break;
            case 'profileEmailChangeFailed':
              msgText = "Email changed but not in profile.";
              msgType = 'error';
              break;
            case 'passwordChanged':
              msgText = "Your password has been changed.";
              msgType = 'success';
              break;
            case 'passwordChangeFailed':
              msgText = "Password not changed.";
              msgType = 'error';
              break;
            case 'accountDeleted':
              msgText = "Your account has been deleted.";
              msgType = 'success';
              break;
            case 'accountDeleteFailed':
              msgText = "Account not deleted.";
              msgType = 'error';
              break;
            case 'profileDeleteFail':
              msgText = "Unable to delete user profile.";
              msgType = 'error';
              break;
            case 'dataDeleteFail':
              msgText = "Unable to delete user data.";
              msgType = 'error';
              break;
            case 'pointDeleted':
              msgText = "Point Deleted";
              msgType = 'success';
              break;
            case 'errorReadingPlayerList':
              msgText = "Error reading player list.";
              msgType = 'error';
              break;
            case 'noPlayersFound':
              msgText = "No player list found.";
              msgType = 'warning';
              break;
            case 'noTournamentsFound':
              msgText = "No tournament list found.";
              msgType = 'warning';
              break;
            case 'noLocationsFound':
              msgText = "No location list found.";
              msgType = 'warning';
              break;
            case 'noEventsFound':
              msgText = "No event list found.";
              msgType = 'warning';
              break;
            case 'errorUpdatingTournamentList':
              msgText = "Tournament List not updated.";
              msgType = 'error';
              break;
            case 'errorUpdatingEventList':
              msgText = "Event List not updated.";
              msgType = 'error';
              break;
            case 'errorUpdatingLocationList':
              msgText = "Location List not updated.";
              msgType = 'error';
              break;
            case 'errorUpdatingPlayerList':
              msgText = "Player List not updated.";
              msgType = 'error';
              break;
            case 'errorDeletingMatch':
              msgText = "Match not deleted.";
              msgType = 'error';
              break;
            case 'errorSavingMatch':
              msgText = "Match not saved.";
              msgType = 'error';
              break;
            case 'nothingToSave':
              msgText = "No points logged. Match not saved.";
              msgType = 'warning';
              break;
            case 'noWriteAccess':
              msgText = "This account has no WRITE access.";
              msgType = 'error';
              msgDuration = 2500;
              break;
            default:
          }
          var toast: Toast = {
            type: msgType,
            timeout: msgDuration,
            // title: 'Here is a Toast Title',
            body: msgText
            // body: "<div class='app-toast-msg'>" + msgText + "</div>",
            // bodyOutputType: BodyOutputType.TrustedHtml
          };
          this.user.messageOpen = true;
          this.toasterService.pop(toast);
          setTimeout(() => {
            delete this.user.messages[key];   //remove this message
            this.user.messageOpen = false;
            self.displayUserMessages();     //see if there are any more messages
          }, msgDuration)
        } 
      }
    };

    //set the current help context
    setCurrentHelpContext(help: string) : void {
      this.aboutStatus.context = help;
    };

    // switch to home state after setting the given user message
    returnToHomeMsg(msg: string, delay?: number) : void {
      this.setUserMessage(msg);
      this.returnToHomeState(delay);
    };

    // switch states to the prior state after "delay" milliseconds
    returnToHomeState(delay = 100) : void {
      var self = this;
      setTimeout(function () {
        self.stateService.go("home");
        }, delay);
    };

    // Define a function to issue a confirmation dialog
    // return a Promise
    getConfirmation(title: string, content: string, okText: string, cancelText = "Cancel") : Promise<any> {
      return this.showDialog(title, content, cancelText, okText);
    };

    // Define a function to issue a notice dialog
    // return a Promise
    giveNotice(title: string, content: string, okText: string) : Promise<any> {
      return this.showDialog(title, content, "", okText);
    };

    // display the ConfirmDialog template according to the given parameters
    // returns: Promise
    showDialog(title: string, content: string, cancelText: string, okText: string) : Promise<any> {
      return this.modalSvc.open(title, content, cancelText, okText);
    }
}
