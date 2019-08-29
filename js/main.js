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


/*
GAMEPLAY
*/
let keycount = 0;
$('#screen').bind('input propertychange', function() {
  keycount++;
  (keycount % 10 === 0 && playSting());
  let valueCheck = this.value;
  valueCheck = valueCheck.replace(/\s/g, '').toLowerCase();
  console.log('valueCheck: ' + valueCheck);
  if(valueCheck === '<div></div>'){
    $( ".bottom-grid .row1-col1" ).addClass( "wallpaper" );
    playSting();
    $(this).val('');
  }
  if(valueCheck === '<style>.wall{background:#fade00;}</style>'){
    playSting();
    $(this).val('');
    typeWriter();
  }
});

var i = 0;
var txt = "((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n(('.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'))\n(('.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'))\n))'.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'((\n(('.'.'.'.'.;'   |    `:'.'.'.'.'.'))\n))'.'.'.'.';'    |     `:.'.'.'.'.'((\n(('.'.'.'.;'     |      `:'.'.'.'.'))\n))'.'.'.';'______|_______`:.'.'.'.'((\n((======@'       |        `@=======))\n))'.'.'.':       |         :'.'.'.'((\n))'.'.'.':       |         :'.'.'.'((\n))'.'.'.':     (@()@       :'.'.'.'((\n(('.'.'.'.    @()@()@      .'.'.'.'))\n))'.'.'.'.   ()@()@)()     .'.'.'.'((\n(('.'.'.'.    __\\|/__      .'.'.'.'))\n))'.'.'.'.   |-------|     .'.'.'.'((\n(('.'.'.'.    \\     /      .'.'.'.'))\n(('.'.'.'._____\\___/_______.'.'.'.'))\n))'.'.'.'==================='.'.'.'((\n))'.'.'.'==================='.'.'.'((\n(('.'.'.'                   '.'.'.'))\n   ~~~~                       ~~~~"; /* The text */
var speed = 30; /* The speed/duration of the effect in milliseconds */
function typeWriter() {

  if (i < txt.length) {
    document.getElementById("windowsill").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

$( ".about-link" ).click(function() {
  $('.info-window').hide();
  $(".info-window."+ $(this).text()).show();
});

$( ".close" ).click(function() {
  $('.info-window').hide();
});
