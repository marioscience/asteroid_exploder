/**
 * Created by jcaraballo17.
 */

AsteroidsGame.objects = (function(self) {
    "use strict";

    self.ship = {};
    self.aliens = [];
    self.asteroids = [];
    self.laserShots = [];
    self.asteroidsCount = 5;

    self.alienInterval = 20000;
    self.nextAlienTimestamp = 0;
    self.lastAlienTimestamp = 0;

    var laserSpeedLimit = 3;
    var graphics = AsteroidsGame.graphics;
    var shipImage = graphics.images['images/assassin_ship.png'];
    var asteroidImage = graphics.images['images/asteroid_big1.png'];
    var alienImage = graphics.images['images/alien.png'];
    var laserImage = graphics.images['images/laser_shot.png'];

    self.alienTypes = {
        big: { size: 25 },
        small: { size: 15 }
    };

    self.asteroidTypes = {
        big: { size: 40 },
        medium: { size: 25 },
        small: { size: 5 }
    };

    self.loadShip = function() {
        var width = 20;
        var height = width * shipImage.height / shipImage.width;
        var initialX = graphics.canvas.width / 2;
        var initialY = graphics.canvas.height / 2;

        self.ship = Texture({
            image: shipImage,
            position: { x: initialX, y: initialY },
            size: { width: width, height: height },
            speed: { x: 0, y: 0 },
            angularSpeed: 300,
            maxSpeed: 3,
            angle: 60,
            acceleration: 2,
            frictionFactor: .997,
            lastShotTimestamp: 0,
            laserThrottle: 200
        });
    };

    self.loadLaserShot = function(timestamp, shooter, angle) {
        if (timestamp - shooter.lastShotTimestamp < shooter.laserThrottle) {
            return;
        }

        var xComponent = Math.sin(angle * Math.PI / 180);
        var yComponent = Math.cos(angle * Math.PI / 180);

        var width = 2;
        var height = width * laserImage.height / laserImage.width + 5;

        self.laserShots.push(Texture({
            image: laserImage,
            position: { x: shooter.position.x, y: shooter.position.y },
            size: { width: width, height: height },
            speed: { x: 2 * xComponent * laserSpeedLimit, y: 2 * yComponent * laserSpeedLimit },
            angularSpeed: 0,
            maxSpeed: laserSpeedLimit,
            angle: angle,
            timestamp: timestamp,
            lifespan: 1000,
            acceleration: 5,
            shooter: shooter,
            frictionFactor: 1
        }));

        shooter.lastShotTimestamp = timestamp;
    };

    self.loadAlien = function(timestamp) {
        var alienType = [self.alienTypes.big, self.alienTypes.small, self.alienTypes.big]
            .splice(Random.nextRange(0, 3), 1)
            .pop();

        var width = alienType.size;
        var height = width * asteroidImage.height / asteroidImage.width;

        var sides = [{ x: 0, angle: 90 }, { x: graphics.canvas.width, angle: 270 }];
        var yPosition = Random.nextRange(0, graphics.canvas.height);
        var startSide = sides.splice(Random.nextRange(0,1), 1).pop();
        var endSide = sides.pop().x;

        self.aliens.push(Texture({
            image: alienImage,
            position: { x: startSide.x, y: yPosition },
            size: { width: width, height: height },
            speed: { x: 0, y: 0 },
            angularSpeed: 0,
            maxSpeed: 2,
            angle: startSide.angle,
            acceleration: 2,
            type: alienType,
            frictionFactor: 0.98,
            destination: endSide,
            lastShotTimestamp: 0,
            laserThrottle: 2000
        }));

        self.lastAlienTimestamp = timestamp;

    };

    self.loadAsteroids = function(amount, asteroidType) {
        var width = asteroidType.size;
        var height = width * asteroidImage.height / asteroidImage.width;
        var offset = { x: graphics.canvas.width * 0.15 / 2, y: graphics.canvas.height * 0.15 / 2 };

        while (--amount) {
            var range = {
                left: Random.nextRange(0, self.ship.position.x - offset.x),
                right: Random.nextRange(self.ship.position.x + offset.x, graphics.canvas.width),
                up: Random.nextRange(0, self.ship.position.y - offset.y),
                down: Random.nextRange(self.ship.position.y + offset.y, graphics.canvas.height)
            };

            var xPosition = [range.left, range.right].splice(Random.nextRange(0, 1), 1).pop();
            var yPosition = [range.up, range.down].splice(Random.nextRange(0, 1), 1).pop();

            self.asteroids.push(Texture({
                image: asteroidImage,
                position: { x: xPosition, y: yPosition },
                size: { width: width, height: height },
                speed: { x: Random.nextDoubleRange(-1.5, 1.5), y: Random.nextDoubleRange(-1.5, 1.5) },
                angularSpeed:  Random.nextGaussian(55, 10),
                angle: Random.nextRange(10, 350),
                acceleration: 0,
                maxSpeed: 1.5,
                type: asteroidType,
                frictionFactor: 1
            }));
        }
    };

    function Texture(spec) {
        var that = spec;

        that.initialAngle = that.angle;

        that.rotateRight = function(elapsedTime) {
			that.angle += that.angularSpeed * (elapsedTime / 1000);
            that.angle = ((that.angle < 0)? 360 - Math.abs(that.angle): that.angle) % 360;
		};

		that.rotateLeft = function(elapsedTime) {
			that.angle -= that.angularSpeed * (elapsedTime / 1000);
            that.angle = ((that.angle < 0)? 360 - Math.abs(that.angle): that.angle) % 360;
		};

		that.moveForward = function(elapsedTime) {
			move(elapsedTime, that.angle);
		};

        that.moveInInitialDirection = function(elapsedTime) {
            move(elapsedTime, that.initialAngle);
        };

        that.moveInAngle = function(angle, elapsedTime) {
            move(elapsedTime, angle);
        }

        that.render = function() {
            graphics.context.save();

			graphics.context.translate(that.position.x, that.position.y);
			graphics.context.rotate(that.angle * Math.PI / 180);
			graphics.context.translate(-that.position.x, -that.position.y);

			graphics.context.drawImage(
				that.image,
				that.position.x - that.size.width / 2,
				that.position.y - that.size.height / 2,
				that.size.width, that.size.height
            );

			graphics.context.restore();
        };

        that.update = function() {
            var canvasWidth = graphics.canvas.width;
            var canvasHeight = graphics.canvas.height;

            var newPositionX = that.position.x + that.speed.x;
            that.position.x = ((newPositionX <= 0)? canvasWidth: newPositionX) % (canvasWidth + 1);
            var newPositionY = that.position.y - that.speed.y;
            that.position.y = ((newPositionY <= 0)? canvasHeight: newPositionY) % (canvasHeight + 1);

            that.speed.x *= that.frictionFactor;
            that.speed.y *= that.frictionFactor;
        };

        function move(elapsedTime, angle) {
            var time = elapsedTime / 1000;
            var radiansAngle = angle * Math.PI / 180;
            var xComponent = Math.sin(radiansAngle);
            var yComponent = Math.cos(radiansAngle);

            var dx = that.acceleration * xComponent * time;
            var dy = that.acceleration * yComponent * time;

            var overSpeed = Math.sqrt(Math.pow(that.speed.y, 2) + Math.pow(that.speed.x, 2)) > that.maxSpeed;

            that.speed.x = (overSpeed)? that.speed.x: that.speed.x + dx;
            that.speed.y = (overSpeed)? that.speed.y: that.speed.y + dy;
        }

        return that;
    }

    return self;
}(AsteroidsGame.objects || {}));