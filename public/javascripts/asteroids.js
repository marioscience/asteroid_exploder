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
    self.shieldTime = 0;
    self.shields = 5;
    self.shieldSizeOffset = 0;
    self.shieldColor = "#00FF00";
    self.shieldHits = 0;

    self.hyperspaceCooldown = {
        required: 100,
        current: 100,
        rate: 0.4
    };

    var startTimeStamp = 0;
    var lastTimeStamp = 0;
    var lastIdleTimeStamp = 0;
    var livesGained = 1;

    self.initialize = function() {
        self.loadHighscores();
        self.configuration.loadConfigurations();

        self.audio.bindScreenSounds({ menuScreen: self.graphics.screens.menu,
            gameScreen: self.graphics.screens.game,
            menuItems: $('.menu-item')
        });

        self.graphics.screens.menu.on('beforeShow', function() {
            waitForIdleTime();
        });

        window.addEventListener('keypress', inputOnAttract, false);
        window.addEventListener('mousemove', inputOnAttract, false);
        window.addEventListener('click', inputOnAttract, false);

        self.graphics.initializeInterface();
        self.input.updateKeyBindings();
    };

    function updateShield(elapsedTime)
    {
        if(self.shieldTime > 0 )
        {
            self.shieldTime -= elapsedTime;
        }

        if(self.shieldTime < 1000 )
        {
            self.shieldColor = "#FF0000";
            self.shieldSizeOffset = 6;
        }else if(self.shieldTime < 3000)
        {
            self.shieldColor = "#FFEE00";
            self.shieldSizeOffset = 3;
        }else
        {
            self.shieldColor = "#00FF00";
            self.shieldSizeOffset = 0;
        }

        if(self.shieldHits >= 2)
        {
            self.shieldTime = 0;
            self.shieldHits = 0;
        }

    }

    function waitForIdleTime() {
        lastIdleTimeStamp = performance.now();
        requestAnimationFrame(idleLoop);
    }

    function idleLoop(timestamp) {
        var idleTime = Math.abs(timestamp - lastIdleTimeStamp);
        if (idleTime >= 10000) {
            self.startAttractGame();
            lastIdleTimeStamp = timestamp;
            return;
        }

		requestAnimationFrame(idleLoop);
    }

    var oldMousePosition = { x: 0, y: 0 };
    self.startAttractGame = function() {
        if (self.gameActive) {
            return;
        }
        self.level = 0;
        self.lives = 1;
        self.gameActive = true;
        oldMousePosition = { x: 0, y: 0 };

        self.objects.aliens.length = 0;
        self.objects.asteroids.length = 0;
        self.objects.laserShots.length = 0;
        self.objects.activeParticles.length = 0;
        self.objects.nextAlienTimestamp = getNextAlienTime();
        self.currentMode = self.gameModes.pc;
        self.graphics.goToGameScreen();
        self.objects.loadShip();
        advanceLevel();

        startTimeStamp = lastTimeStamp = performance.now();
		requestAnimationFrame(gameLoop);
    };


    function inputOnAttract(event) {
        if (!self.gameActive) {
            lastIdleTimeStamp = performance.now();
            return;
        }
        if (self.currentMode !== self.gameModes.pc) {
            return;
        }
        if (oldMousePosition.x === 0 && oldMousePosition.y === 0) {
            oldMousePosition = { x: event.x, y: event.y };
            return;
        }

        self.lives = 0;
        lastIdleTimeStamp = performance.now();
    }

    self.startNewGame = function() {
        self.score = 0;
        self.lives = 3;
        self.level = 0;

        self.shieldTime = 0;
        self.shields = 5;
        self.shieldSizeOffset = 0;
        self.shieldColor = "#00FF00";

        self.objects.aliens.length = 0;
        self.objects.asteroids.length = 0;
        self.objects.laserShots.length = 0;
        self.objects.activeParticles.length = 0;
        self.objects.thrustParticles.length = 0;
        self.hyperspaceCooldown.current = 100;

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
        if (self.hyperspaceCooldown.current < self.hyperspaceCooldown.required) {
            return;
        }
        self.objects.newShip(true);
        self.objects.hyperspaceParticles();
        self.hyperspaceCooldown.current = 0;
    };

    self.shootLaser = function() {
        self.objects.loadLaserShot(lastTimeStamp, self.objects.ship, self.objects.ship.angle);
    };

    self.activateShield = function(wasKilled) {
        if (self.shieldTime <= 0) {
            self.shieldHits = 0;
            if (typeof(wasKilled) !== undefined) {
                if (self.shields > 0) {
                    self.shields -= 1;
                } else {
                    return;
                }
            }
            self.shieldTime = 6000; //6 seconds
        }

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
        var vaina = self.score/(1000 * livesGained );

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

        self.gameTime = lastTimeStamp - startTimeStamp;

        // check game status
        if (self.lives === 0) {
            self.gameActive = false;
            self.graphics.cleanScreen();

            if (self.currentMode === self.gameModes.player) {
                if (self.score > self.highscores.slice(-1).pop().score || self.highscores.length < 5) {
                    self.graphics.showSubmitScoreScreen();
                    return;
                }
            }

            self.graphics.returnToMenuScreen();
            return;
        }

        if (self.objects.asteroids.length === 0) {
            advanceLevel();
        }


        // handle pressed keys
        if (self.currentMode === self.gameModes.player) {
            addLife();
            self.input.keyBindings.forEach(function(binding) {
                if (self.input.keyPresses.hasOwnProperty(binding.key)) {
                    binding.handler(elapsedTime);
                }
            });
        } else if (self.currentMode === self.gameModes.pc) {
            moveShipWithAI(elapsedTime);
        }


        // update hyperspace cool down.
        if (self.hyperspaceCooldown.current < self.hyperspaceCooldown.required) {
            self.hyperspaceCooldown.current += self.hyperspaceCooldown.rate;
        }

        updateShip(elapsedTime);
        updateShield(elapsedTime);
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

        self.objects.activeParticles.forEach(function(particle) { particle.particle.render(); });
        self.objects.asteroids.forEach(function(asteroid) { asteroid.render(); });
        self.objects.laserShots.forEach(function(shot) { shot.render(); });
        self.objects.aliens.forEach(function(alien) { alien.render(); });
        self.objects.activeParticles.forEach(function(particle) { particle.particle.render(); });
        self.objects.thrustParticles.forEach(function(particle) { particle.particle.render(); });
        self.objects.ship.render();
        self.renderShield();
        if (self.currentMode === self.gameModes.player) {
            self.graphics.drawScore();
            self.graphics.drawLevel();
            self.graphics.drawLives();
            self.graphics.drawShields();
            self.graphics.drawHyperspaceCooldown(self.hyperspaceCooldown);
        } else if (self.currentMode === self.gameModes.pc) {
            self.graphics.drawAttractModeText();
        }
    }

    self.renderShield = function()
    {
        if(self.shieldTime > 0)
        {
            var xCenter = self.objects.ship.position.x;
            var yCenter = self.objects.ship.position.y;
            var radious = (self.objects.ship.size.width + self.objects.ship.size.height)/2;

            self.graphics.context.strokeStyle = self.shieldColor;
            self.graphics.context.beginPath();
            self.graphics.context.arc(xCenter, yCenter, radious - self.shieldSizeOffset, 0, 2*Math.PI);
            self.graphics.context.arc(xCenter, yCenter, radious - self.shieldSizeOffset-3, 0, 2*Math.PI);
            self.graphics.context.arc(xCenter, yCenter, radious - self.shieldSizeOffset-4, 0, 2*Math.PI);
            self.graphics.context.stroke();
        }
    }

    function moveShipWithAI(elapsedTime) {
        var closestEnemy = getClosestEnemy(300, true);
        if (!closestEnemy) {
            closestEnemy = getClosestEnemy(300, false);
            if (getDistance(self.objects.ship, closestEnemy) > 300) {
                self.moveShip(elapsedTime);
            }
        }

        var angleToEnemy = getAngleToEnemy(closestEnemy);
        if (Math.abs((self.objects.ship.angle - angleToEnemy)) < 5) {
            self.shootLaser();
        } else {
            self.objects.ship.rotate(elapsedTime, angleToEnemy);
        }
    }

    function getAngleToEnemy(enemy) {
        var position = self.objects.ship.position;
        var distance = getDistance(self.objects.ship, enemy);
        var xComponent = (enemy.position.x - position.x) + (enemy.speed.x * (distance / 6));
        var yComponent = (position.y - enemy.position.y) + (enemy.speed.y * (distance / 6));

        var angle = Math.atan2(xComponent, yComponent) * 180 / Math.PI;
        return ((angle < 0) ? 360 - Math.abs(angle) : angle) % 360;
    }

    function getClosestEnemy(range, inRange) {
        var position = self.objects.ship.position;
        var minimumDistance = Number.MAX_VALUE;
        var closestEnemy = null;

        self.objects.asteroids.forEach(function(asteroid){
            var distance = getDistance(self.objects.ship, asteroid);

            if (distance <= minimumDistance) {
                if (!inRange || inRange && distance <= range) {
                    minimumDistance = distance;
                    closestEnemy = asteroid;
                }
            }
        });

        self.objects.aliens.forEach(function(alien){
            var distance = Math.sqrt(Math.pow(position.x - alien.position.x, 2) +
                Math.pow(position.y - alien.position.y, 2));

            if (distance <= minimumDistance) {
                if (!inRange || inRange && distance <= range) {
                    minimumDistance = distance;
                    closestEnemy = alien;
                }
            }
        });

        return closestEnemy;
    }

    function getDistance(object1, object2) {
        return Math.sqrt(Math.pow(object1.position.x - object2.position.x, 2) +
                Math.pow(object1.position.y - object2.position.y, 2));
    }

    function addLife() {
        var vaina = self.score/(10000 * livesGained );

        if(vaina > 1) {
            livesGained++;
            self.lives++;
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
        return Random.nextRange(angle - 20, angle + 20);
    }

    return self;
}(AsteroidsGame || {}));