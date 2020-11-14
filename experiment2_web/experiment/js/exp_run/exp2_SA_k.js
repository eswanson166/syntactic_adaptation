
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

      start_cam_aud = document.createElement('audio');
      start_cam_aud.src = 'static/instructions/start_camera.mp3';
      start_cam_aud.play();
      document.getElementById("kids_photo2").style.display = "none";
      document.getElementById("modal-body").style.display = "inline";

      $("#start_camera").hide();
      $("#start_calibration").show();
      //$("#begin_task").show();

      init_webgazer();
    },

    finish_calibration_start_task : function(e){
      /*if (precision_measurement > PRECISION_CUTOFF){
        /*$("#plotting_canvas").hide();
        $("#webgazerVideoFeed").hide();
        $("#webgazerFaceOverlay").hide();
        $("#webgazerFaceFeedbackBox").hide();*/
        hideVideoElements();
        webgazer.pause();

        exp.go();

        instructions_aud = document.createElement('audio');
        instructions_aud.src = 'static/instructions/instructions_l.mp3';
        instructions_aud.play();

        //exp.go();

        instructions_aud.addEventListener('ended', function(){
        exp.go();
      })

      /*else {
        exp.accuracy_attempts.push(precision_measurement);
        swal({
          title:"Calibration Fail",
          text: "Either you haven't performed the calibration yet, or your calibration score is too low. Your calibration score must be 50% to begin the task. Please click Recalibrate to try calibrating again.",
          buttons:{
            cancel: false,
            confirm: true
          }
        })
      }*/
    }

  });

  slides.sound_test = slide({
    name: "sound_test",
    soundtest_OK : function(e){
      exp.trial_no = 0;
      exp.go();
    }
  });

  slides.instructions = slide({
    name: "instructions",
    start_task: function(e){
      exp.trial_no = 0;
      exp.go()
    }
  });


  slides.single_trial = slide({
    name: "single_trial",
    present: exp.img_pairs,
    present_handle: function(img_pair) {
      this.trial_start = Date.now();
      exp.trial_no += 1;
      exp.trial_type = exp.order[exp.trial_no - 1];
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
      img1_name = img_pair[left_img_type];
      img2_name = img_pair[right_img_type];

      exp.run_trial(); // show images

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
        end_trial_time = Date.now();
        exp.keep_going = false;
        this.log_responses();
        console.log(exp.data_trials);
        _stream.apply(this);
        exp.tlist = [];
        exp.xlist = [];
        exp.ylist = [];
    },

    log_responses : function (){
      exp.data_trials.push({
        "condition": exp.condition,
        'img_side_order' : exp.img_side_order,
        "trial_no" : exp.trial_no,
        "img_pair_name" : img_pair_name,
        'trial_type': exp.trial_type,
        'target_audio_type': exp.order[exp.trial_no - 1],
        'target_audio' : audio_event_name,
        'left_img' : img1_name,
        'right_img' : img2_name,
        'clicked_img' : exp.clicked,
        "start_time" : _s.trial_start,
        "current_windowW" : window.innerWidth,
        "current_windowH" : window.innerHeight,
        "end_pre1_time" : end_pre1_time,
        "end_pre2_time" : end_pre2_time,
        'end_img_reset_time': end_img_reset_time,
        "end_contrast_time" : end_contrast_time,
        'start_event_time': start_event_time,
        "end_event_time" : end_event_time,
        'end_trial_time' : end_trial_time,
        'start_event_timept': start_event_timept,
        'end_event_timept': end_event_timept,
        'time' : exp.tlist,
        'x' : exp.xlist,
        'y': exp.ylist
      });
    }

  });

  slides.elmo = slide({
    name : "elmo",
    start : function() {
      webgazer.end();
      exp.data= {
        "trials" : exp.data_trials,
        "system" : exp.system,
        "subject_information" : exp.subj_data,
      };
      console.log(turk);
      //setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      lg = $("#language").val();
      age = $("#participantage").val();
      gend = $("#gender").val();
      if(lg == '' || age == '' || gend == ''){
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
      //webgazer.end();
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
  exp.clicked = "none";
  exp.wrong_soundtests = [];
  //exp.condition = _.sample(["noun", "verb", "baseline"]);
  exp.condition = "verb";
  exp.img_side_order = _.sample(["img_side_order1", "img_side_order2"]);
  exp.fam_img_pairs = _.shuffle(fam_img_pairs);
  exp.nov_img_pairs = _.shuffle(nov_img_pairs);
  exp.img_pairs = exp.fam_img_pairs.concat(exp.nov_img_pairs);

  var arraysMatch = function (arr1, arr2) {

  // Check if the arrays are the same length
  if (arr1.length !== arr2.length) return false;

  // Check if all items exist and are in the same order
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  // Otherwise, return true
  return true;
  };


  // Define the image side orders
  img_side_order1 = ["noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb"];
  img_side_order2 = ["verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun", "verb", "noun"];

  // Define the filler vs. main trial orders
  repeat_cond = [exp.condition, exp.condition, exp.condition];
  repeat_verb_filler = ["verb_filler", "verb_filler", "verb_filler"];
  repeat_noun_filler = ["noun_filler", "noun_filler", "noun_filler"];

  while (true) {

    if (exp.condition == "noun") {
      exp.order = _.shuffle(["noun", "noun", "noun", "noun", "verb_filler", "verb_filler", "verb_filler", "verb_filler"]);
    }

    if (exp.condition == "verb") {
      exp.order = _.shuffle(["verb", "verb", "verb", "verb", "noun_filler", "noun_filler", "noun_filler", "noun_filler"]);
    }

    if (exp.condition == "baseline") {
      exp.order = _.shuffle(["verb_filler", "verb_filler", "verb_filler", "verb_filler", "noun_filler", "noun_filler", "noun_filler", "noun_filler"]);
    }

    // check that we don't have too many repeated trials; if we do, regenerate the order
    order_triplet_checks = [];

    for (i = 0; i < 8; i++) {
      elem = exp.order[i];
      elem_triplet = [elem, exp.order[i+1], exp.order[i+2]];
      if (arraysMatch(elem_triplet, repeat_cond) | arraysMatch(elem_triplet, repeat_verb_filler) | arraysMatch(elem_triplet, repeat_noun_filler)) {
        order_triplet_checks.push(false);
        // there are repeated trials, so this fails
      }
      else {
        order_triplet_checks.push(true);
        // there aren't too many repeated trials, so this passes
      }
    }

    // if the whole exp.order passes, we can stop generating orders
    if (!order_triplet_checks.includes(false)){
      break
    }

  }

  exp.order = exp.order.concat(["novel", "novel", "novel", "novel"]);

  //create experiment order and make slides
  exp.structure=["i0", "training_and_calibration", /*"sound_test", */"instructions", "single_trial", "elmo", "subj_info", "thanks"];
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
  exp.run_trial = function(){

    // SET UP IMAGES
    $("#click_img_txt").hide();
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

      // click function for last trial
      img1.onclick = function(){
        if (exp.trial_no == 12){
          var id = $(this).attr("id");
          exp.clicked = id;
          $(this).css("border","2px solid red");
          $("#click_img_text").hide();
          $("#continue_button").show();

        }
      }

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

      // click function for last trial
      img2.onclick = function(){
        if (exp.trial_no == 12){
          var id = $(this).attr("id");
          exp.clicked = id;
          $(this).css("border","2px solid red");
          $("#click_img_text").hide();
          $("#continue_button").show();
        }
      }
      
 
    table.setAttribute('id', 'img_table');
    table.appendChild(tr);
    document.getElementById("imgwrapper").appendChild(table);

    // hide second image until first image preview is done playing
    img2.style.visibility = 'hidden';
    $("#continue_button").hide();



    // CREATE AUDIO ELEMENTS

    // get audio intros
    audio_intros = _.sample([1, 2, 3, 4, 5, 6], 2);

    // audio preview 1
    audio_preview1 = document.createElement('audio');
    audio_preview1.src = 'static/audio/intro' + audio_intros[0] + '.wav';
    audio_preview1.play();

    // audio preview 2
    audio_preview2 = document.createElement('audio');
    audio_preview2.src = 'static/audio/intro' + audio_intros[1] + '.wav';

    // contrast
    audio_contrast = document.createElement('audio');
    audio_contrast.src = 'static/audio/contrast' + _.sample([1, 2, 3, 4]) + '.wav';

    // EVENT
    audio_event = document.createElement('audio');
    audio_event_name = audio_names[img_pair_name][exp.trial_type]; 
    audio_event.src = 'static/audio/' + audio_event_name + '.wav';



    // RUN TRIALS

    //audio preview
    setTimeout(function(){
      exp.end_pre1_time = Date.now();
      img1.style.visibility = 'hidden';
      img2.style.visibility = 'visible';
      end_pre1_time = Date.now() - _s.trial_start;
      img_reset();
      audio_preview2.play();
    }, 6000)

    img_reset = function(){
      setTimeout(function(){
        exp.end_pre2_time = Date.now();
        img1.style.visibility = 'hidden';
        img2.style.visibility = 'hidden';
        end_pre2_time = Date.now() - _s.trial_start;
        start_contrast();
      }, 6000)
    }

    // contrast: both images at once
    start_contrast = function(){
      setTimeout(function(){
        exp.end_pre2_time = Date.now();
        img1.style.visibility = 'visible';
        img2.style.visibility = 'visible';
        end_img_reset_time = Date.now() - _s.trial_start;
        img_event_reset();
        audio_contrast.play();
      }, 1000)
    }

    img_event_reset = function(){
      setTimeout(function(){
        exp.end_contrast_time = Date.now();
        img1.style.visibility = 'hidden';
        img2.style.visibility = 'hidden';
        end_contrast_time = Date.now() - _s.trial_start;
        start_event();
        }, 6000)
    }

    // event phase: key part of trial
    start_event = function(){
      setTimeout(function(){
        img1.style.visibility = 'visible';
        img2.style.visibility = 'visible';
        start_event_time = Date.now() - _s.trial_start;
        start_event_timept = Date.now();
        end_event();
        audio_event.play();
        }, 1000)
    }

    end_event = function(){
      setTimeout(function(){
        end_event_time = Date.now() - _s.trial_start;
        end_event_timept = Date.now();
        webgazer.pause();
        if (exp.trial_no == 12) {
          play_elmo();
        }
        /*if (exp.trial_no == 4) {
          great_job();
        }
        if (exp.trial_no == 8) {
          awesome_job();
        }*/
        //else {
          _s.next_trial();
        //}
        }, 8000)
    }

    great_job = function(){
      exp.trial_no = "good_job"
      great_job_aud = document.createElement('audio');
      great_job_aud.src = 'static/instructions/good_job.mp3';
      great_job_aud.play();
      great_job_aud.addEventListener('ended', function(){
        exp.trial_no = 4;
        _s.next_trial();
        })
    }

    awesome_job = function(){
      exp.trial_no = "awesome_job"
      awesome_job_aud = document.createElement('audio');
      awesome_job_aud.src = 'static/instructions/awesome_job.mp3';
      awesome_job_aud.play();
      awesome_job_aud.addEventListener('ended', function(){
        exp.trial_no = 8;
        _s.next_trial();
        })
    }

    play_elmo = function(){
      elmo_aud = document.createElement('audio');
      elmo_aud.src = 'static/instructions/elmo.mp3';
      elmo_aud.play();
      elmo_aud.addEventListener('ended', function(){
        $("#elmo_moves").get(0).play();
        $("#elmo_moves").get(0).addEventListener('ended', function(){
          play_end_aud()
    })
    })
  }

    play_end_aud = function(){
      exp.go()
      end_aud = document.createElement('audio');
      end_aud.src = 'static/instructions/end.mp3';
      end_aud.play();
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
        overview = document.createElement('audio');
        overview.src = 'static/instructions/overview.mp3';
        overview.play();
        overview.addEventListener('ended', function(){
        $("#start_camera").visibility = "visible";
        })

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
