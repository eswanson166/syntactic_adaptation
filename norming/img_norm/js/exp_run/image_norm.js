
function make_slides(f) {
  var slides = {};

  slides.consent = slide({
  	name: "consent",
  	exp_start: function() {
  	}
  });

  slides.img_check = slide({
  	name: "img_check",

    checkAnswer: function(e){
      var comp_ans = $("#compResponse").val();
      if (! comp_ans || comp_ans == '') {
        $("#compWrongError").hide();
        $("#compBlankError").show();
      }
      else if ((!comp_ans.toUpperCase().includes("CAT"))){
        exp.wrong_img_tests.push(comp_ans);
        $("#compBlankError").hide();
        $("#compResponse").val('');
        $("#compWrongError").show();
      }
      else {
        exp.trial_no = 0;
        exp.go();
      }
    }
  });

  slides.instructions = slide({
    name: "instructions",
    start_task: function(e){
      exp.go()
    }
  });

  slides.single_trial = slide({
    name: "single_trial",
    present: exp.recordings,
    present_handle: function(recording) {
      this.trial_start = Date.now();
      exp.trial_no += 1;
      pair_name = img_pair.item;
      $("#imgwrapper").show();
      exp.run_trial();
    },

    next_trial : function(e){
      if ($('input[type=radio]:checked').size() == 0) {
        $("#responseBlankError").show();
      } else {
        $("#responseBlankError").hide();
        $("#trial_compQ").hide();
        $("#answer_choices").hide();
        $("#trialContinueButton").hide();
        exp.clicked = $('input[type=radio]:checked').val();
        exp.keep_going = false;
        this.log_responses();
        console.log(exp.data_trials);
        _stream.apply(this);
        exp.clicked = null;
      }
    },

    log_responses: function(e){
      exp.data_trials.push({
        'trial_num': exp.trial_no,
        'word': recording_name,
        'part_speech1': pos_options[0],
        'part_speech2': pos_options[1],
        'selected_answer': exp.clicked,
        'correct_answer' : correct_answer,
        'trial_type': trial_type,
        'current_windowW': window.innerWidth,
        'current_windowH': window.innerHeight
      })
    } 
    
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      lg = $("#language").val();
      age = $("#participantage").val();
      gend = $("#gender").val();
      if(lg == '' || age == '' || gend == ''){
        $("#subjInfoBlank").show();
      } else {
        $("#subjInfoBlank").hide();
        exp.subj_data = {
          language : $("#language").val(),
          age : $("#participantage").val(),
          gender : $("#gender").val(),
          comments : $("#comments").val(),
          wrong_img_tests : exp.wrong_img_tests,
          time_in_minutes : (Date.now() - exp.startT)/60000
        };
        exp.go();
      }
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
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


function init_explogic() {
  exp.recordings = _.shuffle(recordings);
  exp.wrong_img_tests = [];
  exp.data_trials = [];

  exp.structure=["consent", "img_check", "instructions", "single_trial",  "subj_info", "thanks"];
  exp.slides = make_slides(exp);
  exp.nQs = utils.get_exp_length();

  exp.system = {
    Browser : BrowserDetect.browser,
    OS : BrowserDetect.OS,
    screenH: screen.height,
    screenW: screen.width,
    windowH: window.innerHeight,
    windowW: window.innerWidth,
  };

  exp.run_trial = function(){
    var trial_audio = document.getElementById('trial_audio');
    trial_audio.src = 'audio/' + recording_name + '.wav';
    $('#trial_compQ').html(recording_q);
    var answerText = '';
    answerText = answerText.concat('<input type="radio" name="answer_choices" value="'+pos_options[0]+'">&emsp;'+pos_options[0]+'</input>');
    answerText = answerText.concat('<br><input type="radio" name="answer_choices" value="'+pos_options[1]+'">&emsp;'+pos_options[1]+'</input>');
    $('#answer_choices').html(answerText);
    var trial_audio = document.getElementById("trial_audio");
        trial_audio.addEventListener('ended', function(){
          $("#trial_compQ").show();
          $("#answer_choices").show();
          $("#trialContinueButton").show();
        })
  }

  exp.display_imgs = function(){
    if (document.getElementById("img_table") != null){
      $("#img_table tr").remove();
    }
    var table = document.createElement("table");
    var tr = document.createElement('tr');

    var cellwidth = MIN_WINDOW_WIDTH/NUM_COLS
    $("#continue_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(CTE_BUTTON_WIDTH/2)})
    $("#next_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(NXT_BUTTON_WIDTH/2)})


    // create table with img elements on L and R side. show these for 2 seconds (as a 'preview') and then show the Continue button to play audio
    for (i = 0; i < NUM_COLS; i++) {
      var img_td = document.createElement('td');
      img_td.style.width = cellwidth+'px';

      var img_fname = img_fnames[descriptor_name][i]
      var img = document.createElement('img');
      img.src = 'static/imgs/'+img_fname+'.png';
      img.id = img_fname;

      // place images at L and R
      if (img.id == img_fnames[descriptor_name][0]){
        img.style.marginRight = (cellwidth - IMG_WIDTH)  + 'px';
      } else {
        img.style.marginLeft = (cellwidth - IMG_WIDTH)  + 'px';
        console.log('img.style.marginLeft = ' + img.style.marginLeft)
      }

  // EXPERIMENT RUN
  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
  }
  })

  $(".response_button").click(function(){
    var val = $(this).val();
    _s.response_button(val);
  });
  exp.go(); //show first slide
}

