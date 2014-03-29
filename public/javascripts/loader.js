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
                'preload!javascripts/asteroids.js',
                'preload!javascripts/graphics.js',
                'preload!javascripts/audio.js',

                'preload!images/background.png',
                'preload!images/assassin_ship.png',
                'preload!images/asteroid_big1.png',
                'preload!images/planet_1.png',
                'preload!images/laser_shot.png',

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
                'preload!javascripts/configuration.js',
                'preload!javascripts/logic.js'
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
 *  Extend object type to get an attribute name by its value.
 */
Object.prototype.getKeyByValue = function( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
    return null;
};

/*
 * Extend Function type to debounce.
 */

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
		if (immediate && !timeout) func.apply(context, args);
	};
}


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