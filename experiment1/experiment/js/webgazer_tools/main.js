// MINORLY ADAPTED FROM WEBGAZER'S CALIBRATION.JS FILE (https://webgazer.cs.brown.edu/)


// init webgazer  //
function init_webgazer(){
webgazer.setRegression('ridge') /* currently must set regression and tracker */
    .setTracker('clmtrackr')
    .setGazeListener(function(data, clock) {
      //   console.log(data); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
      //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
    })
    .begin()
    .showPredictionPoints(false)
    //.showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */

//Set up the webgazer video feedback.
var setup = function() {
    //Set up the main canvas. The main canvas is used to calibrate the webgazer.
    var canvas = document.getElementById("plotting_canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
};

function checkIfReady() {
    if (webgazer.isReady()) {
        setup();
    } else {
        setTimeout(checkIfReady, 100);
    }
}
setTimeout(checkIfReady,100);

}

function Restart(){
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    ClearCalibration();
    PopUpInstruction();
    doCalibration();
}
