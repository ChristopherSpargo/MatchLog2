
// SERVICE to display graphs of match data
import { Injectable } from '@angular/core';
import { Match } from './match'
declare var Chart: any;

@Injectable()
export class GraphsSvc {

    constructor(){
      Chart.defaults.global.animation.duration = 0;
      Chart.defaults.global.hover.intersect = false;
    } 

    synopsisGraph         = undefined;
    synopsisTrend1        = undefined;
    synopsisTrend2        = undefined;
    synopsisContext       = undefined;
    synopsisTrendContext1 = undefined;
    synopsisTrendContext2 = undefined;
    servesGraph           = undefined;
    servesTrend1          = undefined;
    servesTrend2          = undefined;
    servesContext         = undefined;
    servesTrendContext1   = undefined;
    servesTrendContext2   = undefined;
    returnsGraph          = undefined;
    returnsTrend1         = undefined;
    returnsTrend2         = undefined;
    returnsContext        = undefined;
    returnsTrendContext1  = undefined;
    returnsTrendContext2  = undefined;
    riskGraph             = undefined;
    riskTrend1            = undefined;
    riskTrend2            = undefined;
    riskContext           = undefined;
    riskTrendContext1     = undefined;
    riskTrendContext2     = undefined;
    playerBackground      = "rgba(0,137,123,.7)";
    playerBorder          = "rgba(0,137,123,1)";
    opponentBackground    = "rgba(255,193,7,.7)";
    opponentBorder        = "rgba(255,193,7,1)";
    lineColor1            = "rgba(0,0,255,1)";   //dark blue
    lineColor2            = "rgba(204,0,204,1)"; //light purple
    lineColor3            = "rgba(0,153,0,1)";   //dark green
    lineColor4            = "rgba(255,102,0,1)"; //orange
    lineColor5            = "rgba(255,0,0,1)";   //red
    lineColor6            = "rgba(255,204,0,1)"; //dark yellow
    lineColor7            = "rgba(102,153,255,1)"; //light blue
    lineColor8            = "rgba(0,204,0,1)"; //light green
    graphType             = "bar";

    //reset the context objects for all the canvases
    clearAllGraphs() : void {
      this.clearGraphs();
      this.clearTrends();
    }

    displayGraphs(data : any) : void {
      setTimeout( () => {
        if(!this.synopsisContext){this.initGraphs();};
        this.displaySynopsisGraph(data);
        this.displayServesGraph(data);
        this.displayReturnsGraph(data);
        this.displayRiskGraph(data);
      }, 100);
    }

    //get the context objects for each canvas so we dont have to get them each time
    //the graphs are displayed
    initGraphs() : void {
      var ge;
      this.clearGraphs();
      ge = document.getElementById("synopsisGraph");
      if(ge){
        this.synopsisContext = ge.getContext('2d');
      }
      ge = document.getElementById("servesGraph");
      if(ge){
        this.servesContext = ge.getContext('2d');
      }
      ge = document.getElementById("returnsGraph");
      if(ge){
        this.returnsContext = ge.getContext('2d');
      }
      ge = document.getElementById("riskGraph");
      if(ge){
        this.riskContext = ge.getContext('2d');
      }
    }

    clearGraphs() : void {
      this.synopsisContext = undefined;
      this.servesContext   = undefined;
      this.returnsContext  = undefined;
      this.riskContext     = undefined;
    }

    displaySynopsisGraph(data : any) : void {
      if(this.synopsisGraph){ 
        this.synopsisGraph.destroy();
        this.synopsisGraph = undefined;
      };
      if(this.synopsisContext){
        var pRisk = (data.bigRatio[0][1] == 0) ? 0 
                                               : Math.round((data.bigRatio[0][0]/data.bigRatio[0][1])*100);
        var oRisk = (data.bigRatio[1][1] == 0) ? 0 
                                               : Math.round((data.bigRatio[1][0]/data.bigRatio[1][1])*100);
        this.synopsisGraph = new Chart(this.synopsisContext, {
          type: this.graphType,
          data: {
            labels: ["Serve", "Return", "Big Points", "Risk", "Quality"],
            datasets: [{
              label: data.playerName,
              fill: false,
              data: [data.spWonPct[0], data.rpWonPct[0], pRisk, data.aggressionPct[0],
                Math.round((data.spWonPct[0] + data.rpWonPct[0] + pRisk + data.aggressionPct[0]) / 4)],
              backgroundColor: this.playerBackground,
              borderColor: this.playerBorder,
              borderWidth: 1
            }, {
              label: data.opponentName,
              fill: false,
              data: [data.spWonPct[1], data.rpWonPct[1], oRisk, data.aggressionPct[1],
                Math.round((data.spWonPct[1] + data.rpWonPct[1] + oRisk + data.aggressionPct[1]) / 4)],
              backgroundColor: this.opponentBackground,
              borderColor: this.opponentBorder,
              borderWidth: 1
            }]
          },
          options: {
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            var l;
                            if(tooltipItems[0].xLabel.match(/Big/)){
                              l = tooltipItems[0].xLabel +' Won';
                            }
                            else {
                              if(tooltipItems[0].xLabel.match(/Quality/)){
                                l = 'Overall ' + tooltipItems[0].xLabel;
                              } else {
                                l = tooltipItems[0].xLabel +' Points Won';
                              }
                            }
                            return l;
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
      }
    }

    displayServesGraph(data : any) : void {
      if(this.servesGraph){ 
        this.servesGraph.destroy();
        this.servesGraph = undefined;
      };
      if(this.servesContext){
        var pGpWon = (data.gpWon[0][1] == 0) ? 0 : Math.round((data.gpWon[0][0]/data.gpWon[0][1])*100);
        var oGpWon = (data.gpWon[1][1] == 0) ? 0 : Math.round((data.gpWon[1][0]/data.gpWon[1][1])*100);
        this.servesGraph = new Chart(this.servesContext, {
          type: this.graphType,
          data: {
            labels: ["1st In", "1st Won", "2nd In", "2nd Won", "Total Won", "Game Pts"],
            datasets: [{
              label: data.playerName,
              fill: false,
              data: [data.fsPct[0], data.fsPctWon[0], data.ssPct[0], data.ssPctWon[0],
                 data.spWonPct[0], pGpWon],
              backgroundColor: this.playerBackground,
              borderColor: this.playerBorder,
              borderWidth: 1
            }, {
              label: data.opponentName,
              fill: false,
              data: [data.fsPct[1], data.fsPctWon[1], data.ssPct[1], data.ssPctWon[1],
                data.spWonPct[1], oGpWon],
              backgroundColor: this.opponentBackground,
              borderColor: this.opponentBorder,
              borderWidth: 1
            }]
          },
          options: {
            legend: {
              display: false
            },
            // responsive: false,
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label:  function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel + '%');
                          },
                  title:  function(tooltipItems, data) {
                            var l, i, t;
                            t = tooltipItems[0].xLabel;
                            if(!t.match(/Game/)){
                              i = t.indexOf(" ");
                              l = t.substr(0,i) + " Serves" + t.substr(i);
                            }
                            else {
                              l = t + " Won";
                            }
                            return l;
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
      }
    }

    displayReturnsGraph(data : any) : void {
      if(this.returnsGraph){ 
        this.returnsGraph.destroy();
        this.returnsGraph = undefined;
      };
      if(this.returnsContext){
        var pBpWon = (data.bpWon[0][1] == 0) ? 0 : Math.round((data.bpWon[0][0]/data.bpWon[0][1])*100);
        var oBpWon = (data.bpWon[1][1] == 0) ? 0 : Math.round((data.bpWon[1][0]/data.bpWon[1][1])*100);
        this.returnsGraph = new Chart(this.returnsContext, {
          type: this.graphType,
          data: {
            labels: ["1st In", "1st Won", "2nd In", "2nd Won", "Total Won", "Break Pts"],
            datasets: [{
              label: data.playerName,
              fill: false,
              data: [data.frPct[0], data.frPctWon[0], data.srPct[0], data.srPctWon[0],
                data.rpWonPct[0], pBpWon],
              backgroundColor: this.playerBackground,
              borderColor: this.playerBorder,
              borderWidth: 1
            }, {
              label: data.opponentName,
              fill: false,
              data: [data.frPct[1],data.frPctWon[1],data.srPct[1],data.srPctWon[1],
                 data.rpWonPct[1], oBpWon],
              backgroundColor: this.opponentBackground,
              borderColor: this.opponentBorder,
              borderWidth: 1
            }]
          },
          options: {
            legend: {
              display: false
            },
            // responsive: false,
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label:  function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel + '%');
                          },
                  title:  function(tooltipItems, data) {
                            var l, i, t;
                            t = tooltipItems[0].xLabel;
                            if(!t.match(/Break/)){
                              i = t.indexOf(" ");
                              l = t.substr(0,i) + " Returns" + t.substr(i);
                            }
                            else {
                              l = tooltipItems[0].xLabel + " Won";
                            }
                            return l;
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
      }
    }

    displayRiskGraph(data : any) : void {
      if(this.riskGraph){ 
        this.riskGraph.destroy();
        this.riskGraph = undefined;
      };
      if(this.riskContext){
        this.riskGraph = new Chart(this.riskContext, {
          type: this.graphType,
          data: {
            labels: ["Winners","Forced","Aces","Doubles","Errors","Points"],
            datasets: [{
              label: data.playerName,
              fill: false,
              data: [data.winners[0],data.errForced[0],data.aces[0],
                data.dblFaults[0],data.unfErrors[0],data.tpWon[0]],
              backgroundColor: this.playerBackground,
              borderColor: this.playerBorder,
              borderWidth: 1
            }, {
              label: data.opponentName,
              fill: false,
              data: [data.winners[1],data.errForced[1],data.aces[1],
                data.dblFaults[1],data.unfErrors[1],data.tpWon[1]],
              backgroundColor: this.opponentBackground,
              borderColor: this.opponentBorder,
              borderWidth: 1
            }]
          },
          options: {
            legend: {
              display: false
            },
            // responsive: false,
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  title:  function(tooltipItems, data) {
                            var l = tooltipItems[0].xLabel;
                            if(tooltipItems[0].xLabel.match(/Points/)){
                              l = tooltipItems[0].xLabel + ' Won';
                            }
                            if(tooltipItems[0].xLabel.match(/Forced/)){
                              l = 'Errors ' + tooltipItems[0].xLabel;
                            }
                            if(tooltipItems[0].xLabel.match(/Doubles/)){
                              l = 'Double Faults';
                            }
                            if(tooltipItems[0].xLabel.match(/Unforced/)){
                              l = tooltipItems[0].xLabel + ' Errors';
                            }
                            return l;
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0
                }
              }]
            }
          }
        });          
      }
    }

    //get the context objects for each trends canvas so we dont have to get them each time
    //the graphs are displayed
    initTrends() : void {
      var ge;
      this.clearTrends();
      ge = document.getElementById("synopsisTrend1");
      if(ge){
        this.synopsisTrendContext1 = ge.getContext('2d');
      }
      ge = document.getElementById("synopsisTrend2");
      if(ge){
        this.synopsisTrendContext2 = ge.getContext('2d');
      }
      ge = document.getElementById("servesTrend1");
      if(ge){
        this.servesTrendContext1 = ge.getContext('2d');
      }
      ge = document.getElementById("servesTrend2");
      if(ge){
        this.servesTrendContext2 = ge.getContext('2d');
      }
      ge = document.getElementById("returnsTrend1");
      if(ge){
        this.returnsTrendContext1 = ge.getContext('2d');
      }
      ge = document.getElementById("returnsTrend2");
      if(ge){
        this.returnsTrendContext2 = ge.getContext('2d');
      }
      ge = document.getElementById("riskTrend1");
      if(ge){
        this.riskTrendContext1 = ge.getContext('2d');
      }
      ge = document.getElementById("riskTrend2");
      if(ge){
        this.riskTrendContext2 = ge.getContext('2d');
      }
    }

    clearTrends() : void {
      this.synopsisTrendContext1 = this.synopsisTrendContext2 = undefined;
      this.servesTrendContext1   = this.servesTrendContext2   = undefined;
      this.returnsTrendContext1  = this.returnsTrendContext2  = undefined;
      this.riskTrendContext1     = this.riskTrendContext2     = undefined;
    }

    displayTrends(stats : any, matches : Match[], pName : string, oName : string, oNameList : string[]) : void {
      setTimeout( () => {
        if(!this.synopsisTrendContext1){this.initTrends();};
        this.displaySynopsisTrend(stats, matches, pName, oName, oNameList);
        this.displayServesTrend(stats, matches, pName, oName, oNameList);
        this.displayReturnsTrend(stats, matches, pName, oName, oNameList);
        this.displayRiskTrend(stats, matches, pName, oName, oNameList);
      }, 50);
    }

    displaySynopsisTrend(stats : any, matches : Match[], pName : string, oName : string, oNameList : string[]) : void {
      if(this.synopsisTrend1){ 
        this.synopsisTrend1.destroy();
        this.synopsisTrend1 = undefined;
      };
      if(this.synopsisTrend2){ 
        this.synopsisTrend2.destroy();
        this.synopsisTrend2 = undefined;
      };
      if(this.synopsisTrendContext1){
        var matchDates : string[] = [], tooltipDates = [];
        var i, bpr;
        var pServeData = [], pReturnData = [], pBigPointData = [], pRiskData = [], pQualityData = [];
        var oServeData = [], oReturnData = [], oBigPointData = [], oRiskData = [], oQualityData = [];
        matchDates.length = matches.length;
        for(i=0; i<matchDates.length; i++){ matchDates[i] = " ";}
        var pTitle = pName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        var oTitle = oName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        for(i = 0; i < stats.length; i++){
          tooltipDates.unshift(matches[i].date);
          pServeData.unshift(stats[i].spWonPct[0]);
          pReturnData.unshift(stats[i].rpWonPct[0]);
          bpr = (stats[i].bigRatio[0][1] == 0) ? 0 
                                               : Math.round((stats[i].bigRatio[0][0]/stats[i].bigRatio[0][1])*100);
          pBigPointData.unshift(bpr);
          pRiskData.unshift(stats[i].aggressionPct[0]);
          pQualityData.unshift(Math.round((stats[i].spWonPct[0] + stats[i].rpWonPct[0] + bpr + stats[i].aggressionPct[0]) / 4));
          oServeData.unshift(stats[i].spWonPct[1]);
          oReturnData.unshift(stats[i].rpWonPct[1]);
          bpr = (stats[i].bigRatio[1][1] == 0) ? 0 
                                               : Math.round((stats[i].bigRatio[1][0]/stats[i].bigRatio[1][1])*100);
          oBigPointData.unshift(bpr);
          oRiskData.unshift(stats[i].aggressionPct[1]);
          oQualityData.unshift(Math.round((stats[i].spWonPct[1] + stats[i].rpWonPct[1] + bpr + stats[i].aggressionPct[1]) / 4));
        }
        this.synopsisTrend1 = new Chart(this.synopsisTrendContext1, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "Serve",
              fill: false,
              data: pServeData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "Return",
              fill: false,
              data: pReturnData,
              backgroundColor: this.lineColor2,
              borderColor: this.lineColor2
            }, 
            {
              label: "Big Points",
              fill: false,
              data: pBigPointData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "Risk",
              fill: false,
              data: pRiskData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }, 
            {
              label: "Quality",
              fill: false,
              data: pQualityData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            }]
          },
          options: {
            title: {
              display: true,
              text: pTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            return tooltipDates[tooltipItems[0].index];
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
        this.synopsisTrend2 = new Chart(this.synopsisTrendContext2, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "Serve",
              fill: false,
              data: oServeData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "Return",
              fill: false,
              data: oReturnData,
              backgroundColor: this.lineColor2,
              borderColor: this.lineColor2
            }, 
            {
              label: "Big Points",
              fill: false,
              data: oBigPointData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "Risk",
              fill: false,
              data: oRiskData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }, 
            {
              label: "Quality",
              fill: false,
              data: oQualityData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            }]
          },
          options: {
            title: {
              display: true,
              text: oTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            return (tooltipDates[tooltipItems[0].index] + ' (' + oNameList[tooltipItems[0].index] + ')');
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
      }
    }

    displayServesTrend(stats : any, matches : Match[], pName : string, oName : string, oNameList : string[]) : void {
      if(this.servesTrend1){ 
        this.servesTrend1.destroy();
        this.servesTrend1 = undefined;
      };
      if(this.servesTrend2){ 
        this.servesTrend2.destroy();
        this.servesTrend2 = undefined;
      };
      if(this.servesTrendContext1){
        var matchDates = [], tooltipDates = [];
        var i;
        var p1stInData = [], p1stWonData = [], p2ndInData = [], p2ndWonData = [], pGamePtsData = [], pNetWonData = [];
        var o1stInData = [], o1stWonData = [], o2ndInData = [], o2ndWonData = [], oGamePtsData = [], oNetWonData = [];
        matchDates.length = matches.length;
        for(i=0; i<matchDates.length; i++){ matchDates[i] = " ";}
        var pTitle = pName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        var oTitle = oName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        for(i = 0; i < stats.length; i++){
          tooltipDates.unshift(matches[i].date);
          p1stInData.unshift(stats[i].fsPct[0]);
          p1stWonData.unshift(stats[i].fsPctWon[0]);
          p2ndInData.unshift(stats[i].ssPct[0]);
          p2ndWonData.unshift(stats[i].ssPctWon[0]);
          pGamePtsData.unshift((stats[i].gpWon[0][1] == 0) ? 0 : Math.round((stats[i].gpWon[0][0]/stats[i].gpWon[0][1])*100));
          pNetWonData.unshift(stats[i].spWonPct[0]);
          o1stInData.unshift(stats[i].fsPct[1]);
          o1stWonData.unshift(stats[i].fsPctWon[1]);
          o2ndInData.unshift(stats[i].ssPct[1]);
          o2ndWonData.unshift(stats[i].ssPctWon[1]);
          oGamePtsData.unshift((stats[i].gpWon[1][1] == 0) ? 0 : Math.round((stats[i].gpWon[1][0]/stats[i].gpWon[1][1])*100));
          oNetWonData.unshift(stats[i].spWonPct[1]);
        }
        this.servesTrend1 = new Chart(this.servesTrendContext1, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "1st In",
              fill: false,
              data: p1stInData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "1st Won",
              fill: false,
              data: p1stWonData,
              backgroundColor: this.lineColor7,
              borderColor: this.lineColor7
            }, 
            {
              label: "2nd In",
              fill: false,
              data: p2ndInData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "2nd Won",
              fill: false,
              data: p2ndWonData,
              backgroundColor: this.lineColor8,
              borderColor: this.lineColor8
            }, 
            {
              label: "Total Won",
              fill: false,
              data: pNetWonData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            },
            {
              label: "Game Pts",
              fill: false,
              data: pGamePtsData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }]
          },
          options: {
            title: {
              display: true,
              text: pTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            var l, i;
                            l = data.datasets[tooltipItems.datasetIndex].label;
                            if(!l.match(/Game/)){
                              i = l.indexOf(" ");
                                return ( l.substr(0,i) + " Serves" + l.substr(i) + ': ' + tooltipItems.yLabel + '%');
                            }
                            return ( l + ': ' + tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            return tooltipDates[tooltipItems[0].index];
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
        this.servesTrend2 = new Chart(this.servesTrendContext2, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "1st In",
              fill: false,
              data: o1stInData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "1st Won",
              fill: false,
              data: o1stWonData,
              backgroundColor: this.lineColor7,
              borderColor: this.lineColor7
            }, 
            {
              label: "2nd In",
              fill: false,
              data: o2ndInData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "2nd Won",
              fill: false,
              data: o2ndWonData,
              backgroundColor: this.lineColor8,
              borderColor: this.lineColor8
            }, 
            {
              label: "Total Won",
              fill: false,
              data: oNetWonData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            },            
            {
              label: "Game Pts",
              fill: false,
              data: oGamePtsData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }]
          },
          options: {
            title: {
              display: true,
              text: oTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            var l, i;
                            l = data.datasets[tooltipItems.datasetIndex].label;
                            if(!l.match(/Game/)){
                              i = l.indexOf(" ");
                                return ( l.substr(0,i) + " Serves" + l.substr(i) + ': ' + tooltipItems.yLabel + '%');
                            }
                            return ( l + ': ' + tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            return (tooltipDates[tooltipItems[0].index] + ' (' + oNameList[tooltipItems[0].index] + ')');
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
      }
    }

    private displayReturnsTrend(stats : any, matches : Match[], pName : string, oName : string, oNameList : string[]) : void {
      if(this.returnsTrend1){ 
        this.returnsTrend1.destroy();
        this.returnsTrend1 = undefined;
      };
      if(this.returnsTrend2){ 
        this.returnsTrend2.destroy();
        this.returnsTrend2 = undefined;
      };
      if(this.returnsTrendContext1){
        var matchDates = [], tooltipDates = [];
        var i;
        var p1stInData = [], p1stWonData = [], p2ndInData = [], p2ndWonData = [], pBreakPtsData = [], pNetWonData = [];
        var o1stInData = [], o1stWonData = [], o2ndInData = [], o2ndWonData = [], oBreakPtsData = [], oNetWonData = [];
        matchDates.length = matches.length;
        for(i=0; i<matchDates.length; i++){ matchDates[i] = " ";}
        var pTitle = pName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        var oTitle = oName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        for(i = 0; i < stats.length; i++){
          tooltipDates.unshift(matches[i].date);
          p1stInData.unshift(stats[i].frPct[0]);
          p1stWonData.unshift(stats[i].frPctWon[0]);
          p2ndInData.unshift(stats[i].srPct[0]);
          p2ndWonData.unshift(stats[i].srPctWon[0]);
          pBreakPtsData.unshift((stats[i].bpWon[0][1] == 0) ? 0 : Math.round((stats[i].bpWon[0][0]/stats[i].bpWon[0][1])*100));
          pNetWonData.unshift(stats[i].rpWonPct[0]);
          o1stInData.unshift(stats[i].frPct[1]);
          o1stWonData.unshift(stats[i].frPctWon[1]);
          o2ndInData.unshift(stats[i].srPct[1]);
          o2ndWonData.unshift(stats[i].srPctWon[1]);
          oBreakPtsData.unshift((stats[i].bpWon[1][1] == 0) ? 0 : Math.round((stats[i].bpWon[1][0]/stats[i].bpWon[1][1])*100));
          oNetWonData.unshift(stats[i].rpWonPct[1]);
        }
        this.returnsTrend1 = new Chart(this.returnsTrendContext1, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "1st In",
              fill: false,
              data: p1stInData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "1st Won",
              fill: false,
              data: p1stWonData,
              backgroundColor: this.lineColor7,
              borderColor: this.lineColor7
            }, 
            {
              label: "2nd In",
              fill: false,
              data: p2ndInData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "2nd Won",
              fill: false,
              data: p2ndWonData,
              backgroundColor: this.lineColor8,
              borderColor: this.lineColor8
            }, 
            {
              label: "Total Won",
              fill: false,
              data: pNetWonData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            },
            {
              label: "Break Pts",
              fill: false,
              data: pBreakPtsData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }]
          },
          options: {
            title: {
              display: true,
              text: pTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            var l, i;
                            l = data.datasets[tooltipItems.datasetIndex].label;
                            if(!l.match(/Break/)){
                              i = l.indexOf(" ");
                                return ( l.substr(0,i) + " Serves" + l.substr(i) + ': ' + tooltipItems.yLabel + '%');
                            }
                            return ( l + ': ' + tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            return tooltipDates[tooltipItems[0].index];
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
        this.returnsTrend2 = new Chart(this.returnsTrendContext2, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "1st In",
              fill: false,
              data: o1stInData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "1st Won",
              fill: false,
              data: o1stWonData,
              backgroundColor: this.lineColor7,
              borderColor: this.lineColor7
            }, 
            {
              label: "2nd In",
              fill: false,
              data: o2ndInData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "2nd Won",
              fill: false,
              data: o2ndWonData,
              backgroundColor: this.lineColor8,
              borderColor: this.lineColor8
            }, 
            {
              label: "Total Won",
              fill: false,
              data: oNetWonData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            },
            {
              label: "Break Pts",
              fill: false,
              data: oBreakPtsData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }]
          },
          options: {
            title: {
              display: true,
              text: oTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            var l, i;
                            l = data.datasets[tooltipItems.datasetIndex].label;
                            if(!l.match(/Break/)){
                              i = l.indexOf(" ");
                                return ( l.substr(0,i) + " Serves" + l.substr(i) + ': ' + tooltipItems.yLabel + '%');
                            }
                            return ( l + ': ' + tooltipItems.yLabel + '%');
                          },
                  title: function(tooltipItems, data) {
                            return (tooltipDates[tooltipItems[0].index] + ' (' + oNameList[tooltipItems[0].index] + ')');
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0,
                  max: 100,
                  callback: function(value, index, values){
                    return (value + '%');
                  }
                }
              }]
            }
          }
        });          
      }
    }

    private displayRiskTrend(stats : any, matches : Match[], pName : string, oName : string, oNameList : string[]) : void {
      if(this.riskTrend1){ 
        this.riskTrend1.destroy();
        this.riskTrend1 = undefined;
      };
      if(this.riskTrend2){ 
        this.riskTrend2.destroy();
        this.riskTrend2 = undefined;
      };
      if(this.riskTrendContext1){
        var matchDates = [], tooltipDates = [];
        var i;
        var pWinnersData = [], pForcedData = [], pAcesData = [], pDoublesData = [], pUnforcedData = [], pPointsWonData = [];
        var oWinnersData = [], oForcedData = [], oAcesData = [], oDoublesData = [], oUnforcedData = [], oPointsWonData = [];
        matchDates.length = matches.length;
        for(i=0; i<matchDates.length; i++){ matchDates[i] = " ";}
        var pTitle = pName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        var oTitle = oName + ' (' + matches[matches.length-1].date + ' - ' + matches[0].date + ')';
        for(i = 0; i < stats.length; i++){
          tooltipDates.unshift(matches[i].date);
          pWinnersData.unshift(stats[i].winners[0]);
          pForcedData.unshift(stats[i].errForced[0]);
          pAcesData.unshift(stats[i].aces[0]);
          pDoublesData.unshift(stats[i].dblFaults[0]);
          pUnforcedData.unshift(stats[i].unfErrors[0]);
          pPointsWonData.unshift(stats[i].tpWon[0]);
          oWinnersData.unshift(stats[i].winners[1]);
          oForcedData.unshift(stats[i].errForced[1]);
          oAcesData.unshift(stats[i].aces[1]);
          oDoublesData.unshift(stats[i].dblFaults[1]);
          oUnforcedData.unshift(stats[i].unfErrors[1]);
          oPointsWonData.unshift(stats[i].tpWon[1]);
        }
        this.riskTrend1 = new Chart(this.riskTrendContext1, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "Winners",
              fill: false,
              data: pWinnersData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "Forced",
              fill: false,
              data: pForcedData,
              backgroundColor: this.lineColor7,
              borderColor: this.lineColor7
            }, 
            {
              label: "Aces",
              fill: false,
              data: pAcesData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "Doubles",
              fill: false,
              data: pDoublesData,
              backgroundColor: this.lineColor8,
              borderColor: this.lineColor8
            }, 
            {
              label: "Errors",
              fill: false,
              data: pUnforcedData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }, 
            {
              label: "Points Won",
              fill: false,
              data: pPointsWonData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            }]
          },
          options: {
            title: {
              display: true,
              text: pTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel);
                          },
                  title: function(tooltipItems, data) {
                            return tooltipDates[tooltipItems[0].index];
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0
                }
              }]
            }
          }
        });          
        this.riskTrend2 = new Chart(this.riskTrendContext2, {
          type: "line",
          data: {
            labels: matchDates,
            datasets: [
            {
              label: "Winners",
              fill: false,
              data: oWinnersData,
              backgroundColor: this.lineColor1,
              borderColor: this.lineColor1
            }, 
            {
              label: "Forced",
              fill: false,
              data: oForcedData,
              backgroundColor: this.lineColor7,
              borderColor: this.lineColor7
            }, 
            {
              label: "Aces",
              fill: false,
              data: oAcesData,
              backgroundColor: this.lineColor3,
              borderColor: this.lineColor3
            }, 
            {
              label: "Doubles",
              fill: false,
              data: oDoublesData,
              backgroundColor: this.lineColor8,
              borderColor: this.lineColor8
            }, 
            {
              label: "Errors",
              fill: false,
              data: oUnforcedData,
              backgroundColor: this.lineColor4,
              borderColor: this.lineColor4
            }, 
            {
              label: "Points Won",
              fill: false,
              data: oPointsWonData,
              backgroundColor: this.lineColor6,
              borderColor: this.lineColor6
            }]
          },
          options: {
            title: {
              display: true,
              text: oTitle
            },
            legend: {
              labels: {
                boxWidth: 10
              }
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                  label: function(tooltipItems, data) {
                            return (data.datasets[tooltipItems.datasetIndex].label +': ' +
                                   tooltipItems.yLabel);
                          },
                  title: function(tooltipItems, data) {
                            return (tooltipDates[tooltipItems[0].index] + ' (' + oNameList[tooltipItems[0].index] + ')');
                          }
                }
            },              
            scales: {
              yAxes: [{
                ticks: {
                  min: 0
                }
              }]
            }
          }
        });          
      }
    }
}