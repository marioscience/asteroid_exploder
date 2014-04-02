/**
 * Created by jcaraballo17.
 */

var AsteroidsGame = (function(self) {
    "use strict";

    self.gameActive = false;
    self.gameModes = { player: {}, pc: {}};
    self.currentMode = {};

    self.gameTime = 0;
    self.score = 0;
    self.lives = 0;
    self.level = 0;

    var startTimeStamp = 0;
    var lastTimeStamp = 0;

    self.initialize = function() {
        self.configuration.loadConfigurations();
        self.audio.bindScreenSounds({ menuScreen: self.graphics.screens.menu,
            gameScreen: self.graphics.screens.game,
            menuItems: $('.menu-item')
        });
        self.graphics.initializeInterface();
        self.input.updateKeyBindings();
    };

    self.startAttractGame = function() {
        //TODO: develop ai for attract mode
        self.currentMode = self.gameModes.pc;
    };

    self.startNewGame = function() {
        self.score = 0;
        self.lives = 3;
        self.level = 0;
        self.objects.aliens.length = 0;
        self.objects.asteroids.length = 0;
        self.objects.laserShots.length = 0;
        self.objects.activeParticles.length = 0;

        self.gameActive = true;
        self.currentMode = self.gameModes.player;
        self.objects.nextAlienTimestamp = getNextAlienTime();
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
        self.audio.playThrustFx();
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

    self.shootLaser = function() {
        self.objects.loadLaserShot(lastTimeStamp, self.objects.ship, self.objects.ship.angle);
    };

    function gameLoop(timestamp) {
        if (!self.gameActive) {
            return;
        }

        var elapsedTime = Math.abs(timestamp - lastTimeStamp);
        lastTimeStamp = timestamp;
        update(elapsedTime);
        render();

		requestAnimationFrame(gameLoop);
	}

    function update(elapsedTime) {
        if (!self.gameActive) {
            return;
        }

        self.gameTime = lastTimeStamp - startTimeStamp;

        // check game status
        if (self.lives === 0) {
            self.gameActive = false;
            self.graphics.showSubmitScoreScreen();
            return;
        }

        if (self.objects.asteroids.length === 0) {
            advanceLevel();
        }


        // handle pressed keys
        self.input.keyBindings.forEach(function(binding) {
            if (self.input.keyPresses.hasOwnProperty(binding.key)) {
                binding.handler(elapsedTime);
            }
        });

        updateShip(elapsedTime);
        updateAsteroids(elapsedTime);
        updateAliens(elapsedTime);
        updateLaserShots(elapsedTime);
        updateParticles(elapsedTime);
    }

    function render() {
        if (!self.gameActive) {
            return;
        }

        self.graphics.clear();
        self.graphics.drawBackground();
        self.objects.asteroids.forEach(function(asteroid) { asteroid.render(); });
        self.objects.laserShots.forEach(function(shot) { shot.render(); });
        self.objects.aliens.forEach(function(alien) { alien.render(); });
        self.objects.activeParticles.forEach(function(particle) { particle.particle.render(); });
        self.objects.ship.render();
        if (self.currentMode === self.gameModes.player) {
            self.graphics.drawScore();
            self.graphics.drawLevel();
            self.graphics.drawLives();
        }
    }

    function updateShip() {
        self.objects.ship.update();
    }

    function updateAliens(elapsedTime) {
        // load alien if it's time to load one.
        if (lastTimeStamp >= self.objects.nextAlienTimestamp) {
            self.objects.loadAlien(lastTimeStamp);
            self.objects.nextAlienTimestamp = getNextAlienTime();
        }

         self.objects.alienShipCollision();
        // update aliens.
        var expiredAliens = [];
        var alienDestinationOffset = 10;
        self.objects.aliens.forEach(function(alien) {
            var ship = self.objects.ship;

            var xComponent = Math.abs(ship.position.x - alien.position.x) * Math.sign(Math.sin(alien.initialAngle));
            var yComponent = alien.position.y - ship.position.y;
            var angle = Math.atan2(xComponent, yComponent) * 180 / Math.PI;

            alien.angle = angle;
            alien.moveInAngle(angle, elapsedTime); //move forward attracted to player.
            alien.update();
            if (Math.abs(alien.position.x - alien.destination) < alienDestinationOffset) {
                expiredAliens.push(alien);
            }

            // get some shooting done.
            var shotAngle = getAlienShotAngle(alien);
            self.objects.loadLaserShot(lastTimeStamp, alien, shotAngle);
        });
        expiredAliens.forEach(function(alien) {
            self.objects.aliens.splice(self.objects.aliens.indexOf(alien), 1);
        });
    }

    function updateAsteroids(elapsedTime) {
        self.objects.asteroids.forEach(function(asteroid) {
            asteroid.moveInInitialDirection(elapsedTime);
            asteroid.rotateLeft(elapsedTime);
            self.objects.astShipCollision();
            asteroid.update();
        });
    }

    function updateLaserShots(elapsedTime) {
        var expiredShots = [];
        self.objects.laserShots.forEach(function(shot) {
            if (lastTimeStamp - shot.timestamp >= shot.lifespan) {
                expiredShots.push(shot);
            }
            shot.moveInInitialDirection(elapsedTime);
            shot.update();
        });

        self.objects.shotCollision();

        expiredShots.forEach(function(shot) {
            self.objects.laserShots.splice(self.objects.laserShots.indexOf(shot), 1);
        });
    }

    function updateParticles(elapsedTime)
    {
        var count = 0;
        var deleteThese = [];
        self.objects.activeParticles.forEach(function(particle)
        {
            particle.particle.update(elapsedTime/1000);
            particle.particle.create();
            particle.timealive += elapsedTime;
            //console.log("elapsed: " + elapsedTime);

            if(particle.timealive > particle.lifetime)
            {
                deleteThese.push(count);
            }

            count++;
        });

        deleteThese.forEach(function(i)
        {
            self.objects.activeParticles.splice(i, 1);
        });
    }

    function advanceLevel() {
        self.objects.loadAsteroids(self.objects.asteroidsCount + self.level, self.objects.asteroidTypes.big);
        self.level++;
    }

    function getNextAlienTime() {
        var offset = 5000;
        var min = self.objects.alienInterval - offset;
        var max = self.objects.alienInterval + (offset / 3);
        return lastTimeStamp + Random.nextRange(min, max);
    }

    function getAlienShotAngle(alien) {
        var angle = 0;
        if (alien.type == self.objects.alienTypes.big) {
            angle = Random.nextRange(0, 360);
        } else {
            var xComponent = self.objects.ship.position.x - alien.position.x;
            var yComponent = alien.position.y - self.objects.ship.position.y;
            angle = Math.atan2(xComponent, yComponent) * 180 / Math.PI;
        }
        return angle;
    }


    return self;
}(AsteroidsGame || {}));