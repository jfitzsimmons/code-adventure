/*
MUSIC
*/

let active_source = null;
let buffers = {};
const context = new(window.AudioContext || window.webkitAudioContext)();
let offset = 0;
const tempo = 5.33375;
const tracks = document.getElementsByClassName('track');

function playTrack(url) {
  let buffer = buffers[url];
  let source = context.createBufferSource();

  source.buffer = buffer;
  source.connect(context.destination);
  source.loop = true;

  if (offset == 0) {
    source.start();
    offset = context.currentTime;
    active_source = source;
  } else {
    let relativeTime = context.currentTime - offset;
    let beats = relativeTime / tempo;
    let remainder = beats - Math.floor(beats);
    let delay = tempo - (remainder*tempo);
    let when = context.currentTime+delay;

    stopActiveSource(when);
    source.start(context.currentTime+delay,relativeTime+delay);
    active_source = source;
    source.onended = function() {
      active_source = null;
    };
  }
}

for (var i = 0, len = tracks.length; i < len; i++) {
  tracks[i].addEventListener('click', function(e) {
    playTrack(this.href);
    e.preventDefault();
  });
  getBuffer(tracks[i].href);
}

function getBuffer(url) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function(evt) {
    context.decodeAudioData(request.response, store);
  };
  request.send();

  function store(buffer) {
    buffers[url] = buffer;
  }
}

function stopActiveSource(when) {
  if (active_source) {
    active_source.onended = null;
    active_source.stop(when);
  }
}


let stopTime = 0;
let startTime = 0;
const stings = [0,2,4,6,8,10]
const stingAudio = document.getElementById('stingAudio');

function playSting() {
  startTime = rndmArrI(stings);
  stingAudio.currentTime = startTime;
  stopTime = startTime + 1;
  stingAudio.play();
}

stingAudio.addEventListener('timeupdate', function() {
  if (this.currentTime > stopTime) {
    this.pause();
  }
}, false);

const rndmArrI = (a) => a[Math.floor(Math.random() * a.length)];

function makeNewPosition(){
    var h = $('.bug').parent().height() - 50;
    var w = $('.bug').parent().width() - 50;

    var nh = Math.floor(Math.random() * h);
    var nw = Math.floor(Math.random() * w);

    return [nh,nw];
}

function animateDiv(){
    var newq = makeNewPosition();
    var oldq = $('.bug').offset();
    var speed = calcSpeed([oldq.top, oldq.left], newq);

    $('.bug').delay(speed).animate({ top: newq[0], left: newq[1] }, speed, function(){
      var a = Math.random() * (180 - -180)+180;
      $('.bug').css('transform', 'rotate(' + a + 'deg) scale(1.25)');
      animateDiv();
    });
};

function calcSpeed(prev, next) {
    var x = Math.abs(prev[1] - next[1]);
    var y = Math.abs(prev[0] - next[0]);
    var greatest = x > y ? x : y;
    var speedModifier = 0.05;
    var speed = Math.ceil(greatest/speedModifier);
    return speed;
}

/*
GAMEPLAY
*/
let keycount = 0;
$('#screen').bind('input propertychange', function() {
  keycount++;
  (keycount % 10 === 0 && playSting());
  let valueCheck = this.value;
  valueCheck = valueCheck.replace(/\s/g, '').toLowerCase();
  if(valueCheck === '<div></div>'){
    $( ".bottom-grid .row1-col1" ).addClass( "wallpaper" );
    playSting();
    $(this).val('');
  }
  if(valueCheck === '<div>helloworld!</div>'){
    $('.info-window').hide();
    $('.alerts').hide();
    playSting();
    $(this).val('');
    typeWriter();
  }
  if(valueCheck === 'helloworld!'){
    $('.info-window').hide();
    $('.letter').hide();
    animateDiv();
    playSting();
    $(this).val('');
    $('.alerts').show();
  }
  if(valueCheck === '<style>.wall{background:#fade00;}</style>'){
    $('.info-window').hide();
    $('#windowsill').hide();
    $('.window-link').addClass('alert-link');
    $('.new-views').show();
    playSting();
    $(this).val('');
  }
  if(valueCheck === '<li><ahref="index.html">home</a></li>'){
    $('.info-window').hide();
    $('.window-link').removeClass('alert-link');
    $('.view-link.v07').parent().hide();
    $('.bug').addClass('task');
    playSting();
    $(this).val('');
    clickStart();
  }
//environment: without value
  if(valueCheck.indexOf( "bugname:" ) != -1 && valueCheck.indexOf( "severity:" ) != -1 && valueCheck.indexOf( "reportedby:" ) != -1 && valueCheck.indexOf( "environment:" ) != -1){
    $('.info-window').hide();
    $('.bug').hide();
    playSting();
    $(this).val('');
  }
});

var i = 0;
var txt = "((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n(('.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'))\n))'.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'((\n(('.'.'.'.'.;'   |    `:'.'.'.'.'.'))\n))'.'.'.'.';'    |     `:.'.'.'.'.'((\n(('.'.'.'.;'     |      `:'.'.'.'.'))\n))'.'.'.';'______|_______`:.'.'.'.'((\n((======0'       |        `0=======))\n))'.'.'.':       |         :'.'.'.'((\n))'.'.'.':     (a()@       :'.'.'.'((\n(('.'.'.'.    @()@()@      .'.'.'.'))\n))'.'.'.'.   ()@()@)()     .'.'.'.'((\n(('.'.'.'.    __\\|/__      .'.'.'.'))\n))'.'.'.'.   |-------|     .'.'.'.'((\n(('.'.'.'.    \\     /      .'.'.'.'))\n(('.'.'.'._____\\___/_______.'.'.'.'))\n))'.'.'.'==================='.'.'.'((\n))'.'.'.'==================='.'.'.'((\n(('.'.'.'                   '.'.'.'))\n   ~~~~                       ~~~~"; /* The text */
var speed = 30; /* The speed/duration of the effect in milliseconds */
function typeWriter() {

  if (i < txt.length) {
    document.getElementById("windowsill").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  } else {
    $("#windowsill:contains('a')").html(function(_, html) {
      return html.replace(/(a)/g, '<a class="game-link alert-link" href="#0">a</a>');
    });
    clickStart();
  }
}
function clickStart() {
  $( ".game-link" ).click(function() {
    $('.info-window').hide();
    $(".info-window."+ $(this).text()).show();
  });
  $( ".task" ).click(function() {
    $('.info-window').hide();
    $(".bugreport").show();
  });
}

$('.view-link').click(function() {
  $(".bottom-grid").removeClass (function (index, className) {
    return (className.match (/\bv0\S+/g) || []).join(' ');
  });
  $(".bottom-grid").addClass($(this).attr("data-view"));
  $(".check").html('&#10063;');
  $(".check", this).html('&#10003;');
});

$( ".close" ).click(function() {
  $('.info-window').hide();
});

clickStart();
getTime()

function getTime() {
  const currentdate = new Date();
  let hours = currentdate.getHours();
  let minutes = currentdate.getMinutes();
  hours = ("0" + hours).slice(-2);
  minutes = ("0" + minutes).slice(-2);

  document.getElementById("hour-1").innerHTML = getDigit(hours.charAt(0));
  document.getElementById("hour-2").innerHTML = getDigit(hours.charAt(1));
  document.getElementById("min-1").innerHTML  = getDigit(minutes.charAt(0));
  document.getElementById("min-2").innerHTML  = getDigit(minutes.charAt(1));
}

window.onload = function() { setInterval(getTime,60000)};

function getDigit(d) {
  switch (d) {
  case '0':
    return " _ \n| |\n|_|";
    break;
  case '1':
    return "   \n  |\n  |";
    break;
  case '2':
    return " _ \n _|\n|_ ";
    break;
  case '3':
    return " _ \n _|\n _|";
    break;
  case '4':
    return "   \n|_|\n  |";
    break;
  case '5':
    return " _ \n|_ \n _|";
    break;
  case '6':
    return " _ \n|_ \n|_|";
    break;
  case '7':
    return " _ \n  |\n  |";
    break;
  case '8':
    return " _ \n|_|\n|_|";
    break;
  case '9':
    return " _ \n|_|\n  |";
    break;
  }
}
