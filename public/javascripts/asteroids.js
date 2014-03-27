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
        self.graphics.initializeInterface();
    };

    self.startNewSimulation = function() {
        startGameMode(gameModes.pc);
    };

    self.startNewGame = function() {
        startGameMode(gameModes.user);
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
		requestAnimationFrame(gameLoop);
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