/**
 * Created by jcaraballo17.
 */

AsteroidsGame.graphics = (function(self, $) {
    "use strict";

    self.images = {};
    self.canvas = document.getElementById('game-canvas');
    self.context = self.canvas.getContext('2d');
    self.currentScreen = {};
    self.screens = {
        game: $('#game'),
        menu: $('#mainMenu'),
        credits: $('#credits'),
        options: $('#optionsMenu'),
        keyboard: $('#keyboardMenu'),
        audio: $('#audioMenu'),
        highscores: $('#highscoresMenu')
    };

    var screenStack = [];

    self.initializeInterface = function() {
        window.addEventListener('resize', resizeCanvas, false);
        bindMenuEvents();
        resizeCanvas();

        self.context.textAlign = 'center';
        screenStack.push(self.screens.menu);
        self.currentScreen = self.screens.menu;
        self.currentScreen.show();
    };

    self.clear = function() {
        self.context.clear();
    };

    self.drawBackground = function() {
        var background = self.images['images/background.png'];
        self.context.drawImage(background, 0, 0, self.canvas.width, self.canvas.height);
    };

    function resizeCanvas() {
        var width = $(window).width();
        var height = $(window).height();
        self.canvas.width = width * 0.667;
        self.canvas.height = self.canvas.width * 1.3 * height / width;
    }

    function bindMenuEvents() {
        self.screens.audio.bind('beforeShow', function () { restoreAudioConfig(); });
        self.screens.keyboard.bind('beforeShow', function () { restoreKeyConfig(); });
        $('button#btnOptions').click(function() { goToScreen(self.screens.options); });
        $('button#btnKeyboard').click(function() { goToScreen(self.screens.keyboard); });
        $('button#btnHighscores').click(function() { goToScreen(self.screens.highscores); });
        $('button#btnCredits').click(function() { goToScreen(self.screens.credits); });
        $('button#btnSounds').click(function() { goToScreen(self.screens.audio); });
        $('button#btnNewGame').click(function() { goToScreen(self.screens.game); });
        $('button#btnApplyAudio').click(function() { applyAudioConfig(); });
        $('button#btnApplyKeys').click(function() { applyKeyConfig(); });

        $('.backButton').click(function() { outOfScreen(); });
        $('.key-input').keydown(function(event) {
            var key = (window.Event) ? event.which : event.keyCode;
            if (key == KeyEvent.DOM_VK_TAB) {
                return true;
            }

            changeKeyInput(this, key);
            return false;
        });
    }

    function goToScreen(screen) {
        screenStack.push(screen);
        self.currentScreen.hide();
        self.currentScreen = screen.show();
    }

    function outOfScreen() {
        if (screenStack.length <= 1) {
            return;
        }
        screenStack.pop();
        goToScreen(screenStack.pop());
    }

    function changeKeyInput(input, key) {
        var canSetKey = true;
        var keyString = AsteroidsGame.input.getKeyName(key);

        if (key === KeyEvent.DOM_VK_ESCAPE || key === KeyEvent.DOM_VK_BACK_SPACE) {
            canSetKey = false;
        }

        $('.key-input').each(function(index, item) {
            if (keyString === $(item).val()) {
                canSetKey = false;
            }
        });
        if (canSetKey) {
            input.dataset.key = key;
            $(input).val(keyString);
        }
    }

    function applyKeyConfig() {
        AsteroidsGame.changeKeyConfig(retrieveKeyConfig());
        //alert("Key configuration applied.");
        outOfScreen();
    }

    function applyAudioConfig() {
        AsteroidsGame.changeAudioConfig(retrieveAudioConfig());
        //alert("Audio configuration applied.");
        outOfScreen();
    }

    function retrieveKeyConfig() {
        return {
            up: +$('#txtUp').get(0).dataset.key,
            down: +$('#txtDown').get(0).dataset.key,
            right: +$('#txtRight').get(0).dataset.key,
            hyperspace: +$('#txtHyperspace').get(0).dataset.key,
            shoot: +$('#txtShoot').get(0).dataset.key,
            left: +$('#txtLeft').get(0).dataset.key
        };
    }

    function retrieveAudioConfig() {
        return {
            musicVolume: $('#sliderMusic').val(),
            fxVolume: $('#sliderFx').val()
        };
    }

    function restoreKeyConfig() {
        var getKeyName = AsteroidsGame.input.getKeyName;
        var keyConfig = AsteroidsGame.configuration.keyboard;
        $('#txtUp').val(getKeyName(keyConfig.up))
            .get(0).dataset.key = keyConfig.up;
        $('#txtDown').val(getKeyName(keyConfig.down))
            .get(0).dataset.key = keyConfig.down;
        $('#txtRight').val(getKeyName(keyConfig.right))
            .get(0).dataset.key = keyConfig.right;
        $('#txtHyperspace').val(getKeyName(keyConfig.hyperspace))
            .get(0).dataset.key = keyConfig.hyperspace;
        $('#txtShoot').val(getKeyName(keyConfig.shoot))
            .get(0).dataset.key = keyConfig.shoot;
        $('#txtLeft').val(getKeyName(keyConfig.left))
            .get(0).dataset.key = keyConfig.left;
    }

    function restoreAudioConfig() {
        var audioConfig = AsteroidsGame.configuration.sound;
        $('#sliderMusic').val(audioConfig.musicVolume);
        $('#sliderFx').val(audioConfig.fxVolume);
    }

    CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, self.canvas.width, self.canvas.height);
		this.restore();
	};

    return self;
}(AsteroidsGame.graphics || {}, jQuery));


/*
 *  Extend the jquery function .show to trigger a before and after show event.
 */
(function ($) {
    var _oldShow = $.fn.show;

    $.fn.show = function (/*speed, easing, callback*/) {
        var argsArray = Array.prototype.slice.call(arguments),
            //duration = argsArray[0],
            //easing,
            callback,
            callbackArgIndex;

        // jQuery recursively calls show sometimes; we shouldn't
        //  handle such situations. Pass it to original show method.
        if (!this.selector) {
            _oldShow.apply(this, argsArray);
            return this;
        }

        if (argsArray.length === 2) {
            if ($.isFunction(argsArray[1])) {
                callback = argsArray[1];
                callbackArgIndex = 1;
            } else {
                //easing = argsArray[1];
            }
        } else if (argsArray.length === 3) {
            //easing = argsArray[1];
            callback = argsArray[2];
            callbackArgIndex = 2;
        }

        return $(this).each(function () {
            var obj = $(this),
                oldCallback = callback,
                newCallback = function () {
                    if ($.isFunction(oldCallback)) {
                        oldCallback.apply(obj);
                    }
                };

            if (callback) {
                argsArray[callbackArgIndex] = newCallback;
            }

            obj.trigger('beforeShow');

            _oldShow.apply(obj, argsArray);

            obj.trigger('afterShow');
        });
    };
})(jQuery);