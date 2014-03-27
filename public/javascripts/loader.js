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
                'preload!javascripts/asteroids.js',
                'preload!javascripts/graphics.js',
                'preload!javascripts/audio.js',
                'preload!javascripts/input.js',
                'preload!javascripts/logic.js',

                'preload!images/background.png',

                'preload!audio/click.wav',
                'preload!audio/background_menu.wav',
                'preload!audio/background_game.wav',
                'preload!audio/thrust.wav',
                'preload!audio/pew.wav',
                'preload!audio/alien.wav',
                'preload!audio/ship_explosion.wav',
                'preload!audio/rock_explosion.wav'
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

		if (AsteroidsGame.status.preloadComplete === AsteroidsGame.status.preloadRequest) { // EVERYTHING FINISHED LOADING
            AsteroidsGame.initialize();
            AsteroidsGame.startNewSimulation();
		}
	};

	return resource;
});

/*
Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}
*/