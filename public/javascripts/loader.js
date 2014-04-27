/**
 * Created by jcaraballo17.
 */

var AsteroidsGame = {};

AsteroidsGame.status = {
    preloadRequest : 0,
    preloadComplete : 0
};

window.addEventListener('load', function() {
    Modernizr.load([
		{
			load : [
                'preload!javascripts/vendor/jquery-1.11.0.min.js',
                'preload!javascripts/vendor/random.js',
                'preload!javascripts/vendor/particle-system.js',
                'preload!javascripts/asteroids.js',
                'preload!javascripts/graphics.js',
                'preload!javascripts/audio.js',

                'preload!images/background.png',
                'preload!images/assassin_ship.png',
                'preload!images/asteroid_big1.png',
                'preload!images/alien.png',
                'preload!images/laser_shot.png',
                'preload!images/fire.png',
                'preload!images/alien_small.png',
                'preload!images/alienexp.png',
                'preload!images/asteroidexp.png',
                'preload!images/shipexp.png',
                'preload!images/shield.png',
                'preload!images/teletrans.gif',

                'preload!audio/click.wav',
                'preload!audio/background_menu.wav',
                'preload!audio/background_game.wav',
                'preload!audio/thrust.wav',
                'preload!audio/pew.wav',
                'preload!audio/alien.wav',
                'preload!audio/ship_explosion.wav',
                'preload!audio/rock_explosion.wav',


                'preload!javascripts/input.js',
                'preload!javascripts/objects.js',
                'preload!javascripts/configuration.js'
			],
			complete : function() {
				console.log('All files requested for loading...');
			}
		}
	]);
});

yepnope.addPrefix('preload', function(resource) {
	console.log('preloading: ' + resource.url);

	AsteroidsGame.status.preloadRequest += 1;
	var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
    var isAudio = /.+\.(wav|mp3|ogg)$/i.test(resource.url);

	resource.noexec = isImage || isAudio;
	resource.autoCallback = function() {
		if (isImage) {
			var image = new Image();
			image.src = resource.url;
			AsteroidsGame.graphics.images[resource.url] = image;
		} else if (isAudio) {
            AsteroidsGame.audio.sounds[resource.url] = new Audio(resource.url);
        }
		AsteroidsGame.status.preloadComplete += 1;

		if (AsteroidsGame.status.preloadComplete === AsteroidsGame.status.preloadRequest) {
            AsteroidsGame.initialize();
		}
	};

	return resource;
});

/*
 *  Extend the storage object to save data as a json string.
 */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};


/*
* Array.indexOf polyfill
*/

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        if ( this === undefined || this === null ) {
            throw new TypeError( '"this" is null or not defined' );
        }

        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }

        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
              fromIndex = 0;
            }
        }

        for (;fromIndex < length; fromIndex++) {
            if (this[fromIndex] === searchElement) {
              return fromIndex;
            }
        }

        return -1;
    };
}

/*
* Extend String type to support string formatting.
* Source: http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery/1038930#1038930
*/
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }

  return s;
};

/*
* Math.sign polyfill.
*/
if (!Math.sign) {
    Math.sign = function(number) {
        return (number)? ((number < 0)? -1: 1): 0;
    };
}