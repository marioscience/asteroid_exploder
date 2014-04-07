/**
 * Created by jcaraballo17.
 */

var AsteroidsGame = (function(self) {
    "use strict";

    self.gameActive = false;
    self.gameModes = { player: {}, pc: {}};
    self.currentMode = {};
    self.gameTime = 0;

    self.highscores = [];
    self.score = 0;
    self.lives = 0;
    self.level = 0;


    var startTimeStamp = 0;
    var lastTimeStamp = 0;
    var livesGained = 1;

    self.initialize = function() {
        self.loadHighscores();
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
        self.objects.thrustParticles.length = 0;

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
        self.objects.toggleThrustRender = true;
        self.objects.thrust(self.objects.ship);
        self.objects.ship.moveForward(elapsedTime);
        self.audio.playThrustFx();
        console.log(self.objects.ship.acceleration);
    };

    self.rotateShipRight = function(elapsedTime) {
        self.objects.ship.rotateRight(elapsedTime);
    };

    self.rotateShipLeft = function(elapsedTime) {
        self.objects.ship.rotateLeft(elapsedTime);
    };

    self.enterHyperspace = function(elapsedTime) {
        self.objects.newShip(true);
    };

    self.shootLaser = function() {
        self.objects.loadLaserShot(lastTimeStamp, self.objects.ship, self.objects.ship.angle);
    };

    self.loadHighscores = function() {
        $.get('/v1/highscores')
            .done(function(data) {
                self.highscores = data;
                localStorage.setObject('highscores', self.highscores); })
            .fail(function() {
                self.highscores = localStorage.getObject('highscores') || []; })
            .always(function() {
                self.graphics.updateHighscores();
            }
        );
    };

    self.submitCurrentScore = function(name) {
        $.ajax({ url: '/v1/highscores?name=' + name + '&score=' + self.score, type: 'post' })
            .fail(function() {
                alert("Could not submit score. sorry...");
            })
            .always(function() {
                self.loadHighscores();
            }
        );
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

    function addLife()
    {
        var vaina = self.score/(10000 * livesGained );

        if(vaina > 1)
        {
            livesGained++;
            self.lives++;
        }
    }

    function update(elapsedTime) {
        if (!self.gameActive) {
            return;
        }

        addLife();

        self.gameTime = lastTimeStamp - startTimeStamp;

        // check game status
        if (self.lives === 0) {
            self.gameActive = false;
            document.getElementById('game-score').innerHTML = self.score;
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
        updateParticles(elapsedTime, self.objects.activeParticles);
        updateThrustParticles(elapsedTime, self.objects.thrustParticles);
        self.objects.updateParticlePos(self.objects.ship);
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
        self.objects.thrustParticles.forEach(function(particle) { particle.particle.render(); });
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
            self.objects.astAlienCollision();
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

    function updateThrustParticles(elapsedTime, particleArray)
    {
        particleArray.forEach(function(particle)
        {
            particle.particle.update(elapsedTime/1000);
            particle.particle.create();

        });
    }

    function updateParticles(elapsedTime, particleArray)
    {
        var count = 0;
        var deleteThese = [];
        particleArray.forEach(function(particle)
        {
            particle.particle.update(elapsedTime/1000);
            particle.particle.create();
            particle.timealive += elapsedTime;
            //console.log("elapsed: " + elapsedTime);

            if(particleArray == self.objects.activeParticles && particle.timealive > particle.lifetime)
            {
                deleteThese.push(count);
            }

            count++;
        });

        deleteThese.forEach(function(i)
        {
            particleArray.splice(i, 1);
        });
    }

    function advanceLevel() {
        self.objects.loadAsteroids(1/*self.objects.asteroidsCount + self.level*/, self.objects.asteroidTypes.big);
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