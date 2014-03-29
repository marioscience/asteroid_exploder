/**
 * Created by jcaraballo17.
 */

var AsteroidsGame = (function(self) {
    "use strict";

    self.gameActive = false;
    self.gameTime = 0;
    self.score = 0;
    self.level = 0;

    var startTimeStamp = 0;
    var lastTimeStamp = 0;

    self.initialize = function() {
        self.configuration.loadConfigurations();
        self.graphics.initializeInterface();
        self.input.updateKeyBindings();
    };

    self.startAttractMode = function() {
        //TODO: develop ai for attract mode
    };

    self.startNewGame = function() {
        self.score = 0;
        self.gameActive = true;
        self.objects.loadShip();
        advanceLevel();

        startTimeStamp = lastTimeStamp = performance.now();
		requestAnimationFrame(gameLoop);
    };

    self.changeKeyConfig = function(config) {
        self.configuration.saveKeyConfig(config);
        self.input.updateKeyBindings();
    };

    self.changeAudioConfig = function(config) {
        self.configuration.saveAudioConfig(config);
    };

    self.moveShip = function(elapsedTime) {
        self.objects.ship.moveForward(elapsedTime);
    };

    self.rotateShipRight = function(elapsedTime) {
        self.objects.ship.rotateRight(elapsedTime);
    };

    self.rotateShipLeft = function(elapsedTime) {
        self.objects.ship.rotateLeft(elapsedTime);
    };

    self.enterHyperspace = function(elapsedTime) {
        //TODO: implement hyperspace
    };

    self.shootLaser = function(elapsedTime) {
        self.objects.loadLaserShot(lastTimeStamp);
    };

    function gameLoop(timestamp) {
        if (!self.gameActive) {
            return;
        }

        var elapsedTime = timestamp - lastTimeStamp;
        lastTimeStamp = timestamp;
        update(elapsedTime);
        render();

		requestAnimationFrame(gameLoop);
	}

    function update(elapsedTime) {
        self.gameTime = lastTimeStamp - startTimeStamp;

        // handle pressed keys
        self.input.keyBindings.forEach(function(binding) {
            if (self.input.keyPresses.hasOwnProperty(binding.key)) {
                binding.handler(elapsedTime);
            }
        });

        // update objects
        self.objects.ship.update();

        self.objects.asteroids.forEach(function(asteroid) {
            asteroid.moveInInitialDirection(elapsedTime);
            asteroid.rotateLeft(elapsedTime);
            asteroid.update();
        });

        self.objects.aliens.forEach(function(alien){
           alien.moveInInitialDirection(elapsedTime);
        });

        var expiredShots = [];
        self.objects.laserShots.forEach(function(shot) {
            if (lastTimeStamp - shot.timestamp >= shot.lifespan) {
                expiredShots.push(shot);
            }
            shot.moveInInitialDirection(elapsedTime);
            shot.update();
        });
        expiredShots.forEach(function(shot) {
            self.objects.laserShots.splice(self.objects.laserShots.indexOf(shot), 1);
        });

        // check game status
        if (self.objects.asteroids.length === 0) {
            self.objects.loadAsteroids(self.objects.asteroidsCount + self.level);
            self.level++;
        }
    }

    function render() {
        self.graphics.clear();
        self.graphics.drawBackground();
        self.objects.asteroids.forEach(function(asteroid){
            asteroid.render();
        });
        self.objects.aliens.forEach(function(alien){
           alien.render();
        });
        self.objects.laserShots.forEach(function(shot){
            shot.render();
        });
        self.objects.ship.render();
    }

    function advanceLevel() {
        self.objects.loadAsteroids(self.objects.asteroidsCount + self.level, self.objects.asteroidTypes.big);
        self.level++;
    }

    return self;
}(AsteroidsGame || {}));