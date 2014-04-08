/**
 * Created by jcaraballo17 on 4/2/14.
 */

var fs = require('fs');
var fileName = 'highscores.json';

var scoresAmount = 10;
var scores;
loadScores();

exports.all = function(request, response) {
    "use strict";

    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(scores));
};

exports.add = function(request, response) {
    "use strict";

    var score = { name: request.query.name, score: +request.query.score };
    addScore(score);
    response.writeHead(200);
    response.end();
};

function addScore(score) {
    "use strict";
    if (!score.name || score.hasOwnProperty(score)) {
        return;
    }
    scores.push(score);
    scores.sort(function (a, b) { return +b.score - +a.score });
    scores = scores.slice(0, scoresAmount);
    fs.writeFile(fileName, JSON.stringify(scores), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
}


function loadScores() {
    "use strict";
    //TODO: read scores from file.
    fs.readFile(fileName, function (err, data) {
        if (err) {
            console.log(err);
            scores = [];
            return;
        }
        scores = JSON.parse(data);
    });
}