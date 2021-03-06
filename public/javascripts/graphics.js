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
        audio: $('#audioMenu'),
        credits: $('#credits'),
        options: $('#optionsMenu'),
        keyboard: $('#keyboardMenu'),
        highscores: $('#highscoresMenu'),
        submitScore: $('#submitScore'),
        loadingScreen: $('#loadingScreen')
    };

    var screenStack = [];
    var livesImageSize = 18;
    var shieldImageSize = 18;
    var scoreOffset = { x: 45, y: 35 };
    var levelOffset = { x: 70, y: 20 };

    var livesOffset = { x: scoreOffset.x - livesImageSize / 4, y: scoreOffset.y + 15 };
    var shieldOffset = { x: livesOffset.x - shieldImageSize / 4, y: livesOffset.y + 25 };
    var scoreRowTemplate = '<tr><td>{0}</td><td>{1}</td></tr>';

    self.initializeInterface = function() {
        bindMenuEvents();
        resizeCanvas();

        self.drawBackground();
        self.context.textAlign = 'center';
        screenStack.push(self.screens.menu);
        self.currentScreen = self.screens.menu;
        self.currentScreen.show();
        self.screens['loadingScreen'].hide();
    };

    self.showSubmitScoreScreen = function() {
        if (self.currentScreen === self.screens.submitScore) {
            return;
        }
        $('game-score').text(AsteroidsGame.score);
        screenStack.pop();
        self.currentScreen = self.screens.menu;
        goToScreen(self.screens.submitScore);
        AsteroidsGame.audio.playMenuMusic();
    };

    self.returnToMenuScreen = function() {
        while (screenStack.length > 1) {
            screenStack.pop();
        }

        self.currentScreen = self.screens.menu;
        self.currentScreen.show();
    };

    self.goToGameScreen = function() {
        goToScreen(self.screens.game);

    };

    self.cleanScreen = function() {
        self.clear();
        self.drawBackground();
    };

    self.clear = function() {
        self.context.clear();
    };

    self.drawBackground = function() {
        var background = self.images['images/background.png'];
        self.context.drawImage(background, 0, 0, self.canvas.width, self.canvas.height);
    };

    self.drawLevel = function() {
        var level = "Level " + AsteroidsGame.level;
        self.context.fillStyle = '#ffffff';
        self.context.textAlign = 'center';
        self.context.font = 'normal 16pt Hyperspace';
        self.context.fillText(level, self.canvas.width - levelOffset.x, self.canvas.height - levelOffset.y);
    };

    self.drawScore = function() {
        var currentScore = "" + AsteroidsGame.score;

        self.context.textAlign = 'left';
        self.context.fillStyle = '#ffffff';
        self.context.font = 'normal 16pt Hyperspace';
        self.context.fillText(currentScore, scoreOffset.x, scoreOffset.y);
    };

    self.drawLives = function() {
        var livesAmount = AsteroidsGame.lives;
        var livesImage = self.images['images/assassin_ship.png'];

        self.context.textAlign = 'left';
        self.context.fillStyle = '#ffffff';

        while (livesAmount--) {
            self.context.drawImage(
                livesImage,
                livesOffset.x + livesImageSize * livesAmount, livesOffset.y,
                livesImageSize, livesImageSize * livesImage.height / livesImage.width
            );
        }
    };

    self.drawShields = function() {
        var shieldAmount = AsteroidsGame.shields;
        var shieldImage = self.images['images/shield.png'];

        self.context.textAlign = 'left';
        self.context.fillStyle = '#ffffff';

        while (shieldAmount--) {
            self.context.drawImage(
                shieldImage,
                shieldOffset.x + shieldImageSize * shieldAmount, shieldOffset.y,
                shieldImageSize, shieldImageSize * shieldImage.height / shieldImage.width
            );
        }
    };

    self.drawHyperspaceCooldown = function(cooldown) {
        var barSize = {
            width: self.canvas.width * 0.5,
            height: 18
        };

        var barPosition = {
            x: (self.canvas.width - barSize.width) / 2,
            y: self.canvas.height - barSize.height * 2
        };

        var cooldownSize = barSize.width * cooldown.current / cooldown.required;

        self.context.strokeStyle = '#E5E4E2';
        self.context.fillStyle = 'rgba(188, 198, 204, 0.2)';
        self.context.fillRect(barPosition.x, barPosition.y, barSize.width, barSize.height);
        self.context.strokeRect(barPosition.x, barPosition.y, barSize.width, barSize.height);

        self.context.fillStyle = 'rgba(72, 99, 160, 0.6)';
        self.context.fillRect(barPosition.x, barPosition.y, cooldownSize, barSize.height);
    };

    self.drawAttractModeText = function() {
        self.context.textAlign = 'left';
        self.context.fillStyle = '#ffffff';
        self.context.font = 'normal 16pt Hyperspace';
        self.context.fillText('Attract Mode', scoreOffset.x, scoreOffset.y);
    };


    self.drawImage = function(spec) {
		self.context.save();

		self.context.translate(spec.center.x, spec.center.y);
		self.context.rotate(spec.rotation);
		self.context.translate(-spec.center.x, -spec.center.y);

		self.context.drawImage(
			spec.image,
			spec.center.x - spec.size/2,
			spec.center.y - spec.size/2,
			spec.size, spec.size
        );

		self.context.restore();
	};

    self.updateHighscores = function() {
        var tableContent = [];
        AsteroidsGame.highscores.forEach(function(highscore) {
            tableContent.push(String.format(scoreRowTemplate, highscore.name, highscore.score));
        });

        $('#scoresTable').find('tbody')
            .empty()
            .append($(tableContent.join('')));
    };

    function resizeCanvas() {
        var width = $(window).width();
        var height = $(window).height();
        self.canvas.width = width * 0.667;
        self.canvas.height = self.canvas.width * 1.3 * height / width;
    }

    function bindMenuEvents() {
        self.screens.audio.on('beforeShow', function () { restoreAudioConfig(); });
        self.screens.keyboard.on('beforeShow', function () { restoreKeyConfig(); });
        self.screens.submitScore.on('beforeShow', function () { $('#txtName').focus(); });

        $('button#btnOptions').click(function() { goToScreen(self.screens.options); });
        $('button#btnKeyboard').click(function() { goToScreen(self.screens.keyboard); });
        $('button#btnHighscores').click(function() { goToScreen(self.screens.highscores); });
        $('button#btnCredits').click(function() { goToScreen(self.screens.credits); });
        $('button#btnSounds').click(function() { goToScreen(self.screens.audio); });
        $('button#btnApplyAudio').click(function() { applyAudioConfig(); });
        $('button#btnApplyKeys').click(function() { applyKeyConfig(); });
        $('button#btnSubmitScore').click(function() { doSubmitScore(); });

        $('.backButton').click(function() { outOfScreen(); });

        $('button#btnNewGame').click(function() {
            goToScreen(self.screens.game);
            AsteroidsGame.startNewGame();
        });

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
            right: +$('#txtRight').get(0).dataset.key,
            hyperspace: +$('#txtHyperspace').get(0).dataset.key,
            shoot: +$('#txtShoot').get(0).dataset.key,
            shield: +$('#txtShield').get(0).dataset.key,
            left: +$('#txtLeft').get(0).dataset.key
        };
    }

    function retrieveAudioConfig() {
        return {
            musicVolume: +$('#sliderMusic').val(),
            fxVolume: +$('#sliderFx').val()
        };
    }

    function restoreKeyConfig() {
        var getKeyName = AsteroidsGame.input.getKeyName;
        var keyConfig = AsteroidsGame.configuration.keyboard;
        $('#txtUp').val(getKeyName(keyConfig.up))
            .get(0).dataset.key = keyConfig.up;
        $('#txtRight').val(getKeyName(keyConfig.right))
            .get(0).dataset.key = keyConfig.right;
        $('#txtHyperspace').val(getKeyName(keyConfig.hyperspace))
            .get(0).dataset.key = keyConfig.hyperspace;
        $('#txtShoot').val(getKeyName(keyConfig.shoot))
            .get(0).dataset.key = keyConfig.shoot;
        $('#txtShield').val(getKeyName(keyConfig.shield))
            .get(0).dataset.key = keyConfig.shield;
        $('#txtLeft').val(getKeyName(keyConfig.left))
            .get(0).dataset.key = keyConfig.left;
    }

    function restoreAudioConfig() {
        var audioConfig = AsteroidsGame.configuration.sound;
        $('#sliderMusic').val(audioConfig.musicVolume);
        $('#sliderFx').val(audioConfig.fxVolume);
    }

    function doSubmitScore() {
        var name = $('#txtName').val();
        if (!name) {
            alert("Enter a name!");
            return;
        }

        AsteroidsGame.submitCurrentScore(name);
        outOfScreen();
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