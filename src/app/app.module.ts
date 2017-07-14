import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UIRouterModule } from "@uirouter/angular";
import { uiRouterConfigFn } from "./router.config";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { AppHammerConfig } from './app.hammer.config';

import { AppComponent } from './app.component';
import { SlideoutStatus, UserInfo } from './app.globals';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './account/login.component';
import { EventListComponent } from './lists/event.list.component';
import { PlayerListComponent } from './lists/player.list.component';
import { TournamentListComponent } from "./lists/tournament.list.component";
import { LocationListComponent } from "./lists/location.list.component";
import { AccountProfileComponent } from "./account/account.profile.component";
import { AccountEmailComponent } from "./account/account.email.component";
import { AccountPasswordComponent } from "./account/account.password.component";
import { AccountDeleteComponent } from "./account/account.delete.component";
import { loginState, homeState, manageEventsState, managePlayersState, manageTournamentsState,
         manageLocationsState, accountProfileState, accountEmailState, accountPasswordState,
         accountDeleteState } from "./states";
import { ModalComponentTemplate, ModalComponent } from './modal/modal.component'
import { UtilSvc } from './utilities/utilSvc'
import { CookieSvc } from './utilities/cookieSvc'
import { FireBaseSvc } from './utilities/fireBaseSvc'
import { AWSModule } from './model/AWSModule'
import { DataSvc } from './model/dataSvc'
import { FormHeaderComponent } from './directives/form.header.component'
import { IconInputComponent } from './directives/icon.input.component'
import { ListItemFieldComponent } from './directives/list.item.field.component'
import { UpdateActionsComponent } from './directives/update.actions.component'
import { ValidationMessageComponent, ValidationMessagesComponent } from './directives/error.messages.component';
import { RegisterFormControlDirective } from './directives/register.control';
import { AppMessageComponent, AppMessagesComponent } from './directives/app.messages.component';
import { DeleteEntryComponent } from './directives/delete.entry.component';
import { FormMessagesComponent } from './directives/form.messages.component';

let INITIAL_STATES =  [ homeState, loginState, manageEventsState, managePlayersState, manageTournamentsState,
    manageLocationsState, accountProfileState, accountEmailState, accountPasswordState, accountDeleteState ];
let INITIAL_COMPONENTS =  [ AppComponent, HomeComponent, LoginComponent, FormHeaderComponent, IconInputComponent,
  ValidationMessageComponent, ValidationMessagesComponent, RegisterFormControlDirective, AppMessagesComponent,
  AppMessageComponent, ModalComponent, ModalComponentTemplate, EventListComponent, ListItemFieldComponent,
  UpdateActionsComponent, DeleteEntryComponent, FormMessagesComponent, PlayerListComponent, TournamentListComponent,
  LocationListComponent, AccountProfileComponent, AccountEmailComponent, AccountPasswordComponent,
  AccountDeleteComponent, AboutComponent ];

@NgModule({
  declarations: INITIAL_COMPONENTS,
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    UIRouterModule.forRoot({ states: INITIAL_STATES, useHash: true, config: uiRouterConfigFn }),
    ToasterModule,
    HttpModule
  ],
  entryComponents: [ModalComponentTemplate],
  providers: [SlideoutStatus, UserInfo, ModalComponent, UtilSvc, ToasterService, DataSvc, AWSModule, CookieSvc, 
      FireBaseSvc, {provide: HAMMER_GESTURE_CONFIG, useClass: AppHammerConfig}],
  bootstrap: [AppComponent]
})
export class AppModule { }
