/**
 * Created by jcaraballo17.
 */

AsteroidsGame.objects = (function(self) {
    "use strict";

    var initialAsteroid = 5;
    var alienTypes = { big: { size: 15 }, small: { size: 5 } };
    var asteroidTypes = { big: { size: 40 }, medium: { size: 25 }, small: { size: 5 } };

    var graphics = AsteroidsGame.graphics;
    var shipImage = graphics.images['images/assassin_ship.png'];
    var asteroidImage = graphics.images['images/asteroid_big1.png'];
    var alienImage = graphics.images['images/planet_1.png'];


    self.aliens = [];
    self.asteroids = [];
    self.laserShots = [];
    self.ship = Texture({
        image: shipImage,
        position: { x: graphics.canvas.width / 2, y: graphics.canvas.height / 2 },
        size: { width: 20, height: 20 * shipImage.height / shipImage.width },
        rotateRate:50,
        moveRate: 80,
        angle: 60
    });

    self.loadAliens = function(amount) {
        while (--amount) {
            var side = Math.floor((Math.random()*2)+1);
            var size = Math.floor((Math.random()*5)+0);
            var alienArr = [{ size: 40 }, { size: 5 }, { size: 40 }, { size: 5 }, { size: 40 }, { size: 40 }]
            var alienType = alienTypes.big; // determine alien type randomly and whatnot.
            var alien = Texture({
                image: alienImage,
                position: { x: (side == 1)?  0 :  graphics.canvas.width, y: Math.floor(Math.random()*graphics.canvas.width) }, // en un edge del canvas, 'y' es random
                size: { width: alienArr[size].size, height: alienArr[size].size * alienImage.height / alienImage.width }, // en vez de 20, el alienType.size
                rotateRate: 0, // FUCKING ALIENS! YOU GET NOTHING! ----> 0
                moveRate: Random.nextGaussian(20, 10), // la veldadera velocida de la lu lucina.
                angle: (side == 1)? Math.floor((Math.random()*135)+10) : -(Math.floor((Math.random()*135)+10)) // una direccion random, preferiblemente opuesta a la esquina en que salio.
            });
            alien.type = alienType;
            self.aliens.push(alien);
        }
    };

    self.loadAsteroids = function(amount) {
        while (--amount) {
            var side = Math.floor((Math.random()*2)+1);
            var asteroid = Texture({
                image: asteroidImage,
                position: { x: (side == 1)?  Math.floor((Math.random()*(graphics.canvas.width/2)-graphics.canvas.width*0.1)+5) :  Math.floor((Math.random()*(graphics.canvas.width/2)+graphics.canvas.width*0.1)+graphics.canvas.width/2), y: Math.floor(Math.random()*graphics.canvas.width) }, // en un edge del canvas, 'y' es random
                size: { width: asteroidTypes.big.size, height: asteroidTypes.big.size * asteroidImage.height / asteroidImage.width },
                rotateRate:  Random.nextGaussian(25, 10),//Math.floor((Math.random()*35)+15), // FUCKING ALIENS! YOU GET NOTHING! ----> 0
                moveRate: Math.floor((Math.random()*35)+5), // la veldadera velocida de la lu lucina.
                angle: (side == 2)? Math.floor((Math.random()*170)+10) : -(Math.floor((Math.random()*170)+10)), //Random.nextGaussian(90, 80) : -(Random.nextGaussian(90, 80)), // una direccion random, preferiblemente opuesta al lado en que salio.
                side_end: (side == 1)? 'right': 'left'
            });

            self.asteroids.push(asteroid);
        }
    };

    function Texture(spec) {
        var that = {};
        var canvas = AsteroidsGame.graphics.canvas;
        var context = AsteroidsGame.graphics.context;

        that.initialAngle = spec.angle;

        that.rotateRight = function(elapsedTime) {
			spec.angle += spec.rotateRate * (elapsedTime / 1000);
            spec.angle = ((spec.angle < 0)? 360 - Math.abs(spec.angle): spec.angle) % 360;
		};

		that.rotateLeft = function(elapsedTime) {
			spec.angle -= spec.rotateRate * (elapsedTime / 1000);
            spec.angle = ((spec.angle < 0)? 360 - Math.abs(spec.angle): spec.angle) % 360;
		};

		that.moveForward = function(elapsedTime) {
			move(elapsedTime, spec.angle);
		};

        that.moveInInitialDirection = function(elapsedTime) {
            move(elapsedTime, that.initialAngle);
        };


        that.render = function() {
            context.save();

			context.translate(spec.position.x, spec.position.y);
			context.rotate(-spec.angle * Math.PI / 180);
			context.translate(-spec.position.x, -spec.position.y);

			context.drawImage(
				spec.image,
				spec.position.x - spec.size.width / 2,
				spec.position.y - spec.size.height / 2,
				spec.size.width, spec.size.height
            );

			context.restore();
        };

        that.setPosition = function(newPosition) {
            spec.position.x = newPosition.x;
            spec.position.y = newPosition.y;
        };

        function move(elapsedTime, angle) {
            spec.position.x += spec.moveRate * (elapsedTime / 1000) * Math.sin(angle * Math.PI / 180);
            spec.position.x = ((spec.position.x <= 0)? canvas.width: spec.position.x) % (canvas.width + 1);
            spec.position.y += spec.moveRate * (elapsedTime / 1000) * Math.cos(angle * Math.PI / 180);
            spec.position.y = ((spec.position.y <= 0)? canvas.height: spec.position.y) % (canvas.height + 1);
        }

        return that;
    }

    return self;
}(AsteroidsGame.objects || {}));