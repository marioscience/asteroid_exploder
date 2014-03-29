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

    var laserThrottle = 200;
    var lastShotTimestamp = 0;

    var graphics = AsteroidsGame.graphics;
    var shipImage = graphics.images['images/assassin_ship.png'];
    var asteroidImage = graphics.images['images/asteroid_big1.png'];
    var alienImage = graphics.images['images/planet_1.png'];
    var laserImage = graphics.images['images/laser_shot.png'];

    var alienTypes = {
        big: { size: 15 },
        small: { size: 5 }
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
            frictionFactor: .999
        });
    };

    self.loadLaserShot = function(timestamp) {
        if (timestamp - lastShotTimestamp < laserThrottle) {
            return;
        }

        var xComponent = Math.sin(this.ship.angle * Math.PI / 180);
        var yComponent = Math.cos(this.ship.angle * Math.PI / 180);

        var width = 2;
        var height = width * laserImage.height / laserImage.width + 5;

        var shot = Texture({
            image: laserImage,
            position: { x: this.ship.position.x, y: this.ship.position.y },
            size: { width: width, height: height },
            speed: { x: xComponent * this.ship.maxSpeed, y: yComponent * this.ship.maxSpeed },
            angularSpeed: 0,
            maxSpeed: 10,
            angle: this.ship.angle,
            timestamp: timestamp,
            lifespan: 1000,
            acceleration: 5,
            frictionFactor: 1
        });

        lastShotTimestamp = timestamp;
        self.laserShots.push(shot);
    };

    self.loadAliens = function(amount) {
        //TODO: refactor this
        while (--amount) {
            var side = Math.floor((Math.random()*2)+1);
            var size = Math.floor((Math.random()*5)+0);
            var alienArr = [{ size: 40 }, { size: 5 }, { size: 40 }, { size: 5 }, { size: 40 }, { size: 40 }];
            var alienType = alienTypes.big; // determine alien type randomly and whatnot.
            var alien = Texture({
                image: alienImage,
                position: { x: (side == 1)?  0 :  graphics.canvas.width, y: Math.floor(Math.random()*graphics.canvas.width) }, // en un edge del canvas, 'y' es random
                size: { width: alienArr[size].size, height: alienArr[size].size * alienImage.height / alienImage.width }, // en vez de 20, el alienType.size
                rotateRate: 0, // FUCKING ALIENS! YOU GET NOTHING! ----> 0
                speed: Random.nextGaussian(20, 10), // la veldadera velocida de la lu lucina.
                angle: (side == 1)? Math.floor((Math.random()*135)+10) : -(Math.floor((Math.random()*135)+10)) // una direccion random, preferiblemente opuesta a la esquina en que salio.
            });
            alien.type = alienType;

            self.aliens.push(alien);
        }
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

            var asteroid = Texture({
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

                //TODO: consider adding a 'destroyed' attribute to stop rendering it and activate particle system for a couple of seconds.
            });

            self.asteroids.push(asteroid);
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

            that.speed.x = (overSpeed)? that.maxSpeed * xComponent: that.speed.x + dx;
            that.speed.y = (overSpeed)? that.maxSpeed * yComponent: that.speed.y + dy;
        }

        return that;
    }

    return self;
}(AsteroidsGame.objects || {}));