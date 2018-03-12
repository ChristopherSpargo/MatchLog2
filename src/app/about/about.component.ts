
import { Component } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';
import { AboutStatus, UserInfo } from '../app.globals';

export const HelpContextTitles = {
      UsingMatchLog       : ['assignment','Using MatchLogs'],
      MatchLogSearch      : ['search','Searching for Match Logs'],
      MatchLogMenu        : ['search','Selecting Match Logs'],
      ManagePublicLogsMenu: ['settings_applications','Managing Public Logs'],
      MakeLogPublic       : ['add_circle_outline','Adding a Public Match'],
      ManagePublicSettings: ['settings_applications','Managing Public Settings'],
      ViewMatchStatistics : ['search','Viewing Match Statistics'],
      ProfileUpdate       : ['folder_open','Updating Your Profile'],
      ChangeEmail         : ['folder_open','Changing Your Email Address'],
      ChangePassword      : ['folder_open','Changing Your Password'],
      DeleteAccount       : ['folder_open','Deleting Your Account'],
      Login               : ['person_outline','Signing In'],
      MatchInformation    : ['settings','Entering Setup Information'],
      ResumeMatchLog      : ['play_circle_outline','Resuming a Paused Log'],
      PointInformation    : ['edit','Logging a Point'],
      ReviewEditMatchLog  : ['search','Reviewing/Editing the Log'],
      PointFilter         : ['filter_list','Using the Point Filter'],
      ManagePlayers       : ['list','Managing Players'],
      ManageEvents        : ['list','Managing Events'],
      ManageLocations     : ['list','Managing Locations'],
      ManageTournaments   : ['list','Managing Tournaments'],
      ContactUs           : ['mail_outline','Contacting MatchLogs']
    };

@Component({
  selector: '<about-container>',
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  constructor(private aboutStatus: AboutStatus, private userInfo: UserInfo){};

  aboutOpen = () => {
    return this.aboutStatus.open;
  }

  closeAbout = () => {
    this.aboutStatus.open = false;
  }

  // return current helpContext
  helpContext = () => {
    return this.aboutStatus.context;
  }

  // return the current helpContext title
  helpContextTitle = () => {
    var c = this.helpContext();
    if(c !== undefined){
      return HelpContextTitles[c][1];
    }
    return "";
  }

  // return the current helpContext title
  helpContextIcon = () => {
    var c = this.helpContext();
    if(c !== undefined){
      return HelpContextTitles[c][0];
    }
    return "";
  }
}