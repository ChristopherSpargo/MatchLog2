
//CONSTANT values used by the Player class
export const HANDED_TYPES           = ["Right","Left"];
export const DEFAULT_HANDED_TYPE    = "Right";
export const GENDER_TYPES           = ["Female","Male"];
export const DEFAULT_GENDER_TYPE    = "Female";


export class PlayerData {
          
  //Player properties
  id            : number;
  firstName     : string;
  lastName      : string;
  handed        : string;
  gender        : string;
  notes         ?: string;
  createdOn     ?: string;
  name          ?: string;
  firstInitial  ?: string;
}

//
// define Player Class
//
export class Player extends PlayerData {
  
  //define Player constructor
  constructor(data: PlayerData) {
    super();
    this.setPlayerProperties(data);
  };

  //static method to validate the data and call the constructor
  static build(data: PlayerData) : Player {
    return new Player(data);
  }

  //set the Player properties from the given PlayerData
  setPlayerProperties(data: PlayerData) : void {
    this.id         = data.id;
    this.firstName  = data.firstName;
    this.lastName   = data.lastName;
    this.handed     = data.handed || DEFAULT_HANDED_TYPE;
    this.gender     = data.gender || DEFAULT_GENDER_TYPE;
    this.notes      = data.notes || "";
    this.createdOn  = data.createdOn || (new Date()).toLocaleDateString();
  };

  //return the properties of the Player
  getPlayerLog(): PlayerData {
    var pLog: PlayerData  = {
      id          : this.id,
      firstName   : this.firstName,
      lastName    : this.lastName,
      handed      : this.handed,
      gender      : this.gender,
      notes       : this.notes == "" ? undefined : this.notes,
      createdOn   : this.createdOn
    }
    return pLog;
  };

}


