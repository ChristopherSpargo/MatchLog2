import { TSet, SIX_GAME_SET_TYPE, EIGHT_GAME_SET_TYPE, TIEBREAK_SET_TYPE, SetData } from './set';
import { Game } from './game';
import { PLAYER_ID, OPPONENT_ID, ML_DATA_VERSION } from '../constants'
import { Point, PointData, WINNER_POINT_ENDING, UNFORCED_ERROR_POINT_ENDING,
         UNFORCED_ERROR_DETAIL_EXECUTION } from './point'
import { Match, MatchPosition, MatchData, MATCH_FORMATS,DEFAULT_MATCH_FORMAT,TWO_OF_THREE_MATCH_FORMAT,
         TWO_PLUS_TIEBREAK_MATCH_FORMAT, ONE_SIX_SET_MATCH_FORMAT, ONE_EIGHT_SET_MATCH_FORMAT, 
         ONE_TIEBREAK_MATCH_FORMAT } from './match'

  let mData : MatchData = <MatchData>{};
  let tMatch : Match;
  let pData : PointData = <PointData>{};
  let tPoint : Point;
  let position : MatchPosition = <MatchPosition>{};

  describe('A Match', () => {

    mData.userId  =   '0test00';     // auth token number for owner of this data
    mData.sortDate =  '201710061022';     // date-time for match (yyyymmddHHmm)
    mData.dV =        ML_DATA_VERSION;   // data version number
    // mData.st =        'Ended';     // status (Ended, Paused)
    mData.dt =        '10/06/2017';     // match date mm/dd/yyyy
    mData.tm =        '08:00';     // start time (hh:mm)
    // mData.du =        0;           // duration in ms
    mData.tn =        'Practice Matches';     // tournament name (CAZ Pot O' Gold L5)
    mData.l =         'Practice Courts';     // location name (Paseo Racquet Complex)
    mData.e =         'Womens Open Singles';     // event name (Girls 18s)
    mData.r =         'Final';     // round name (Round 1)
    mData.pI =        7;           // Player Id
    mData.pH =        'Right';     // Player Handed (Left or Right)
    mData.oI =        8;           // Opponend Id
    mData.oH =        'Right';     // Opponent Handed
    mData.sI =        OPPONENT_ID;     // current server Id (PLAYER_ID or OPPONENT_ID)
    mData.f =         DEFAULT_MATCH_FORMAT;     // format (1 set (6 games), etc.)
    // mData.nA =        false;    // no-Ad scoring was used
    // mData.wI =        PLAYER_ID;     // Winner Id

    tMatch = Match.build(mData);    //Create a new match object

    pData.s =     10;       // number of shots in the point (counting serve)
    pData.pS =    '0';       // Player score (0, 15, 30, 40, AD, G)
    pData.oS =    '0';       // Opponent score
    pData.wI =    PLAYER_ID;       // winner Id (PLAYER_ID or OPPONENT_ID)
    pData.sI =    OPPONENT_ID;       // server Id (PLAYER_ID or OPPONENT_ID)
    pData.fSI =   true;      // first serve was in
    pData.rI =    true;      // return was in
    pData.rW =    'F';       // return wing (forehand or backhand)
    pData.lW =    'B';       // last shot wing
    pData.pAN =   true;      // Player was at net when point ended
    pData.oAN =   false;      // Opponent was at net when point ended
    pData.pEB =   WINNER_POINT_ENDING;       // point ended by (Ace, Winner, etc.)
    pData.uED =   undefined;       // detail attribute if point ended by unforced ERROR
    pData.bP =    false;      // point was a break point for returner
    pData.gP =    false;      // point was a game point for server

    tPoint = Point.build(pData);

    it('should create a new match', ()=> {
      expect(tMatch).toBeTruthy();
    })

    it('the match should have the given data', ()=> {
      expect(tMatch.round).toEqual('Final', 'no Round');
      expect(tMatch.playerId).toEqual(7,'wrong player Id');
      expect(tMatch.serverId).toEqual(OPPONENT_ID,'wrong server Id')
    })

    it('should have a starting set with an empty game', ()=> {
      expect(tMatch.sets.length).toEqual(1,'no initial set');
      expect(tMatch.sets[0].games.length).toEqual(1,'no initial game');
    })

    it('adding the first point should create a point list', ()=> {
      expect(tMatch.sets[0].games[0].points.length).toEqual(0,'point list already defined');
      tMatch.addNewPoint(tPoint);
      expect(tMatch.sets[0].games[0].points.length).toEqual(1,'point list not added');
    })

    //now add points to simulate game 1 and check the score along the way
    it('should return the formated score at a given point position', ()=> {
      position.game = 0;
      position.point = undefined;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0)', 'new set score wrong');
      position.game = 1;
      position.point = 0;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 0-0', '1st point wrong');
      pData.wI = OPPONENT_ID;
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 1;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 0-15', '2nd point wrong');
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 2;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 15-15', '3rd point wrong');
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 3;
      //test calling the TSet method instead of the Match method
      expect(tMatch.sets[0].getFormattedScore(position)).toEqual('(0,0) 30-15', '4th point wrong');
      pData.wI = PLAYER_ID;
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 4;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 40-15', '5th point wrong');
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 5;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 40-30', '6th point wrong');
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 6;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 40-40', '7th point wrong');
      tPoint = Point.build(pData);
      tMatch.addNewPoint(tPoint);
      position.point = 7;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,0) 40-AD', '8th point wrong');
      position.point = undefined;
      expect(tMatch.getFormattedScore(position)).toEqual('(1,0)', 'new game score wrong');
    })

    it('should recognize break point and game point', ()=> {
      expect(tMatch.sets[0].games[0].points[7].breakPoint).toBe(true,'no break point');
      expect(tMatch.sets[0].games[0].points[4].gamePoint).toBe(true,'no game point');
    })

    it('should recognize game over and create a new game', ()=> {
      expect(tMatch.sets[0].games.length).toEqual(2,'no new game');
    })

    //now add points to simulate the rest of set 1 and check for end of set conditions
    it('should recognize set point', ()=> {
      pData.sI = PLAYER_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 2

      pData.sI = OPPONENT_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 3
      
      pData.sI = PLAYER_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 4
      
      pData.sI = OPPONENT_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 5
      
      pData.sI = PLAYER_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 6

      position.set = 1;
      position.game = 6;
      position.point = 3;
      expect(tMatch.getFormattedScore(position)).toEqual('(5,0) 40-0', 'set point score wrong');
      expect(tMatch.sets[0].games[5].points[3].gamePoint).toBe(true,'no game point');
      expect(tMatch.sets[0].setPoint).toBe(true,'no set point');
    })

    it('should recognize set over and create a new set', ()=> {
      position.set = undefined;
      position.game = undefined;
      position.point = undefined;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,6)(0,0)', 'new 2nd set score wrong');
      expect(tMatch.sets.length).toEqual(2,'no new set');
    })
    
    //now add points to simulate set 2 going to the other player and check for tibreaker
    it('should recognize split sets and start a tiebreak', ()=> {
      pData.wI = OPPONENT_ID;
      pData.sI = OPPONENT_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 1
      
      pData.sI = PLAYER_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 2

      pData.sI = OPPONENT_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 3
      
      pData.sI = PLAYER_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 4
      
      pData.sI = OPPONENT_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 5
      
      pData.sI = PLAYER_ID;
      for(let i=0; i<4; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //game 6

      position.set = undefined;
      position.game = undefined;
      position.point = undefined;
      expect(tMatch.getFormattedScore(position)).toEqual('(0,6)(6,0)0-0', 'new 3rd set score wrong');
      expect(tMatch.sets.length).toEqual(3,'no new set');
      expect(tMatch.sets[2].type).toEqual(TIEBREAK_SET_TYPE,'not a TIEBREAK');
    })

    //simulate the 10-point match tibreak and check for proper winner and final score
    it('should recognize end of match when tiebreak is completed', ()=> {
      pData.sI = OPPONENT_ID;
      tPoint = Point.build(pData); tMatch.addNewPoint(tPoint); //point 1
      pData.sI = PLAYER_ID;
      for(let i=0; i<2; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //points 2,3
      pData.sI = OPPONENT_ID;
      for(let i=0; i<2; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //points 4,5
      pData.sI = PLAYER_ID;
      for(let i=0; i<2; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //points 6,7
      pData.sI = OPPONENT_ID;
      for(let i=0; i<2; i++){ tPoint = Point.build(pData); tMatch.addNewPoint(tPoint);} //points 8,9
      tMatch.computeScore();
      expect(tMatch.matchPoint).toEqual(true, 'did not recognize match point');
      expect(tMatch.winnerId).toEqual(0,'no winner yet');
      pData.sI = PLAYER_ID;
      tPoint = Point.build(pData); tMatch.addNewPoint(tPoint); //point 10
      expect(tMatch.getFormattedScore(position)).toEqual('(6,0)(0,6)0-10', 'final score wrong');
      tMatch.computeScore();
      expect(tMatch.winnerId).toEqual(8,'wrong winner Id');
    });
    
  });