import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentMatch } from '../app.globals';
import { PUBLIC_USER_ID } from '../constants';
import { DataSvc, PLAYER_TABLE_NAME, TOURNAMENT_TABLE_NAME } from '../model/dataSvc';
import { Match } from '../model/match';
import { PlayerData, DEFAULT_GENDER_TYPE } from '../model/player';

@Component({
  selector: '<app-logs-view-menu>',
  templateUrl: 'logs.view.menu.component.html'
})
export class LogsViewMenuComponent implements OnInit, OnDestroy {

  @Input() matchMenuOpen    : boolean;    // indicates this panel should open
  @Input() viewPublics      : boolean = false;  // indicates user is viewing public matches
  @Input() managePublics    : boolean = false;  // indicates manage public matches feature being used
  @Input() playerName       : Function;   // function to return player name from player id
  @Input() constructMatchesMessage  : Function;  // function to format matchesMessage

  selectAll                 : boolean = false; // toggle for selecting/unselecting all matches
  publicFilter              : string = "Either" // select for which matches are shown in manage public matches
  multiMode                 : string = "Combine";     // mode for handling multiple selections (Combine or Trends)
  menuMatchList             : Match[] = [];    // working list of matches 
  matchSelectFlags          : boolean [] = []; // selection status for each match in matchList

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private dataSvc : DataSvc,
              private currentMatch: CurrentMatch){};

  ngOnInit() {
    document.addEventListener("matchesFound", this.setMenuLists);
    document.addEventListener("reverseMatchMenu", this.toggleSortOrder);
    this.setMenuLists();
  }
  ngOnDestroy() {
    document.removeEventListener("matchesFound", this.setMenuLists);
    document.removeEventListener("reverseMatchMenu", this.toggleSortOrder);
  }

  public setMenuLists = (e? : any) => {
    this.menuMatchList = this.currentMatch.matchList;
    this.matchSelectFlags = this.currentMatch.matchSelectFlags;
  }
  
  // delete the selected match
  public deleteMatchMenuItem = (index : number) => {
    var m : Match = this.menuMatchList[index];

    this.utilSvc.confirmMatchAction('Delete Match', this.playerName(m.playerId),
                                    this.playerName(m.opponentId), m.date, 'Delete')
    .then((deleteIt) => {
      this.dataSvc.deleteMatch(m.sortDate)
      .then((success) => {
        this.menuMatchList.splice(index, 1);    //remove item from menuMatchList array
        this.matchSelectFlags.splice(index, 1);
        this.constructMatchesMessage(this.menuMatchList.length);
      })
      .catch((failure) => {
        this.utilSvc.displayThisUserMessage("errorDeletingMatch");
      });
    })
    .catch((dontDelete) => {}
    );
  }

  // return if the match menu has more than one choice
  public multipleChoices() : boolean {
    return (this.currentMatch.matchList && this.currentMatch.matchList.length > 1);
  }

  // reverse the selected status of all menu items
  public toggleSelectAll = () => {
    this.matchSelectFlags.fill(this.selectAll);
  }

  // reverse the sort order of the match list array
  public toggleSortOrder = () => {
    this.currentMatch.matchList.reverse();
    this.matchSelectFlags.reverse();
  }

  // note that a match has been selected/deselected in the match list 
  public toggleMatchSelect = (index : number) => {
    this.matchSelectFlags[index] = !this.matchSelectFlags[index];
  }

  public setSelectedMatch = (index : number) => {
    this.currentMatch.selectedMatches = [this.menuMatchList[index]];
    this.viewSelectedMatches();
  }

  // save the objects that have been selected from the match list 
  public setSelectedMatches = () => {
    this.currentMatch.match = undefined;
    this.currentMatch.selectedMatches = [];
    this.matchSelectFlags.forEach((item, index) => {
      if(item){  //save all selected matches in an array
        this.currentMatch.selectedMatches.push(this.menuMatchList[index]);
      }
    });
    this.viewSelectedMatches();
  }

  private viewSelectedMatches = () => {
    if(this.currentMatch.selectedMatches.length){
      setTimeout( () => {
        this.utilSvc.scrollToTop();
        this.currentMatch.match = this.currentMatch.selectedMatches[0];
        this.currentMatch.hasBeenSaved = true;
        if(this.currentMatch.selectedMatches.length == 1){
          this.currentMatch.mode = "Review";
          this.currentMatch.match.removeLooseEnds();
        }
        else {
          this.currentMatch.mode = this.multiMode;              
        }
        setTimeout( () => {
          this.utilSvc.emitEvent('selectViewTab');
          this.utilSvc.emitEvent('setSelectedMatch');
        }, 100);
      }, 400)
    }
  }
  // return the number of currenetly selected matches
  public selectedMatchCount = () => {
    var count = 0;
    if(this.matchSelectFlags){
      this.matchSelectFlags.forEach( (item) =>{ count += item ? 1 : 0;} );
    }
    return count;
  }

  // return if multiple selections have been made
  multipleSelections() : boolean {
    return this.selectedMatchCount() > 1;
  }

  // return if match is selected or not
  public matchSelected(index : number) : boolean {
    return this.matchSelectFlags[index];
  }

  // make the selected match public
  public makeMatchPublic = (index : number) => {
    var m : Match = this.menuMatchList[index];
    var mpDate : string = m.sortDate;

    // this.utilSvc.confirmMatchAction('Make Match Public', this.playerName(m.playerId),
    //                                 this.playerName(m.opponentId), m.date, 'OK')
    // .then((doIt) => {
    this.utilSvc.openPublicMatchSettings('Add Public Match', undefined, 
            this.playerName(m.playerId), this.playerName(m.opponentId), m.date, 'Create', 'Make Public')
    .then((result) => {
      if(result.create === true){  //are we creating the public copy?
        if(mpDate.length === 12){ mpDate = this.utilSvc.extendSortDate(mpDate); }
        this.addPublicMatch(m, mpDate)
        .then((publicMatchAdded) => {
          if(result.list !== undefined){
            this.setEmailRestrictions(mpDate, result.list)
            .then((success) => {})
            .catch((failure) => {})
          }
          m.madePublic = mpDate;     
          this.dataSvc.saveMatch(m) // save private version
          .then((privateMatchUpdated) => {
            this.utilSvc.displayThisUserMessage("matchMadePublic");   
          })
          .catch((failToUpdatePrivateMatch) => {
            this.utilSvc.displayThisUserMessage("errorUpdatingPrivateMatch");
            m.madePublic = undefined;  
          })   
        })
        .catch((failToAddPublicMatch) => {
          this.utilSvc.displayThisUserMessage("errorMakingMatchPublic");
        })
      }
    })
    .catch((userHitCancel) => {
    })
  }

  // store the given match to the database using the PUBLIC_USER_ID
  private addPublicMatch = (mOrig : Match, sDate : string) => {
    var m      : Match = Match.build(mOrig.getMatchLog());  //copy the match object
    var pFirst : string = this.playerName(m.playerId, 'F'),
        pLast  : string = this.playerName(m.playerId, 'L'),
        oFirst : string = this.playerName(m.opponentId, 'F'),
        oLast  : string = this.playerName(m.opponentId, 'L');

    return new Promise((resolve, reject) => {
      this.dataSvc.getList(PLAYER_TABLE_NAME, PUBLIC_USER_ID)
      .then((pList) => {
        // get PUBLIC MATCH ids for the players and replace relevent ids in the match data
        m.playerId = this.getPublicPlayerId(<PlayerData[]>pList, pFirst, pLast, m.playerHanded);
        m.opponentId = this.getPublicPlayerId(<PlayerData[]>pList, oFirst, oLast, m.opponentHanded);
        m.winnerId = mOrig.winnerId == mOrig.playerId ? m.playerId : m.opponentId;
        m.submittedBy = mOrig.userId;
        m.userId = PUBLIC_USER_ID;
        m.sortDate = sDate;
        this.dataSvc.saveMatch(m)   //save public version
        .then((success) => {
          this.dataSvc.saveList(pList, PLAYER_TABLE_NAME, PUBLIC_USER_ID) // save updated PUBLIC players list
          .then((playerListUpdated) => {
            this.dataSvc.getList(TOURNAMENT_TABLE_NAME, PUBLIC_USER_ID) // read PUBLIC tournaments list
            .then((tList) => {
              this.addTournamentName(<string[]>tList, m.tournament);
              this.dataSvc.saveList(tList, TOURNAMENT_TABLE_NAME, PUBLIC_USER_ID) // save updated PUBLIC tourn list
              .then((tournamentListUpdated) => {
                resolve(tournamentListUpdated);            
              })
              .catch((failToSaveTournamentTable) => {
                reject(failToSaveTournamentTable);
              })
            })
            .catch((failToReadTournamentTable) => {
              reject(failToReadTournamentTable);
            })
          })
          .catch((failToSavePlayerList) => {
            reject(failToSavePlayerList);
          })
        })
        .catch((failToSavePublicMatch) => {
          reject(failToSavePublicMatch);
        })
      })
      .catch((failToReadPlayerList) => {
        reject(failToReadPlayerList);
      })
    })
  }

  // check player list for given name, return id if found otherwise add name to list and use next id value
  private getPublicPlayerId = (list : PlayerData[], fName : string, lName : string, handed : string ) => {
    var maxId : number = 0;
    var i     : number;
    var pData : PlayerData = <PlayerData>{};

    for(i=0; i<list.length; i++){   //see if name already in players list
      if((fName === list[i].firstName) && (lName === list[i].lastName)){
        return list[i].id;
      }
      if(list[i].id > maxId){ maxId = list[i].id };
    }
    // name not found, add a new entry to PUBLIC MATCHES players list
    pData.id = ++maxId;   //create a new id number
    pData.createdOn = this.utilSvc.formatDate();
    pData.firstName = fName;
    pData.lastName = lName;
    pData.handed = handed;
    pData.gender = DEFAULT_GENDER_TYPE;
    list.push(pData);     

    return maxId;
  }

  // check player list for given name, return id if found otherwise add name to list and use next id value
  private addTournamentName = (list : string[], tName : string ) => {
    if(!list.includes(tName)){
      list.push(tName);
    }
  }

  // remove the public copy of the selected match or set authorized users
  public publicMatchSettings = (index : number) => {
    var m : Match = this.menuMatchList[index];
    var sDate = m.madePublic;       //get sortDate for public copy of match

    this.dataSvc.readMatch(PUBLIC_USER_ID, sDate)
    .then((publicMatch) => {
      this.utilSvc.openPublicMatchSettings('Public Match Settings', publicMatch.restrictedTo, 
                      this.playerName(m.playerId), this.playerName(m.opponentId), m.date, 'Edit')
      .then((result) => {
        if(result.delete === true){  //are we deleting the public copy?
          this.dataSvc.deleteMatch(sDate, PUBLIC_USER_ID)
          .then((success) => {
            m.madePublic = undefined;
            this.dataSvc.saveMatch(m)
            .then((success) => {
              this.utilSvc.displayThisUserMessage("matchMadePrivate");
            })
            .catch((error) => {
              this.utilSvc.displayThisUserMessage("errorUpdatingPrivateMatch");
            })
          })
          .catch((failure) => {
            this.utilSvc.displayThisUserMessage("errorDeletingPublicCopy");
          })
        } else { // if not deleting, update the authorized users list
          this.setEmailRestrictions(sDate, result.list)
          .then((success) => {})
          .catch((failure) => {})
        }
      })
      .catch((userHitCancel) => {
      })
    })
    .catch((failToReadPublicMatch) => {
      this.utilSvc.displayThisUserMessage("errorReadingPublicCopy");
    })
  }

  // set the email restriction list for the given match
  setEmailRestrictions = (sDate: string, list: string[]) => {

    return new Promise((resolve, reject) => {
      this.dataSvc.readMatch(PUBLIC_USER_ID, sDate)
      .then((publicMatch) => {
        publicMatch.restrictedTo = list;
        this.dataSvc.saveMatch(publicMatch)
        .then((success) => {
          this.utilSvc.displayThisUserMessage("matchRestrictionsUpdated");
          resolve(success);
        })
        .catch((failToSavePublicMatch) => {
          this.utilSvc.displayThisUserMessage("errorUpdatingMatchRestrictions");
          reject(failToSavePublicMatch)
        })
      })
      .catch((failToReadPublicMatch) => {
        this.utilSvc.displayThisUserMessage("errorReadingPublicCopy");
        reject(failToReadPublicMatch)
      })
    })
  }

  // test to see if the given match is already public
  public matchIsPublic = (index : number) => {
    return this.menuMatchList[index].madePublic;
  }

  // return whether the match at the given index matches the publicFilter
  public applyPublicFilter = (index : number) => {
    var isPublic = this.matchIsPublic(index);
    return ((isPublic && "Either Public".includes( this.publicFilter)) ||
            (!isPublic && "Either Private".includes( this.publicFilter)))
  }

  // update the label on the menu tab
  public updateMatchCountLabel = () => {
    var i, count = 0;
    for(i=this.menuMatchList.length-1; i>=0; i--){
      count += this.applyPublicFilter(i) ? 1 : 0;
    } 
    this.constructMatchesMessage(count);
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    this.utilSvc.emitEvent("nextTab");
  }

  // move to the next tab in the tab set
  public prevTab = () => {
    this.utilSvc.emitEvent("prevTab");
  }

  // close the View Logs display
  public closeView = () => {
    this.utilSvc.emitEvent("closeView");
  }

}