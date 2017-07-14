// SERVICE to provide various functions needed for data storage/retreival
import { Injectable } from '@angular/core';
import { UserInfo } from '../app.globals';
import { UtilSvc } from '../utilities/utilSvc'
import { FireBaseSvc } from '../utilities/fireBaseSvc'
import { AWSModule } from './AWSModule';
import { Profile } from './profile';
import { Match } from './Match'

interface ParamObj {
  TableName: string;
  [propName: string]: any;
}

@Injectable()

export class DataSvc {

    constructor(private user: UserInfo, private fireBaseSvc: FireBaseSvc, 
      private awsModule: AWSModule, private utilSvc: UtilSvc) {
    }

      // CONSTANTS used by Data service
      PRIMARY_KEY_HASH =      'userId';
      PRIMARY_KEY_RANGE =     'sortDate';
      MATCH_TABLE_NAME =      'matchList';
      LOCATION_TABLE_NAME =   'locationList';
      EVENT_TABLE_NAME =      'eventList';
      TOURNAMENT_TABLE_NAME = 'tournamentList';
      PLAYER_TABLE_NAME =     'playerList';

//*******************************************************************************
//    Functions that deal with the database
//


      // read the list from the given list table in the database
      // note**: this is not called to read from the matches table, see queryMatchTable
      // returns: promise
      readTableItem(table: string, id: string){
        var params: ParamObj = {
            TableName: table,
            Key:{ 'userId': id }
        };
        return this.awsModule.dbRead(params);
      }

      // write the given item to the given table in the database 
      // returns: promise
      writeTableItem(table: string, item: any){
        var params = {
            TableName: table,
            Item: item
        };

        if(this.user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve,reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.awsModule.dbWrite(params);
      }

      // delete the selected item from the given table in the database 
      // returns: promise
      deleteTableItem(table: string, id: string, sortDate?: string) : Promise<any>{
        var params = {
            TableName: table,
            Key:{ "userId": id }
        };

        if(table == this.MATCH_TABLE_NAME){
          params.Key["sortDate"] = sortDate;
        }; 
        if(this.user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve,reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.awsModule.dbDelete(params);
      }

      // return a list of matches from the MATCHES table in the database 
      // MATCH_TABLE has hash key of: userId and range key of: sortDate
      // returns: promise
      queryMatchTable(id: string, filter?: any){
        var fExp = "";
        var params: ParamObj = {
            TableName: this.MATCH_TABLE_NAME,
            KeyConditionExpression: "userId = :v_iD",
            ExpressionAttributeValues: {
              ":v_iD": id
            }
        };
        // the filter parameter is a hash of selection criteria names and values
        // now, process the filter object updating the relevant items in the query params
        if(filter.startDate){
          params.KeyConditionExpression += " AND (sortDate >= :v_sD)";
          params.ExpressionAttributeValues[":v_sD"] = filter.startDate;
        }
        if(filter.endDate){
          params.KeyConditionExpression += " AND (sortDate < :v_eD)";
          params.ExpressionAttributeValues[":v_eD"] = filter.endDate;
        }
        if(filter.countOnly){
          params.Select = "COUNT";
        };
        if(filter.playerId){
          fExp = "((pI = :v_pI) OR (oI = :v_pI))";
          params.ExpressionAttributeValues[":v_pI"] = filter.playerId;
        }
        if(filter.opponentId){
          fExp += fExp.length ? " AND " : "";
          fExp += "((oI = :v_oI) OR (pI = :v_oI))";
          params.ExpressionAttributeValues[":v_oI"] = filter.opponentId;
        }
        if(filter.wonLost == "Won" && filter.playerId){
          fExp += fExp.length ? " AND " : "";
          fExp += "((wI <> :v_zero) AND (wI = :v_pI))";
          params.ExpressionAttributeValues[":v_zero"] = 0;
        }
        if(filter.wonLost == "Lost" && filter.playerId){
          fExp += fExp.length ? " AND " : "";
          fExp += "((wI <> :v_zero) AND (wI <> :v_pI))";
          params.ExpressionAttributeValues[":v_zero"] = 0;
        }
        if(filter.tournament){
          fExp += fExp.length ? " AND " : "";
          fExp += "(tn = :v_tN)";
          params.ExpressionAttributeValues[":v_tN"] = filter.tournament;
        }
        if(filter.status){
          fExp += fExp.length ? " AND " : "";
          fExp += "(st = :v_st)";
          params.ExpressionAttributeValues[":v_st"] = filter.status;
        }
        if(filter.handed){
          fExp += fExp.length ? " AND " : "";
          if(filter.playerId){
            fExp += 
              "(((pI = :v_pI) AND (oH = :v_H)) OR ((oI = :v_pI) AND (pH = :v_H)))";
          }
          else{
            fExp += "((pH = :v_H) OR (oH = :v_H))";
          }
          params.ExpressionAttributeValues[":v_H"] = filter.handed;
        }
        if(fExp.length){
          params.FilterExpression = fExp;
        }
        return this.awsModule.dbQuery(params);
      }

      // fetch matches from the database that meet the given parameters
      // returns: promise
      getMatches(params){
        var result : Match[] = [];

        function processLog(mLog : MatchData, index : number) : void {
          result.push(Match.build(mLog));
        }

        // function to use for sorting the matches list
        function sortFunc(a: Match, b: Match){
          switch(params.sortOrder){
            case "A":       // Ascencding sort
              return a.sortDate.localeCompare(b.sortDate);
            case "D":       // Descending sort
            default:
              return -(a.sortDate.localeCompare(b.sortDate));
          }
        }

        return new Promise((resolve, reject) => {
          this.queryMatchTable(this.user.authData.uid, params)
            .then((data) => {
                data.Items.forEach(processLog);
                resolve(result.sort(sortFunc));})
            .catch((error) => {
                if(/NO_MATCHES/.test(error)) {
                  resolve(result)}
                else {
                  reject(error);}});
          });
      }

      // save the given match as a match log
      // returns: promise
      saveMatch(m : Match) : Promise<any> {
        return this.saveMatchLog(m.getMatchLog());
      }

      // Add the given match log to the MATCHES table
      // returns: promise
      saveMatchLog(mLog : MatchData ) : Promise<any> {

        return new Promise((resolve, reject) => {
          this.writeTableItem(this.MATCH_TABLE_NAME, mLog)
            .then((success) => {
                resolve(success);}) 
            .catch((error) => {
              reject(error);})
          })
      }

      // Delete the selected match from the MATCHES table
      // returns: promise
      deleteMatch(matchDate : string){

        return new Promise((resolve, reject) => {
          this.deleteTableItem(this.MATCH_TABLE_NAME, this.user.authData.uid, matchDate)
          .then((success) => {
            resolve(success);}) 
          .catch((error) => {
            reject(error);})
        })
      }
 
      // Add/Update/Remove the given item of the list in the given table
      // return: promise
      updateList(table : string, item : any, action : string, index : number){
  
        return new Promise((resolve, reject) => {
          this.getList(table)
          .then((eList: any[]) => {
            switch(action){
              case "Update":
                eList[index] = item;      // update entry
              break;
              case "Remove":
                eList.splice(index,1);    // remove entry
              break;
              case "Add":
              default:
                eList.push(item);         // Add entry          
              break;
            }
            this.saveList(eList, table)
            .then((success) => {
              resolve(success);})
            .catch((error) => {
              reject(error);})
          })
          .catch((error) => {                // list not found
            if(/INF/.test(error) && action == "Add"){
              this.saveList([item], table)
              .then((success) => {
                resolve(success);})
              .catch((error) => {
                reject(error);})}
            else {
              reject(error);}
          })
        })
      }

      // get the list of items from specified table
      // returns: promise
      getList(table : string) {

        return new Promise((resolve, reject) => {
          this.readTableItem(table, this.user.authData ? this.user.authData.uid : "111")
          .then((list) => {
            resolve(list.items == undefined ? list : list.items);})
          .catch((error) => {
            reject(error);})
        })
      }

      // save the specified list
      // returns: promise
      saveList(list : any, table : string) {
        var item = {
          userId: this.user.authData.uid,
          items: list
        }

        return new Promise((resolve, reject) => {
          this.writeTableItem(table, item)
          .then((success) => {
            resolve("Cloud");})
          .catch((error) => {
            reject(error);})
        })
      }

      // Add or update the given player entry in the list of players
      // return: promise
      updatePlayerList(p : any, action : string){

        var pending = [];

        action = action || "Add";

        p.firstName = p.firstName.charAt(0).toUpperCase()+p.firstName.substr(1); 
        p.lastName = p.lastName.charAt(0).toUpperCase()+p.lastName.substr(1);

        if(action == "Remove"){ // check for player present in any matches
          var filter = {
            playerId: p.id,
            countOnly: true
          };
          pending.push(new Promise((resolve, reject) => {
            this.queryMatchTable(this.user.authData.uid, filter)
            .then((data) => {
              var msg = "Player "+ p.firstName + " " + p.lastName + " cannot be removed. " +
                  "The "+ data.Count + (data.Count == 1 ? " match" : " matches")+
                  " containing this player must be deleted first."
              if(data.Count > 0){
                this.utilSvc.giveNotice("Remove Player", msg, "Ok")
                .then((success) => {
                  reject("HAS_MATCHES");})
              }
              else {
                resolve("Ok");}
            })
          }))
        }
        return new Promise((resolve, reject) => {
          Promise.all(pending)
          .then((success) => {
            this.getList(this.PLAYER_TABLE_NAME)
            .then((pList : any) => {
              for(var i=0; i<pList.length; i++){
                if(pList[i].id == p.id){
                  break;
                }
              }
              if(i<pList.length){
                if(action == "Update"){
                  pList[i] = p;         // Update player
                }
                else {
                  pList.splice(i,1);    // Remove player
                }
              }
              else{
                pList.push(p);          // Add player
              }
              this.saveList(pList, this.PLAYER_TABLE_NAME)
              .then((success) => {
                resolve(success);})
              .catch((error) => {
                reject(error);})
            })
            .catch((error) => {
              if(/INF/.test(error) && action == "Add"){
                this.saveList([p], this.PLAYER_TABLE_NAME)
                .then((success) => {
                  resolve(success);})
                .catch((error) => {
                  reject(error);})}
              else {
                reject(error);}
            });
          })
          .catch((error) => {
            reject(error);
          });
        })
      }

      // get the player information into a formatted list
      // returns: promise
      getPlayers() {
        var result = [];

        return new Promise((resolve, reject) => {
          this.getList(this.PLAYER_TABLE_NAME)
          .then(function(pList : any){
            for (var i=0; i<pList.length; i++) { 
              var p = pList[i];
              result.push({id: p.id, name: p.firstName+' '+p.lastName,
                          firstName: p.firstName, lastName: p.lastName,
                          firstInitial: p.firstName.charAt(0).trim(), notes: p.notes,
                          handed: p.handed, gender: p.gender, createdOn: p.createdOn}) 
            } 
            resolve(result);})
          .catch((error) => {
            reject(error);})
        })
      }

  //******************************************************************************
  //        functions associated with user accounts and profiles


      // update the given user profile, return a promise
      // returns: promise
      updateUserProfile(user : any){
        if(user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.updateUserProfile(this.user.authData, this.user.profile);
      }

      // read the given user profile properties, return a profile
      // returns: promise
      readUserProfile(user : any){
        return this.fireBaseSvc.readUserProfile(this.user.authData);
      }

      // read the given user profile properties, return a profile
      // returns: promise
      createUserProfile(user){
        if(user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.createUserProfile(this.user.authData, this.user.profile);
      }

      // delete the profile associated with the given user
      // returns: promise
      removeUserProfile(user : any){
        if(user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.removeUserProfile(this.user.authData);
      }

      // delete the account associated with the given email and password
      // returns: promise
      deleteAccount(email : string, password : string){
        if(this.user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.deleteAccount(email, password);
      }

      // change the email associated with the given email and password
      // returns: promise
      changeEmail(currEmail : string, password : string, newEmail : string){
        if(this.user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.changeEmail(currEmail, password, newEmail)
      }

      // create an account for the given email and password
      // returns: promise
      createAccount(email : string, password : string){
        return this.fireBaseSvc.createAccount(email, password);
      }

      // verify there is an account for the given email and password
      // return a promise with credentials if successfull
      // returns: promise
      authWithPassword(email : string, password : string){
        return this.fireBaseSvc.authWithPassword(email, password);
      }

      // have FireBase send a message with a temporary password to the given email
      // returns: promise
      resetPassword(email : string){
        if(this.user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.resetPassword(email);       
      }

      // change the password associated with the given email
      // returns: promise
      changePassword(email : string, currPassword : string, newPassword : string){
        if(this.user.profile.hasRestriction(Profile.RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.changePassword(email, currPassword, newPassword);
      }

      //remove database items associated with this user
      //return: array of promises
      removeUserData(aUser : any){
        var promises  = [];
        var id = aUser.authData.uid;

        promises.push(this.deleteTableItem(this.EVENT_TABLE_NAME, id));
        promises.push(this.deleteTableItem(this.TOURNAMENT_TABLE_NAME, id));
        promises.push(this.deleteTableItem(this.LOCATION_TABLE_NAME, id));
        promises.push(this.deleteTableItem(this.PLAYER_TABLE_NAME, id));
        return new Promise((resolve, reject) => {
          this.queryMatchTable(id)
          .then((data) => {
            data.Items.forEach(function(m){
              promises.push(this.deleteTableItem(this.MATCH_TABLE_NAME, id, m.sortDate));
            });
            Promise.all(promises)
            .then((success) => {        //.finally?
              resolve("Ok");})
            .catch((error) => {
              resolve("Ok");})
          });
        })
      }
}