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
        self.objects.loadAliens(10);
        self.objects.loadAsteroids(20);
        self.objects.ship.setPosition({ x: self.graphics.canvas.width/2, y: self.graphics.canvas.height/2 });
        //intialize load asteroids and aliens
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
        //TODO: implement shooting system
    };

    function gameLoop(timestamp) {
        if (!self.gameActive) {
            return;
        }

        var elapsedTime = lastTimeStamp - timestamp;
        lastTimeStamp = timestamp;
        update(elapsedTime);
        render();

		requestAnimationFrame(gameLoop, null);
	}

    function update(elapsedTime) {
        self.gameTime = startTimeStamp - lastTimeStamp;
        
        self.input.keyBindings.forEach(function(binding) {
            if (self.input.keyPresses.hasOwnProperty(binding.key)) {
                binding.handler(elapsedTime);
            }
        });
        
        self.objects.asteroids.forEach(function(asteroid){
            asteroid.rotateLeft(elapsedTime);
            asteroid.moveInInitialDirection(elapsedTime);
        });

        self.objects.aliens.forEach(function(alien){
           alien.moveInInitialDirection(elapsedTime);
        });
    }

    function render() {
        self.graphics.clear();
        self.graphics.drawBackground();
        self.objects.ship.render();
        self.objects.aliens.forEach(function(alien){
           alien.render();
        });
        self.objects.asteroids.forEach(function(asteroid){
            asteroid.render();
        });
    }

    return self;
}(AsteroidsGame || {}));