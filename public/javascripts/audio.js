/**
 * Created by jcaraballo17.
 */


AsteroidsGame.audio = (function(self) {
    "use strict";

    self.sounds = {};

    self.playLaserFx = function() {
        playFxSound(self.sounds['audio/pew.wav']);
    };

    self.playClickFx = function() {
        playFxSound(self.sounds['audio/click.wav']);
    };

    self.playThrustFx = function() {
        playFxSound(self.sounds['audio/thrust.wav']);
    };

    self.playRockExplosionFx = function() {
        playFxSound(self.sounds['audio/rock_explosion.wav']);
    };

    self.playShipExplosionFx = function() {
        playFxSound(self.sounds['audio/ship_explosion.wav']);
    };

    self.playMenuMusic = function() {
        var menuMusic = self.sounds['audio/background_menu.wav'];
        if (menuMusic.readyState !== menuMusic.HAVE_ENOUGH_DATA) {
            menuMusic.addEventListener('canplay', function(){
                self.playMenuMusic();
            });
            return;
        }
        pauseSound(self.sounds['audio/background_game.wav']);
        menuMusic.volume = AsteroidsGame.configuration.sound.musicVolume / 100;
        menuMusic.currentTime = 0;
        menuMusic.loop = true;
        menuMusic.play();
    };

    self.playGameMusic = function() {
        var gameMusic = self.sounds['audio/background_game.wav'];
        if (gameMusic.readyState !== gameMusic.HAVE_ENOUGH_DATA) {
            gameMusic.addEventListener('canplay', function(){
                self.playMenuMusic();
            });
            return;
        }
        pauseSound(self.sounds['audio/background_menu.wav']);
        gameMusic.volume = AsteroidsGame.configuration.sound.musicVolume / 100;
        gameMusic.currentTime = 0;
        gameMusic.loop = true;
        gameMusic.play();
    };

    self.bindScreenSounds = function(screens) {
        screens.menuItems.on('mouseover', function() {
            self.playClickFx();
        });

        screens.menuScreen.on('beforeShow', function() {
            if (self.sounds['audio/background_menu.wav'].currentTime > 0) {
                return;
            }
            self.playMenuMusic();
        });

        screens.gameScreen.on('beforeShow', function() {
            if (self.sounds['audio/background_game.wav'].currentTime > 0) {
                return;
            }
            self.playGameMusic();
        });
    };

    function playFxSound(sound) {
        sound.volume = AsteroidsGame.configuration.sound.fxVolume / 100;
        sound.currentTime = 0;
        sound.play();
    }

    function pauseSound(sound) {
        if (sound.readyState == sound.HAVE_ENOUGH_DATA && !sound.paused) {
            sound.pause();
        }
    }

    return self;
}(AsteroidsGame.audio || {}));