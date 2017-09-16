
import { Component } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';
import { AboutStatus, UserInfo } from '../app.globals';

export const HelpContextTitles = {
      UsingMatchLog       : 'Use MatchLog',
      MatchLogSearch      : 'Search for Match Logs',
      MatchLogMenu        : 'Select a Match Log',
      ViewMatchStatistics : 'View Match Statistics',
      ProfileUpdate       : 'Update Profile',
      ChangeEmail         : 'Change Email',
      ChangePassword      : 'Change Password',
      DeleteAccount       : 'Delete Account',
      Login               : 'Sign In',
      MatchInformation    : 'Enter Setup Information',
      ResumeMatchLog      : 'Resume a Match Log',
      PointInformation    : 'Enter Point Data',
      ReviewEditMatchLog  : 'Review/Edit the Log',
      ManagePlayers       : 'Manage Players',
      ManageEvents        : 'Manage Events',
      ManageLocations     : 'Manage Locations',
      ManageTournaments   : 'Manage Tournaments',
      ContactUs           : 'Contact MatchLog'
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
    return HelpContextTitles[this.helpContext()];
  }
}