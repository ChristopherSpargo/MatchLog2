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
import { SlideoutStatus, UserInfo, AboutStatus, CurrentMatch } from './app.globals';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AboutHeadingComponent } from './directives/about.heading.component';
import { AboutTextIconComponent } from './directives/about.text.icon.component';
import { AboutMatchLogComponent } from './about/about.matchlog.component';
import { AboutContactUsComponent } from './about/about.contact.us.component';
import { AboutLoginComponent } from './about/about.login.component';
import { AboutManagePlayersComponent } from './about/about.manage.players.component';
import { AboutManageEventsComponent } from './about/about.manage.events.component';
import { AboutManageTournamentsComponent } from './about/about.manage.tournaments.component';
import { AboutManageLocationsComponent } from './about/about.manage.locations.component';
import { AboutAccountProfileComponent } from './about/about.account.profile.component';
import { AboutAccountEmailComponent } from './about/about.account.email.component';
import { AboutAccountPasswordComponent } from './about/about.account.password.component';
import { AboutAccountDeleteComponent } from './about/about.account.delete.component';
import { AboutLogSearchComponent } from './about/about.log.search.component';
import { AboutLogViewMenuComponent } from './about/about.log.view.menu.component';
import { AboutLogResumeComponent } from './about/about.log.resume.component';
import { AboutLogPointInfoComponent } from './about/about.log.pointInfo.component';
import { AboutLogViewComponent } from './about/about.log.view.component';
import { AboutLogReviewEditComponent } from './about/about.log.review.edit.component';
import { AboutLogSetupComponent } from './about/about.log.setup.component';
import { AboutManagePublicLogsComponent } from './about/about.manage.public.logs.component';
import { AboutManagePublicSettingsComponent } from './about/about.manage.public.settings.component';
import { AboutMakeLogPublicComponent } from './about/about.make.log.public.component';
import { AboutPointFilterComponent } from './about/about.point.filter.component';
import { LoginComponent } from './account/login.component';
import { EventListComponent } from './lists/event.list.component';
import { PlayerListComponent } from './lists/player.list.component';
import { TournamentListComponent } from "./lists/tournament.list.component";
import { LocationListComponent } from "./lists/location.list.component";
import { AccountProfileComponent } from "./account/account.profile.component";
import { AccountEmailComponent } from "./account/account.email.component";
import { AccountPasswordComponent } from "./account/account.password.component";
import { AccountDeleteComponent } from "./account/account.delete.component";
import { LogsViewComponent } from "./logs/logs.view.component";
import { LogsViewMenuComponent } from "./logs/logs.view.menu.component";
import { LogsViewSearchComponent } from "./logs/logs.view.search.component";
import { LogsDisplayComponent } from "./logs/logs.display.component";
import { AppStatItemComponent } from './directives/app.stat.item.component';
import { AppStatCategoryComponent } from './directives/app.stat.category.component';
import { AppStatItemBreakdownComponent } from './directives/app.stat.item.breakdown.component';
import { AppPointItemComponent } from './directives/app.point.item.component';
import { LogsCreateComponent } from "./logs/logs.create.component";
import { LogsCreateInfoComponent } from "./logs/logs.create.info.component";
import { LogsPointInfoComponent } from "./logs/logs.pointInfo.component";
import { FormFooterButtonComponent } from "./directives/form.footer.button.component";
import { loginState, homeState, manageEventsState, managePlayersState, manageTournamentsState,
         manageLocationsState, accountProfileState, accountEmailState, accountPasswordState,
         accountDeleteState, logsViewState, logsCreateState, logsResumeState, logsManagePublicState,
         logsViewPublicState } from "./states";
import { ModalComponent } from './modal/modal.component';
import { SimpleModalComponentTemplate } from './modal/simple.modal.component.template';
import { MatchActionModalComponentTemplate } from './modal/match.action.modal.component.template';
import { PublicMatchSettingsModalComponentTemplate } from './modal/public.match.settings.modal.component.template';
import { LogsPointFilterModalComponentTemplate } from './modal/logs.point.filter.modal.component.template';
import { UtilSvc } from './utilities/utilSvc';
import { CookieSvc } from './utilities/cookieSvc';
import { FireBaseSvc } from './utilities/fireBaseSvc';
import { AWSModule } from './model/AWSModule';
import { DataSvc } from './model/dataSvc';
import { GraphsSvc } from './model/graphsSvc';
import { FormHeaderComponent } from './directives/form.header.component';
import { IconInputComponent } from './directives/icon.input.component';
import { IconTextareaComponent } from './directives/icon.textarea.component';
import { ListItemFieldComponent } from './directives/list.item.field.component';
import { UpdateActionsComponent } from './directives/update.actions.component';
import { ValidationMessageComponent, ValidationMessagesComponent } from './directives/error.messages.component';
import { RegisterFormControlDirective } from './directives/register.control';
import { AppMessageComponent, AppMessagesComponent } from './directives/app.messages.component';
import { DeleteEntryComponent } from './directives/delete.entry.component';
import { FormMessagesComponent } from './directives/form.messages.component';
import { AppFabComponent } from './directives/app.fab.component';
import { RadioGroupComponent } from './directives/radio.group.component';

const INITIAL_STATES =  [ homeState, loginState, manageEventsState, managePlayersState, manageTournamentsState,
    manageLocationsState, accountProfileState, accountEmailState, accountPasswordState, accountDeleteState,
    logsViewState, logsCreateState, logsResumeState, logsViewPublicState, logsManagePublicState ];
const INITIAL_COMPONENTS =  [ AppComponent, HomeComponent, LoginComponent, FormHeaderComponent, IconInputComponent,
  ValidationMessageComponent, ValidationMessagesComponent, RegisterFormControlDirective, AppMessagesComponent,
  IconTextareaComponent, AppMessageComponent, ModalComponent, 
  SimpleModalComponentTemplate, MatchActionModalComponentTemplate, PublicMatchSettingsModalComponentTemplate,
  LogsPointFilterModalComponentTemplate,
  EventListComponent, ListItemFieldComponent, FormFooterButtonComponent,
  UpdateActionsComponent, DeleteEntryComponent, FormMessagesComponent, AppFabComponent,
  PlayerListComponent, TournamentListComponent,
  LocationListComponent, AccountProfileComponent, AccountEmailComponent, AccountPasswordComponent,
  AccountDeleteComponent, AboutComponent, AboutHeadingComponent, AboutTextIconComponent, AboutMatchLogComponent,
  AboutLoginComponent, AboutManagePlayersComponent, AboutManageEventsComponent, AboutManageTournamentsComponent,
  AboutManageLocationsComponent, AboutContactUsComponent, AboutAccountProfileComponent, AboutAccountEmailComponent,
  AboutAccountPasswordComponent, AboutAccountDeleteComponent, LogsViewComponent, LogsViewMenuComponent,
  LogsViewSearchComponent, LogsDisplayComponent, AppStatItemComponent, AppStatCategoryComponent,
  AppPointItemComponent, AppStatItemBreakdownComponent, RadioGroupComponent, LogsCreateComponent,
  LogsCreateInfoComponent, LogsPointInfoComponent, 
  AboutLogSearchComponent, AboutLogViewMenuComponent,
  AboutLogResumeComponent, AboutLogPointInfoComponent, AboutLogReviewEditComponent, AboutLogViewComponent,
  AboutLogSetupComponent, AboutPointFilterComponent, AboutManagePublicLogsComponent,
  AboutMakeLogPublicComponent, AboutManagePublicSettingsComponent ];

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
  entryComponents: [SimpleModalComponentTemplate, MatchActionModalComponentTemplate,
                    PublicMatchSettingsModalComponentTemplate, LogsPointFilterModalComponentTemplate],
  providers: [SlideoutStatus, UserInfo, ModalComponent, UtilSvc, ToasterService, DataSvc, AWSModule, CookieSvc,
              FireBaseSvc, AboutStatus, GraphsSvc, CurrentMatch],
      //  {provide: HAMMER_GESTURE_CONFIG, useClass: AppHammerConfig}],
  bootstrap: [AppComponent]
})
export class AppModule { }
