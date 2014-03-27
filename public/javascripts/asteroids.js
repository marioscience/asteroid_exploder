/**
 * Created by jcaraballo17.
 */

var AsteroidsGame = (function(self) {
    "use strict";

    self.gameActive = false;
    self.gameTime = 0;
    self.score = 0;

    var gameModes = { user: {}, pc: {} };
    var startTimeStamp = 0;
    var lastTimeStamp = 0;
    var currentMode;

    self.initialize = function() {
        self.configuration.loadConfigurations();
        self.graphics.initializeInterface();
        self.input.updateKeyBindings();
    };

    self.startNewSimulation = function() {
        startGameMode(gameModes.pc);
    };

    self.startNewGame = function() {
        startGameMode(gameModes.user);
    };

    self.changeKeyConfig = function(config) {
        self.configuration.saveKeyConfig(config);
        self.input.updateKeyBindings();
    };

    self.changeAudioConfig = function(config) {
        self.configuration.saveAudioConfig(config);
    };

    function startGameMode(mode) {
        currentMode = mode;
        self.gameActive = true;
        startTimeStamp = lastTimeStamp = performance.now();
		requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        if (!self.gameActive) {
            return;
        }
        var elapsedTime = lastTimeStamp - timestamp;
        lastTimeStamp = timestamp;

        update(elapsedTime);
        render(elapsedTime);
		requestAnimationFrame(gameLoop, null);
	}

    function update(elapsedTime) {
        self.gameTime = lastTimeStamp - startTimeStamp;
        //if it's a simulation, move ship by itself.
        //if not... then yeah.
    }

    function render(elapsedTime) {
        self.graphics.clear();
        self.graphics.drawBackground();
    }

    return self;
}(AsteroidsGame || {}));