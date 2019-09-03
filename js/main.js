const $ = jQuery;

/*
 * MUSIC
 */
let activeSource = null;
const buffers = {};
let context;
let offset = 0;
const tempo = 5.33375;
const tracks = document.getElementsByClassName('track');

/**
 * @param {string} url location of track
 */
function playTrack(url) {
  const buffer = buffers[url];
  const source = context.createBufferSource();

  source.buffer = buffer;
  source.connect(context.destination);
  source.loop = true;

  if (offset == 0) {
    source.start();
    offset = context.currentTime;
    activeSource = source;
  } else {
    const relativeTime = context.currentTime - offset;
    const beats = relativeTime / tempo;
    const remainder = beats - Math.floor(beats);
    const delay = tempo - (remainder * tempo);
    const when = context.currentTime + delay;
    stopActiveSource(when);
    source.start(context.currentTime + delay, relativeTime + delay);
    activeSource = source;
    source.onended = function() {
      activeSource = null;
    };
  }
}

/**
 * @param {string} url buffers the track
 */
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

/**
 * @param {number} when time to stop track
 */
function stopActiveSource(when) {
  if (activeSource) {
    activeSource.onended = null;
    activeSource.stop(when);
  }
}

let stopTime = 0;
let startTime = 0;
const stings = [0, 2, 4, 6, 8, 10];
const stingAudio = document.getElementById('stingAudio');
const rndmArrI = (a) => a[Math.floor(Math.random() * a.length)];

/** contextual stab sounds of strings  */
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

/*
 * Cookies
 */

const name = document.getElementById('name');

if (sessionStorage.getItem('name')) {
  name.value = sessionStorage.getItem('name');
} else {
  name.value = 'Terry';
  sessionStorage.setItem('name', name.value);
}
sessionStorage.setItem('name', name.value);
name.addEventListener('change', function() {
  sessionStorage.setItem('name', name.value);
});

$('#start').click(function(e) {
  $('.session').text(sessionStorage.getItem('name'));
  $('.mask').hide();
  context.resume().then(() => {
    $(tracks)[0].click();
  });
});


/*
 * ANIMATIONS
 */

/**
 * sets target location for bug animation
 * @return {numbers} bug x and y position
 */
function makeNewPosition() {
  const h = $('.bug').parent().height() - 50;
  const w = $('.bug').parent().width() - 50;
  const ny = Math.floor(Math.random() * h);
  const nx = Math.floor(Math.random() * w);
  return [ny, nx];
}

/** jQuery animates bug and updates bug css  */
function animateDiv() {
  const newq = makeNewPosition();
  const oldq = $('.bug').offset();
  const speed = calcSpeed([oldq.top, oldq.left], newq);

  $('.bug').delay(speed).animate({
    top: newq[0],
    left: newq[1],
  }, speed, function() {
    const a = Math.random() * (180 - -180) + 180;
    $('.bug').css('transform', 'rotate(' + a + 'deg) scale(1.25)');
    animateDiv();
  });
}

/**
 * @param {numbers} prev bug top & left position
 * @param {numbers} next calculated new top & left position
 * @return {number} speed for jquery animation
 */
function calcSpeed(prev, next) {
  const x = Math.abs(prev[1] - next[1]);
  const y = Math.abs(prev[0] - next[0]);
  const greatest = x > y ? x : y;
  const speedModifier = 0.05;
  const speed = Math.ceil(greatest / speedModifier);
  return speed;
}

/** game over animation  */
function endAnimation() {
  $('.top__anchor').hide();
  $('body').addClass('ending');
  $('.ascii-container').animate({
    opacity: '0',
  }, 5000);
  $('.fin').delay(2000).fadeIn(6000);
}

let i = 0;
const txt = "((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n((IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII))\n(('.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'))\n))'.'.'.'.'.;:;:;:;:;:;.'.'.'.'.'.'((\n(('.'.'.'.'.;'   |    `:'.'.'.'.'.'))\n))'.'.'.'.';'    |     `:.'.'.'.'.'((\n(('.'.'.'.;'     |      `:'.'.'.'.'))\n))'.'.'.';'______|_______`:.'.'.'.'((\n((======0'       |        `0=======))\n))'.'.'.':       |         :'.'.'.'((\n))'.'.'.':     (a()@       :'.'.'.'((\n(('.'.'.'.    @()@()a      .'.'.'.'))\n))'.'.'.'.   ()a()@)()     .'.'.'.'((\n(('.'.'.'.    __\\|/__      .'.'.'.'))\n))'.'.'.'.   |-------|     .'.'.'.'((\n(('.'.'.'.    \\     /      .'.'.'.'))\n(('.'.'.'._____\\___/_______.'.'.'.'))\n))'.'.'.'==================='.'.'.'((\n))'.'.'.'==================='.'.'.'((\n(('.'.'.'                   '.'.'.'))\n   ~~~~                       ~~~~"; /* The text */
const speed = 20;

/** The speed/duration of the effect in milliseconds */
function typeWriter() {
  if (i < txt.length) {
    document.getElementById('windowsill').innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  } else {
    $('#windowsill:contains("a")').html(function(_, html) {
      return html.replace(/(a)/g, '<a class="game-link alert-link bold" href="#0">a</a>');
    });
    clickStart();
  }
}

/**
 * @param {number} p points for completing level
 */
function points(p) {
  let curr = parseInt(document.getElementById('score').innerHTML);
  const goal = curr + p;
  const i = setInterval(function() {
    curr += 2;
    document.getElementById('score').innerHTML = curr.toString();
    if (curr >= goal) {
      clearInterval(i);
    }
  }, 5);
}

/*
GAMEPLAY
*/

/** default behavior for level completion  */
function checkpointDefaults() {
  $('.info-window').hide();
  $('.toggle').hide();
  playSting();
  $('#screen').val('');
}

/** gets time for ascii clock */
function getTime() {
  const currentdate = new Date();
  let hours = currentdate.getHours();
  let minutes = currentdate.getMinutes();
  hours = ('0' + hours).slice(-2);
  minutes = ('0' + minutes).slice(-2);
  document.getElementById('hour-1').innerHTML = getDigit(hours.charAt(0));
  document.getElementById('hour-2').innerHTML = getDigit(hours.charAt(1));
  document.getElementById('min-1').innerHTML = getDigit(minutes.charAt(0));
  document.getElementById('min-2').innerHTML = getDigit(minutes.charAt(1));
}

/** erratic clock behavior */
function brokenClock() {
  document.getElementById('hour-' + (Math.ceil(Math.random() * 2)).toString()).innerHTML = getDigit((Math.ceil(Math.random() * 9)).toString());
  document.getElementById('min-' + (Math.ceil(Math.random() * 2)).toString()).innerHTML = getDigit((Math.ceil(Math.random() * 9)).toString());
}

getTime();
/**
 * @param {string} d single digit number
 * @return {string} ascii digit
 */
function getDigit(d) {
  switch (d) {
    case '0':
      return ' _ \n| |\n|_|';
    case '1':
      return '   \n  |\n  |';
    case '2':
      return ' _ \n _|\n|_ ';
    case '3':
      return ' _ \n _|\n _|';
    case '4':
      return '   \n|_|\n  |';
    case '5':
      return ' _ \n|_ \n _|';
    case '6':
      return ' _ \n|_ \n|_|';
    case '7':
      return ' _ \n  |\n  |';
    case '8':
      return ' _ \n|_|\n|_|';
    case '9':
      return ' _ \n|_|\n  |';
  }
}

/*
Level Checkpoints
*/
let clockAnimate;
let keycount = 0;
$('#screen').bind('input propertychange', function() {
  keycount++;
  (keycount % 10 === 0 && playSting());
  let valueCheck = this.value;
  valueCheck = valueCheck.replace(/\s/g, '').toLowerCase();

  /*
  if (valueCheck === '<div></div>') {
    $('.bottom-grid .row1-col1').addClass('wallpaper');
    playSting();
    $(this).val('');
  }
  */
  if (valueCheck === '<div>helloworld!</div>') {
    checkpointDefaults();
    $(tracks)[2].click();
    points(5000);
    typeWriter();
    $('.tip > .content > p').html('An example of using a style tag would be: <br />&lt;style&gt;<br />&nbsp;.text {<br />&nbsp;&nbsp;color=#FFDD44;<br />&nbsp;};<br />&lt;/style&gt;');
  }
  if (valueCheck === 'helloworld!') {
    checkpointDefaults();
    points(2500);
    $('.bug').css('display', 'inline-flex');
    animateDiv();
    $('.alerts').show();
    $(tracks)[1].click();
    $('.tip > .content > p').html('An example of using a div tag would be: <br />&lt;div&gt;<br />&nbsp;&nbsp;example text<br />&lt;/div&gt;');
  }
  if (valueCheck === '<style>.wall{background:#fade00;}</style>') {
    checkpointDefaults();
    points(3330);
    $('#windowsill').hide();
    $('.window-link').addClass('alert-link');
    $('.new-views').show();
    $(tracks)[3].click();
    $('.tip > .content > p').html("There's no place like >Home<");
    $('.alert-urgent').show();
  }
  if (valueCheck === '<li><ahref="index.html">home</a></li>') {
    checkpointDefaults();
    points(6666);
    $('.view-link.v01').trigger('click');
    $('.window-link').removeClass('alert-link');
    $('.view-link.v07').parent().hide();
    $('.bug').addClass('task');
    clickStart();
    $(tracks)[4].click();
    $('.tip > .content > p').html('We had to fire the last person who submitted a bug report on behalf of someone else.');
    $('.alert-bug').show();
  }
  if (valueCheck.indexOf("bugname:") != -1 && valueCheck.indexOf("severity:") != -1 && valueCheck.indexOf("reportedby:") != -1 && valueCheck.indexOf("environment:") != -1 && valueCheck.indexOf("--commit") != -1 && valueCheck.indexOf(sessionStorage.getItem('name').toLowerCase()) != -1) {
    checkpointDefaults();
    points(3926);
    clockAnimate = setInterval(brokenClock, 500);
    $('.bug').hide();
    $('.colon').addClass('task2');
    clickStart();
    $(tracks)[5].click();
    $('.tip > .content > p').html("Don't forget, make the end of it 'Select, Start' if you want to play 2 players!<br /><a class='red' href='https://www.urbandictionary.com/define.php?term=Up%2C%20Up%2C%20Down%2C%20Down%2C%20Left%2C%20Right%2C%20Left%2C%20Right%2C%20B%2C%20A%2C%20Start' target='_blank'>Konami Code</a>");
  }
  if (valueCheck === 'baselectstart' && konamiFlag) {
    checkpointDefaults();
    points(8998);
    clearInterval(clockAnimate);
    $('.colon').removeClass('task2');
    getTime();
    $(tracks)[6].click();
    endAnimation();
  }
});

/** click handlers for added elements */
function clickStart() {
  $('.game-link').click(function() {
    $('.info-window').hide();
    $('.info-window.' + $(this).text()).show();
  });
  $('.task').click(function() {
    $('.info-window').hide();
    $('.bugreport').show();
  });
  $('.task2').click(function() {
    $('.info-window').hide();
    $('.o').show();
  });
}

$('.view-link').click(function() {
  $('.bottom-grid').removeClass(function(index, className) {
    return (className.match(/\bv0\S+/g) || []).join(' ');
  });
  $('.bottom-grid').addClass($(this).attr('data-view'));
  $('.check').html('&#10063;');
  $('.check', this).html('&#10003;');
});

$('.close').click(function() {
  $('.info-window').hide();
});

clickStart();

// a key map of allowed key strokes
const allowedKeys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};
let konamiFlag = false;
const konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];
let konamiCodePosition = 0;
document.addEventListener('keydown', function(e) {
  const key = allowedKeys[e.keyCode];
  const requiredKey = konamiCode[konamiCodePosition];
  if (key == requiredKey) {
    konamiCodePosition++;
    if (konamiCodePosition == konamiCode.length) {
      konamiFlag = true;
      konamiCodePosition = 0;
    }
  } else {
    konamiCodePosition = 0;
  }
});

/*
 * on load
 */

window.onload = function() {
  setInterval(getTime, 60000);
  context = new(window.AudioContext || window.webkitAudioContext)();
  for (let i = 0, len = tracks.length; i < len; i++) {
    tracks[i].addEventListener('click', function(e) {
      playTrack(this.href);
      e.preventDefault();
    });
    getBuffer(tracks[i].href);
  }
};
