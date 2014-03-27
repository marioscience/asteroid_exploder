/**
 * Created by jcaraballo17.
 */


AsteroidsGame.audio = (function(self) {
    "use strict";

    self.sounds = [];

    var LASER_VOLUME_RATIO = 0.8;

    self.playLaserFx = function() {
        var laser = self.sounds['audio/pew.wav'];
        laser.volume = LASER_VOLUME_RATIO * (AsteroidsGame.configuration.fxVolume / 100);
        laser.currentTime = 0;
        laser.play();
    };

    return self;
}(AsteroidsGame.audio || {}));