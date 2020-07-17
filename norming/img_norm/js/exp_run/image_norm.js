
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
    present: exp.img_pairs,
    present_handle: function(img_pair) {
      this.trial_start = Date.now();
      exp.trial_no += 1;
      img_pair_name = img_pair.item;
      imgs_pair = img_pair.pair;
      $("#imgwrapper").show();
      $("#trial_continue_button").hide();
      exp.display_imgs();
    },

    next_trial : function(e){
        $("#continue_button").hide();
        exp.keep_going = false;
        this.log_responses();
        _stream.apply(this);
        exp.clicked = null;
    },

    log_responses: function(e){
      exp.data_trials.push({
        'trial_num': exp.trial_no,
        'selected_img': exp.clicked,
        'selected_img_type': exp.selected_img_type,
        'current_windowW': window.innerWidth,
        'current_windowH': window.innerHeight
      })
      console.log(exp.data_trials);
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

  PRECISION_CUTOFF = 50;
  NUM_COLS = 2;
  MIN_WINDOW_WIDTH = 800;
  BUTTON_HEIGHT = 30;
  CTE_BUTTON_WIDTH = 100;
  NXT_BUTTON_WIDTH = 50;
  IMG_HEIGHT = 300;
  IMG_WIDTH = 300;

  exp.img_pairs = _.shuffle(img_pairs);
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
    imageH: IMG_HEIGHT,
    imageW: IMG_WIDTH
  };


  exp.display_imgs = function(){
    if (document.getElementById("img_table") != null){
      $("#img_table tr").remove();
    }
    var table = document.createElement("table");
    var tr = document.createElement('tr');

    var cellwidth = MIN_WINDOW_WIDTH/NUM_COLS
    //$("#continue_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(CTE_BUTTON_WIDTH/2)})

    var imgs = _.shuffle(imgs_pair);

    // create table with img elements on L and R side. show these for 2 seconds (as a 'preview') and then show the Continue button to play audio
    for (i = 0; i < NUM_COLS; i++) {
      var img_td = document.createElement('td');
      img_td.style.width = cellwidth+'px';

      var img_name = imgs[i]
      var img = document.createElement('img');
      img.src = 'images/'+img_name+'.png';
      img.alt = img_name;
      img.height = IMG_WIDTH;
      img.width = IMG_HEIGHT;

      // place images at L and R
      if (img_name == imgs[0]){
        img.style.marginRight = (cellwidth - IMG_WIDTH)  + 'px';
        img.id = "left_img";
      } else {
        img.style.marginLeft = (cellwidth - IMG_WIDTH)  + 'px';
        img.id = "right_img";
      }

      img.times_clicked = 0

      img.onclick = function(){
        var id = $(this).attr("id");
        var name = $(this).attr("alt");
        if (id == "left_img"){
          $(this).css("border","2px solid red");
          $("#right_img").css("border","2px solid white");
        }
        else {
          $(this).css("border","2px solid red");
          $("#left_img").css("border","2px solid white");
        }
        exp.clicked = name;
        exp.selected_img_type = img_types[name];
        $("#trial_continue_button").show();
      };

      img_td.appendChild(img);
      tr.appendChild(img_td);
    }
    table.setAttribute('id', 'img_table')
    table.appendChild(tr);
    document.getElementById("imgwrapper").appendChild(table);
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

