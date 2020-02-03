// creating_graph
var STATE = 'createGraph';
var SELECTED_ALGO = 'dijkstra';

$(document).ready(function() {
    $('button').click(function() {
        STATE = $(this).attr('id');
        updateState();
    });
});

function updateState() {
    if (STATE == 'runAlgorithm') {
        if (!startNode) {
            alert('Select Start Node');
            STATE = 'selectStartNode';
        } else if (!endNode) {
            alert('Select End Node');
            STATE = 'selectEndNode';
        }
        SELECTED_ALGO = $('#selectedAlgo :selected').text();
        // Call run algo here so points is also populated and the animation begins
        shortestPath = dijkstra(startNode, endNode);
    }
    $('button').removeClass('selected');
    $(`#${STATE}`).addClass('selected');
}
