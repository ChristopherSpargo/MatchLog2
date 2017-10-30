import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./account/login.component";
import { EventListComponent } from "./lists/event.list.component";
import { PlayerListComponent } from "./lists/player.list.component";
import { TournamentListComponent } from "./lists/tournament.list.component";
import { LocationListComponent } from "./lists/location.list.component";
import { AccountProfileComponent } from "./account/account.profile.component";
import { AccountEmailComponent } from "./account/account.email.component";
import { AccountPasswordComponent } from "./account/account.password.component";
import { AccountDeleteComponent } from "./account/account.delete.component";
import { LogsViewComponent } from "./logs/logs.view.component";
import { LogsCreateComponent } from "./logs/logs.create.component";

/** States */
export const homeState = { name: 'home', url: '/home',  component: HomeComponent };
export const loginState = { name: 'login', url: '/login',  component: LoginComponent };
export const manageEventsState = { name: 'manageEvents', url: '/manage-events',  component: EventListComponent };
export const managePlayersState = { name: 'managePlayers', url: '/manage-events',  component: PlayerListComponent };
export const manageTournamentsState = { name: 'manageTournaments', url: '/manage-tournaments',  component: TournamentListComponent };
export const manageLocationsState = { name: 'manageLocations', url: '/manage-locations',  component: LocationListComponent };
export const accountProfileState = { name: 'accountProfile', url: '/account-profile',  component: AccountProfileComponent };
export const accountEmailState = { name: 'accountEmail', url: '/account-email',  component: AccountEmailComponent };
export const accountPasswordState = { name: 'accountPassword', url: '/account-password',  component: AccountPasswordComponent };
export const accountDeleteState = { name: 'accountDelete', url: '/account-delete',  component: AccountDeleteComponent };
export const logsViewState = { name: 'logsView', url: '/logs-view',  component: LogsViewComponent };
export const logsViewPublicState = { name: 'viewPublicLogs', url: '/logs-view-public',  component: LogsViewComponent };
export const logsManagePublicState = { name: 'managePublicLogs', url: '/logs-manage-public',  component: LogsViewComponent };
export const logsCreateState = { name: 'logsCreate', url: '/logs-create',  component: LogsCreateComponent };
export const logsResumeState = { name: 'logsResume', url: '/logs-resume',  component: LogsCreateComponent };
