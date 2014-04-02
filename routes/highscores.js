/**
 * Created by jcaraballo17 on 4/2/14.
 */

var scoresAmount = 10;
var scores = [];

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
    //TODO: persist modified scores to file.
}

/*
function loadScores() {
    "use strict";
    //TODO: read scores from file.
}
*/