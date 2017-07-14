import { Injectable } from '@angular/core';
import { Profile } from './model/profile';

@Injectable()
export class SlideoutStatus {
  slidenavOpen      : boolean = false;
  aboutMenuOpen     : boolean = false;
  accountMenuOpen   : boolean = false;
  logsMenuOpen      : boolean = false;
  listsMenuOpen     : boolean = false;
  aboutOpen         : boolean = false;
}

@Injectable()
export class UserInfo {
    userEmail   : string  = "";
    password    : string  = "";
    authData    : any     = null;
    profile     : Profile;
    messages    : any     = null;
    helpContext : string  = "MatchLog";   //current context for help information
}
