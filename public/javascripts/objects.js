/**
 * Created by jcaraballo17.
 */

AsteroidsGame.objects = (function(self) {
    "use strict";

    var graphics = AsteroidsGame.graphics;
    var shipImage = graphics.images['images/assassin_ship.png'];

    self.aliens = [];
    self.asteroids = [];
    self.laserShots = [];
    self.ship = Texture({
        image: shipImage,
        position: { x: graphics.canvas.width / 2, y: graphics.canvas.height / 2 },
        size: { width: 20, height: 20 * shipImage.height / shipImage.width },
        rotateRate: Math.PI,
        moveRate: 20,
        angle: 90
    });

    function Texture(spec) {
        var that = {};
        var context = AsteroidsGame.graphics.context;

        that.rotateRight = function(elapsedTime) {
			spec.angle += spec.rotateRate * (elapsedTime / 1000);
		};

		that.rotateLeft = function(elapsedTime) {
			spec.angle -= spec.rotateRate * (elapsedTime / 1000);
		};

		that.moveLeft = function(elapsedTime) {
			spec.position.x -= spec.moveRate * (elapsedTime / 1000);
		};

		that.moveRight = function(elapsedTime) {
			spec.position.x -= spec.moveRate * (elapsedTime / 1000);
		};

		that.moveUp = function(elapsedTime) {
			spec.position.y += spec.moveRate * (elapsedTime / 1000);
		};

		that.moveDown = function(elapsedTime) {
			spec.position.y += spec.moveRate * (elapsedTime / 1000);
		};

        that.render = function() {
            context.save();

			context.translate(spec.position.x, spec.position.y);
			context.rotate(spec.angle);
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

    self.loadAliens = function(amount) {
        while (--amount) {
            self.aliens.push(new Alien());
        }
    };

    self.loadAsteroids = function(amount) {
        while (--amount) {
            self.asteroids.push(new Asteroid());
        }
    };


    return self;
}(AsteroidsGame.objects || {}));