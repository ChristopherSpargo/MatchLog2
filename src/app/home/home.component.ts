import { Component, OnInit } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { StateService } from "@uirouter/core";

import { ML_VERSION } from '../constants';
import { UserInfo, SlideoutStatus } from '../app.globals';
import { Profile } from '../model/profile'
import { IMAGE_DIRECTORY, FORM_HEADER_ICON, MAIN_BACKGROUND } from '../constants';
import { HelpContextTitles } from '../about/about.component';
import { UtilSvc } from '../utilities/utilSvc'

@Component({
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
  // ML_VERSION        : string  = "v2.0";
  // slidenavOpen      : boolean = false;
  // aboutMenuOpen     : boolean = false;
  // accountMenuOpen   : boolean = false;
  // logsMenuOpen      : boolean = false;
  // listsMenuOpen     : boolean = false;
  // aboutOpen         : boolean = false;
  formHeaderIcon    : string  = IMAGE_DIRECTORY+FORM_HEADER_ICON;
  mainBackground    : string  = MAIN_BACKGROUND;
  aboutTopic        : string  = "";

  constructor(private sS: SlideoutStatus, private user: UserInfo, private stateService: StateService,
      private utilSvc: UtilSvc){
  }

  ngOnInit() {
    if (!this.user.profile) {                          //if the user doesn't have a profile
      this.user.profile = Profile.build();             //assign them the default profile values
    }
    this.utilSvc.displayUserMessages();
    this.user.helpContext = "MatchLog"; // reset help context to base status
    if(window.matchMedia("(min-width: 768px)").matches){
      this.closeSlidenav();
    }
  }

  toggleSlidenav() {
    this.sS.slidenavOpen = !this.sS.slidenavOpen;
  }

  slidenavOpen = () => {
    return this.sS.slidenavOpen;
  }
  
  aboutMenuOpen = () => {
    return this.sS.aboutMenuOpen;
  }
  
  accountMenuOpen = () => {
    return this.sS.accountMenuOpen;
  }
  
  logsMenuOpen = () => {
    return this.sS.logsMenuOpen;
  }

  listsMenuOpen = () => {
    return this.sS.listsMenuOpen;
  }
  
  aboutOpen = () => {
    return this.sS.aboutOpen;
  }
  
  version = () => {
    return ML_VERSION;
  }

  // return current helpContext
  helpContext() : string {
    return this.aboutTopic ? this.aboutTopic : this.user.helpContext;
  }

  // return user email string
  userEmail() : string {
    return this.user.userEmail;
  }

  // return the current helpContext title
  helpContextTitle() : string {
    return HelpContextTitles[this.helpContext()];
  }

  // the user is logged in if authData is not null
  loggedIn() : boolean {
    return !!this.user.authData;
  }

  // prompt the user for confirmation of log out and switch to login state
  logout(ev : any) : void {
    this.utilSvc.getConfirmation('Signing Out', 'Are you sure you want to Sign Out?', 'Sign Out')
     .then((leave) => {
       this.sS.aboutMenuOpen = false;
       this.sS.accountMenuOpen = false;
       this.stateService.go('login');
     })
     .catch((stay) => {
       if(window.matchMedia("(min-width: 768px)").matches){
         this.closeSlidenav();
       }
     });
  }

  openSlidenav() : void {
      this.sS.slidenavOpen = true;
  }

  closeSlidenav() : void {
      this.sS.slidenavOpen = false;
  }
  
  // Open the about (help) panel. Also, make sure the slidedown menu is closed.
  showAbout(topic : string) : void {
    this.closeSlidenav();
    this.aboutTopic = topic;
    this.openAbout();
  }

  toggleAbout() : void {
    if (this.sS.aboutOpen) {
      this.closeAbout();
    }
    else {
      this.openAbout();
    }
  }

  closeSlideouts() : void {
    this.closeAbout();
    this.closeSlidenav();
  }

  openAbout() : void {
    this.sS.aboutOpen = true;
  }

  toggleLogsMenu() : void {
    this.sS.logsMenuOpen = !this.sS.logsMenuOpen;
  }

  toggleListsMenu() : void {
    this.sS.listsMenuOpen = !this.sS.listsMenuOpen;
  }

  toggleAccountMenu() : void {
    this.sS.accountMenuOpen = !this.sS.accountMenuOpen;
  }

  toggleAboutMenu() : void {
    this.sS.aboutMenuOpen = !this.sS.aboutMenuOpen;
  }

  // switch to the specified state.  Delay if menu open to wait for close animation
  menuItemSelected (newState : string, task? : string) : void {
    var delay = this.sS.slidenavOpen ? 500 : 0;
    this.closeSlidenav();
    setTimeout( () => {
      if(task){
        this.stateService.go(newState, {task: task});
      }
      else {
        this.stateService.go(newState);
      };
    }, delay);
  }

  // close the about (help) panel
  // wait for animation to complete
  closeAbout() : void {
    if (this.sS.aboutOpen) {
      this.sS.aboutOpen = false;
      setTimeout( () => {
        this.aboutTopic = "";
        if(window.matchMedia("(min-width: 768px)").matches){
          this.closeSlidenav();
        }
      }, 600);
    }
  }

}
