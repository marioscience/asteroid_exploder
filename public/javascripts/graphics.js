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
        document.addEventListener('keyup', function(event) {
            if (event.keyCode == 27) {
                outOfScreen();
            }
        }, true);

        $('button#btnNewGame').click(function() { goToScreen(self.screens.game); });
        $('button#btnHighscores').click(function() { goToScreen(self.screens.highscores); });
        $('button#btnOptions').click(function() { goToScreen(self.screens.options); });
        $('button#btnCredits').click(function() { goToScreen(self.screens.credits); });
        $('button#btnKeyboard').click(function() { goToScreen(self.screens.keyboard); });
        $('button#btnSounds').click(function() { goToScreen(self.screens.audio); });
        $('.backButton').click(function() { outOfScreen(); });

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

    CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, self.canvas.width, self.canvas.height);
		this.restore();
	};

    return self;
}(AsteroidsGame.graphics || {}, jQuery));