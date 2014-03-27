/**
 * Created by jcaraballo17.
 */


AsteroidsGame.audio = (function(self) {
    "use strict";

    self.sounds = [];
    self.fxVolume = 100;
    self.musicVolume = 100;

    var LASER_VOLUME = 0.8;

    self.playLaserFx = function() {
        var laser = self.sounds['audio/pew.wav'];
        laser.volume = LASER_VOLUME * (self.fxVolume / 100);
        laser.currentTime = 0;
        laser.play();
    };

    return self;
}(AsteroidsGame.audio || {}));