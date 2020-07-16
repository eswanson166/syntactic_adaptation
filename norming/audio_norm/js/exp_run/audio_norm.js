
function make_slides(f) {
  var slides = {};

  slides.consent = slide({
  	name: "consent",
  	exp_start: function() {
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
          _s.checkAnswer()
        })
      },

    checkAnswer: function(e){
    $("#compButton").click(function() {
      if (! $("#compResponse").val() || $("#compResponse").val() == '') {
        $("#compBlankError").show();
      } else {
        var comp_ans = $("#compResponse").val();
        if (comp_ans.toUpperCase().includes("SPIDER")) {
          exp.trial_no = 0;
          exp.go();
        }
        else {
          exp.wrong_soundtests.push(comp_ans);
          $("#compBlankError").hide();
          $("#compResponse").val('');
          $("#compWrongError").show();
          soundtest_audio.currentTime = 0;
          _s.compQuestion();
          }
        }
      }
    )},
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
      recording_name = recording.item;
      correct_answer = recording.correct_ans;
      recording_q = 'What part of speech is "' + recording_name + '"?';
      pos_options = _.shuffle(['noun', 'verb']);
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
          wrong_soundtests : exp.wrong_soundtests,
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
  exp.wrong_soundtests = [];
  exp.data_trials = [];

  exp.structure=["consent", "sound_test", "instructions", "single_trial",  "subj_info", "thanks"];
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

