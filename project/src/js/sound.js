var settings = require('./settings');

function play(file, volume) {
  var a, soundsLoc;
  if (window.Media) {
    soundsLoc = (window.device.platform === 'Android') ?
    '/android_asset/www/sounds' : 'sounds';
    a = new window.Media(soundsLoc + '/' + file, function() {
      a.release();
    }, function(err) {
      console.log(err);
    });
    a.setVolume(volume);
    a.play();
  } else {
    a = new window.Audio('sounds/' + file);
    a.volume = volume;
    a.play();
  }
}

var audio = {
  move: [ 'move.mp3', 0.8 ],
  capture: [ 'capture.mp3', 0.8 ],
  dong: [ 'dong.mp3', 0.8 ],
};

function shouldPlay() {
  return settings.general.sound();
}

module.exports = {
  move: function() {
    if (shouldPlay()) {
      play.apply(null, audio.move);
    }
  },
  capture: function() {
    if (shouldPlay()) play.apply(null, audio.capture);
  },
  dong: function() {
    if (shouldPlay) play.apply(null, audio.dong);
  }
};
