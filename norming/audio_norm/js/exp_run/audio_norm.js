
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
        exp.trial_no = 0;
        exp.go();
      }
    }
  });

  slides.instructions_eng = slide({
    name: "instructions_eng",
    start_task: function(e){
      exp.go()
    }
  });

  slides.eng_trial = slide({
    name: "eng_trial",
    present: exp.recordings_eng,
    present_handle: function(recording) {
      this.trial_start = Date.now();
      exp.trial_no += 1;
      recording_name = recording.item;
      correct_answer = recording.correct_ans;
      word_type = recording.word_type;
      recording_q = 'What does "' + recording_name + '" describe?';
      pos_options = _.shuffle(['An object', 'An action']);
      _s.run_trial_eng();
    },

    run_trial_eng : function(){
      var trial_audio = document.getElementById('trial_audio_eng');
      trial_audio.src = 'audio/' + recording_name + '.wav';
      $('#trial_compQ_eng').html(recording_q);
      var answerText = '';
      answerText = answerText.concat('<input type="radio" name="answer_choices_eng" value="'+pos_options[0]+'">&emsp;'+pos_options[0]+'</input>');
      answerText = answerText.concat('<br><input type="radio" name="answer_choices_eng" value="'+pos_options[1]+'">&emsp;'+pos_options[1]+'</input>');
      $('#answer_choices_eng').html(answerText);
      var trial_audio = document.getElementById("trial_audio_eng");
      trial_audio.addEventListener('ended', function(){
        $("#trial_compQ_eng").show();
        $("#answer_choices_eng").show();
        $("#trialContinueButton_eng").show();
        })
    },

    next_trial : function(e){
      if ($('input[type=radio]:checked').size() == 0) {
        $("#responseBlankError_eng").show();
      } else {
        $("#responseBlankError_eng").hide();
        $("#trial_compQ_eng").hide();
        $("#answer_choices_eng").hide();
        $("#trialContinueButton_eng").hide();
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
        'word_type': word_type,
        'current_windowW': window.innerWidth,
        'current_windowH': window.innerHeight
      })
    } 
    
  });

  slides.instructions_alien = slide({
    name: "instructions_alien",
    continue_task: function(e){
      exp.go()
    }
  });

  slides.alien_trial = slide({
    name: "alien_trial",
    present: exp.recordings_alien,
    present_handle: function(recording) {
      this.trial_start = Date.now();
      exp.trial_no += 1;
      recording_name = recording.item;
      correct_answer = recording.correct_ans;
      word_type = recording.word_type;
      recording_q = 'What does "' + recording_name + '" describe?';
      pos_options = _.shuffle(['An object', 'An action']);
      _s.run_trial_alien();
    },

    run_trial_alien : function(){
      var trial_audio = document.getElementById('trial_audio_alien');
      trial_audio.src = 'audio/' + recording_name + '.wav';
      $('#trial_compQ_alien').html(recording_q);
      var answerText = '';
      answerText = answerText.concat('<input type="radio" name="answer_choices_eng" value="'+pos_options[0]+'">&emsp;'+pos_options[0]+'</input>');
      answerText = answerText.concat('<br><input type="radio" name="answer_choices_eng" value="'+pos_options[1]+'">&emsp;'+pos_options[1]+'</input>');
      $('#answer_choices_alien').html(answerText);
      var trial_audio = document.getElementById("trial_audio_alien");
      trial_audio.addEventListener('ended', function(){
        $("#trial_compQ_alien").show();
        $("#answer_choices_alien").show();
        $("#trialContinueButton_alien").show();
        })
    },

    next_trial : function(e){
      if ($('input[type=radio]:checked').size() == 0) {
        $("#responseBlankError_alien").show();
      } else {
        $("#responseBlankError_alien").hide();
        $("#trial_compQ_alien").hide();
        $("#answer_choices_alien").hide();
        $("#trialContinueButton_alien").hide();
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
        'word_type': word_type,
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
  exp.recordings_eng = recordings_eng;
  exp.recordings_alien = _.shuffle(recordings_alien);
  exp.wrong_soundtests = [];
  exp.data_trials = [];

  exp.structure=["consent", "sound_test", "instructions_eng", "eng_trial", "instructions_alien", "alien_trial", "subj_info", "thanks"];
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

