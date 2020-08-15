
function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    exp_start: function() {
    }
  });

  slides.training_and_calibration = slide({
    name: "training_and_calibration",
    start_camera : function(e) {
      $("#start_camera").hide();
      $("#start_calibration").show();
      init_webgazer();
    },

    finish_calibration_start_task : function(e){
      if (precision_measurement > PRECISION_CUTOFF){
        $("#plotting_canvas").hide();
        $("#webgazerVideoFeed").hide();
        $("#webgazerFaceOverlay").hide();
        $("#webgazerFaceFeedbackBox").hide();
        webgazer.pause();
        exp.go();
      }
      else {
        exp.accuracy_attempts.push(precision_measurement);
        swal({
          title:"Calibration Fail",
          text: "Either you haven't performed the calibration yet, or your calibration score is too low. Your calibration score must be 50% to begin the task. Please click Recalibrate to try calibrating again.",
          buttons:{
            cancel: false,
            confirm: true
          }
        })
      }
    }

  });

  slides.sound_test = slide({
    name: "sound_test",

    compQuestion: function(e){
      $("#compQ").hide();
      $("#compButton").hide()
      $("#compResponse").hide()
      $("#compBlankError").hide()
      var soundtest_audio = document.getElementById("soundtest_audio");
        soundtest_audio.addEventListener('ended', function(){
          $("#compQ").show();
          $("#compButton").show();
          $("#compResponse").show();
          $("#compWrongError").hide();
        })
      },

    checkAnswer: function(e){
      var comp_ans = $("#compResponse").val();
      if (! comp_ans || comp_ans == '') {
        $("#compBlankError").show();
      }
      else if ((!comp_ans.toUpperCase().includes("SPIDER"))){
        exp.wrong_soundtests.push(comp_ans);
        $("#compBlankError").hide();
        $("#compResponse").val('');
        $("#compWrongError").show();
        $("#compQ").hide();
        $("#compButton").hide();
        $("#compResponse").hide();
        soundtest_audio.currentTime = 0;
      }
      else {
        exp.go();
      }
    }
  });

  slides.single_trial = slide({
    name: "single_trial",
    present: exp.img_pairs,
    present_handle: function(img_pair) {
      this.trial_start = Date.now();
      exp.trial_no += 1;
      $("#aud").hide();
      img_pair_name = img_pair.item;
      if (exp.order == "order1") {
        left_img_type = img_side_order1[(exp.trial_no - 1)];
        right_img_type = img_side_order2[(exp.trial_no - 1)];
      }
      else {
        left_img_type = img_side_order2[(exp.trial_no - 1)];
        right_img_type = img_side_order1[(exp.trial_no - 1)];
      }
      img1_name = exp.img_pairs[exp.trial_no][left_img_type];
      img2_name = exp.img_pairs[exp.trial_no][right_img_type];

      exp.display_imgs(); // show images

      // get data from webgazer
      //webgazer.resume();
      webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) {
          return;
        }
        var xprediction = data.x; //these x coordinates are relative to the viewport
        var yprediction = data.y; //these y coordinates are relative to the viewport
        exp.tlist.push(elapsedTime);
        exp.xlist.push(xprediction);
        exp.ylist.push(yprediction);
      });

      $("#imgwrapper").show();
      $("#continue_button").hide();
      $("#next_button").hide();
      $(".err").hide();
      $(".err_part2").hide();
    },

    next_trial : function(e){
        exp.keep_going = false;
        this.log_responses();
        _stream.apply(this);
        exp.tlist = [];
        exp.xlist = [];
        exp.ylist = [];
    },

    log_responses : function (){
      exp.data_trials.push({
        "condition": exp.condition,
        "order": exp.order,
        "trial_no" : exp.trial_no,
        "descriptor" : descriptor_name,
        "descriptor_condition": descriptor_condition,
        'left_video' : vid1_fname,
        'right_video' : vid2_fname,
        "start_time" : _s.trial_start,
        "current_windowW" : window.innerWidth,
        "current_windowH" : window.innerHeight,
        "end_pre1_time" : exp.end_pre1_time,
        "pre1_duration" : exp.end_pre1_time - _s.trial_start,
        "pre1_time_from_start" : exp.end_pre1_time - _s.trial_start,
        "end_pre2_time" : exp.end_pre2_time,
        "pre2_duration" : exp.end_pre2_time - exp.end_pre1_time,
        "pre2_time_from_start": exp.end_pre2_time - _s.trial_start,
        "end_contrast_time" : exp.end_contrast_time,
        "contrast_duration" : exp.end_contrast_time - exp.end_pre2_time,
        "contrast_time_from_start": exp.end_contrast_time - _s.trial_start,
        "end_audio_time" : exp.end_audio_time,
        "audio_duration" : exp.end_audio_time - exp.end_contrast_time,
        "audio_time_from_start": exp.end_audio_time - _s.trial_start,
        "end_event_time" : exp.end_event_time,
        "event_duration": exp.end_event_time - exp.end_contrast_time,
        "event_time_from_start": exp.end_event_time -_s.trial_start,
        'time' : exp.tlist,
        'x' : exp.xlist,
        'y': exp.ylist
      });
    }

  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      lg = $("#language").val();
      age = $("#participantage").val();
      gend = $("#gender").val();
      eyesight = $("#eyesight").val();
      eyesight_task = $("#eyesight_task").val();
      prolific_id
      if(lg == '' || age == '' || gend == '' || eyesight == '-1' || eyesight_task == '-1'){
        $(".err_part2").show();
      } else {
        $(".err_part2").hide();
        exp.subj_data = {
          language : $("#language").val(),
          age : $("#participantage").val(),
          gender : $("#gender").val(),
          eyesight : $("#eyesight").val(),
          eyesight_task : $("#eyesight_task").val(),
          prolific_id : $("#prolific_id").val(),
          comments : $("#comments").val(),
          accuracy : precision_measurement,
          previous_accuracy_attempts : exp.accuracy_attempts,
          time_in_minutes : (Date.now() - exp.startT)/60000
        };
        exp.go();
      }
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      webgazer.stopVideo();
      exp.data= {
        "trials" : exp.data_trials,
        "system" : exp.system,
        "subject_information" : exp.subj_data,
      };
      console.log(turk);
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}


/// init ///
function init_explogic() {

  //Experiment constants
  NUM_CONDITIONS = 1;
  PRECISION_CUTOFF = 50;
  NUM_COLS = 2;
  MIN_WINDOW_WIDTH = 1280;
  BUTTON_HEIGHT = 30;
  CTE_BUTTON_WIDTH = 100;
  NXT_BUTTON_WIDTH = 50;
  IMG_HEIGHT = 288;
  IMG_WIDTH = 400;

  //Initialize data frames
  exp.trial_no = 0;
  exp.accuracy_attempts = [];
  exp.data_trials = [];
  exp.tlist = []; //TESTING
  exp.xlist = [];
  exp.ylist = [];
  exp.clicked = null;
  exp.wrong_soundtests = [];
  exp.condition = _.sample(["noun", "verb", "baseline"]);
  exp.img_side_order = _.sample(["img_side_order1", "img_side_order2"]);
  exp.fam_img_pairs = _.shuffle(fam_img_pairs);
  exp.nov_img_pairs = _.shuffle(nov_img_pairs);
  exp.img_pairs = exp.fam_img_pairs.concat(exp.nov_img_pairs);
  console.log(exp.img_pairs);


  // Define the orders
  img_side_order1 = ["noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb"];
  img_side_order2 = ["verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun"];

  // ADD LATER!!
  if (exp.condition == "noun" | exp.condition == "verb") {
    order1 = [exp.condition, "filler", exp.condition, "filler", "filler", exp.condition, "filler", exp.condition];
    order2 = ["filler", exp.condition, "filler", exp.condition, exp.condition, "filler", exp.condition, "filler"];
    exp.order = _.sample(["order1", "order2"]);
  }
  else {
    exp.order = ["filler", "filler", "filler", "filler", "filler", "filler", "filler", "filler"];
  }


  //create experiment order and make slides
  exp.structure=[/*"i0",  "training_and_calibration", "sound_test", */"single_trial", "subj_info", "thanks"];
  exp.slides = make_slides(exp);
  exp.nQs = utils.get_exp_length();

  exp.system = {
    Browser : BrowserDetect.browser,
    OS : BrowserDetect.OS,
    screenH: screen.height,
    screenW: screen.width,
    windowH: window.innerHeight,
    windowW: window.innerWidth,
    imageH: IMG_HEIGHT,
    imageW: IMG_WIDTH
  };


  // EXPERIMENT FUNCTIONS
  exp.display_imgs = function(){

    // Set up videos
    webgazer.resume()
    if (document.getElementById("img_table") != null){
      $("#img_table tr").remove();
    }
    var table = document.createElement("table");
    var tr = document.createElement('tr');

    var cellwidth = MIN_WINDOW_WIDTH/NUM_COLS
    $("#continue_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(CTE_BUTTON_WIDTH/2)})
    $("#next_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(NXT_BUTTON_WIDTH/2)})

    // first image
    var img1_td = document.createElement('td');
      img1_td.style.width = cellwidth+'px';
      
      var img1 = document.createElement('img');
      img1.src = 'static/images/'+img1_name+'.jpg';
      img1.id = img1_name;
      img1.height = IMG_HEIGHT;
      img1.width = IMG_WIDTH;
      img1.style.marginRight = (cellwidth - IMG_WIDTH)  + 'px';

    // second image
    var img2_td = document.createElement('td');
      img2_td.style.width = cellwidth+'px';

      var img2 = document.createElement('img');
      img2.src = 'static/images/'+img2_name+'.jpg';
      img2.id = img2_name;
      img2.height = IMG_HEIGHT;
      img2.width = IMG_WIDTH;
      img2.style.marginLeft = (cellwidth - IMG_WIDTH)  + 'px';

      // create table with images
      img1_td.appendChild(img1);
      img2_td.appendChild(img2);
      tr.appendChild(img1_td);
      tr.appendChild(img2_td);
      
 
    table.setAttribute('id', 'img_table');
    table.appendChild(tr);
    document.getElementById("imgwrapper").appendChild(table);

    // hide second image until first image preview is done playing
    img2.style.visibility = 'hidden';
    $("#continue_button").hide();
  

    //audio preview
    setTimeout(function(){
      exp.end_pre1_time = Date.now();
      img1.style.visibility = 'hidden';
      img2.style.visibility = 'visible';
      img_reset();
    }, 6000)

    img_reset = function(){
      setTimeout(function(){
        exp.end_pre2_time = Date.now();
        img1.style.visibility = 'hidden';
        img2.style.visibility = 'hidden';
        start_contrast();
      }, 6000)
    }

    // contrast: both images at once
    start_contrast = function(){
      setTimeout(function(){
        exp.end_pre2_time = Date.now();
        img1.style.visibility = 'visible';
        img2.style.visibility = 'visible';
        img_event_reset();
      }, 1000)
    }

    img_event_reset = function(){
      setTimeout(function(){
        exp.end_contrast_time = Date.now();
        img1.style.visibility = 'hidden';
        img2.style.visibility = 'hidden';
        start_event();
        }, 6000)
    }

    start_event = function(){
      setTimeout(function(){
        img1.style.visibility = 'visible';
        img2.style.visibility = 'visible';
        }, 1000)
    }

  }

  // EXPERIMENT RUN
  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#windowsize_err").hide();
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      if (window.innerWidth >=  MIN_WINDOW_WIDTH){
        exp.startT = Date.now();
        exp.go();
        // set up canvas for webgazer
        ClearCanvas();
        helpModalShow();
        $("#start_calibration").hide();
        $("#begin_task").hide();
      }
      else {
          $("#windowsize_err").show();
      }
    }
  });

  $(".response_button").click(function(){
    var val = $(this).val();
    _s.continue_button(val);
  });
  exp.go(); //show first slide
}
