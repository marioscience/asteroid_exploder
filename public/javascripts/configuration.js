/**
 * Created by jcaraballo17.
 */

AsteroidsGame.configuration = (function(self) {
    "use strict";
    self.sound = {
        musicVolume: 100,
        fxVolume: 100
    };

    self.keyboard = {
        up: KeyEvent.DOM_VK_UP,
        left: KeyEvent.DOM_VK_LEFT,
        right: KeyEvent.DOM_VK_RIGHT,
        hyperspace: KeyEvent.DOM_VK_CONTROL,
        shield: KeyEvent.DOM_VK_Z,
        shoot: KeyEvent.DOM_VK_SPACE
    };

    self.loadConfigurations = function() {
        var keysConfig = localStorage.getObject('keys') || {};
        var audioConfig = localStorage.getObject('audio') || {};
        self.keyboard.up = keysConfig.up || self.keyboard.up;
        self.keyboard.left = keysConfig.left || self.keyboard.left;
        self.keyboard.right = keysConfig.right || self.keyboard.right;
        self.keyboard.shoot = keysConfig.shoot || self.keyboard.shoot;
        self.keyboard.shield = keysConfig.shield || self.keyboard.shield;
        self.keyboard.hyperspace = keysConfig.hyperspace || self.keyboard.hyperspace;
        self.sound.musicVolume = audioConfig.musicVolume || self.sound.musicVolume;
        self.sound.fxVolume = audioConfig.fxVolume || self.sound.fxVolume;
    };

    self.saveKeyConfig = function(config) {
        self.keyboard.up = config.up || self.keyboard.up;
        self.keyboard.left = config.left || self.keyboard.left;
        self.keyboard.right = config.right || self.keyboard.right;
        self.keyboard.hyperspace = config.hyperspace || self.keyboard.hyperspace;
        self.keyboard.shield = config.shield || self.keyboard.shield;
        self.keyboard.shoot = config.shoot || self.keyboard.shoot;
        localStorage.setObject('keys', self.keyboard);
    };

    self.saveAudioConfig = function(config) {
        self.sound.musicVolume = config.musicVolume || self.sound.musicVolume;
        self.sound.fxVolume = config.fxVolume || self.sound.fxVolume;
        localStorage.setObject('audio', self.sound);
    };

    return self;
}(AsteroidsGame.configuration || {}));
