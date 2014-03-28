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
    var asteroidImage = {};//graphics.images['images/assassin_ship.png'];
    var alienImage = {};//graphics.images['images/assassin_ship.png'];


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
            var alienType = alienTypes.big; // determine alien type randomly and whatnot.
            var alien = Texture({
                image: shipImage,
                position: { x: graphics.canvas.width / 2, y: graphics.canvas.height / 2 }, // en un edge del canvas
                size: { width: alienType.size, height: alienType.size * shipImage.height / shipImage.width }, // en vez de 20, el alienType.size
                rotateRate: 50, // FUCKING ALIENS! YOU GET NOTHING! ----> 0
                moveRate: 7, // la veldadera velocida de la lu lucina.
                angle: 0 // una direccion random, preferiblemente opuesta a la esquina en que salio.
            });
            alien.type = alienType;
            self.aliens.push(alien);
        }
    };

    self.loadAsteroids = function(amount) {
        while (--amount) {
            var asteroid = Texture({}); // lo mimo que lo alien
            self.asteroids.push(asteroid);
        }
    };

    function Texture(spec) {
        var that = {};
        var canvas = AsteroidsGame.graphics.canvas;
        var context = AsteroidsGame.graphics.context;

        that.rotateRight = function(elapsedTime) {
			spec.angle += spec.rotateRate * (elapsedTime / 1000);
            spec.angle = ((spec.angle < 0)? 360 - Math.abs(spec.angle): spec.angle) % 360;
		};

		that.rotateLeft = function(elapsedTime) {
			spec.angle -= spec.rotateRate * (elapsedTime / 1000);
            spec.angle = ((spec.angle < 0)? 360 - Math.abs(spec.angle): spec.angle) % 360;
		};

		that.moveForward = function(elapsedTime) {
			spec.position.x += spec.moveRate * (elapsedTime / 1000) * Math.sin(spec.angle * Math.PI / 180);
            spec.position.x = ((spec.position.x <= 0)? canvas.width: spec.position.x) % (canvas.width + 1);
            spec.position.y += spec.moveRate * (elapsedTime / 1000) * Math.cos(spec.angle * Math.PI / 180);
            spec.position.y = ((spec.position.y <= 0)? canvas.height: spec.position.y) % (canvas.height + 1);
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

        return that;
    }

    return self;
}(AsteroidsGame.objects || {}));