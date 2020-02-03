var WINDOW_MARGIN = 10; // Margin on a side of the canvas
var CELL_SIZE = 25;
var COLOR_DRAG_ARROW = 'black';
var FRAME_RATE = 30;

var arrowStartCell = false;
var mouseDragging = false;
var mouseClicking = true;

var graph = {};
var startNode = false;
var endNode = false;
var shortestPath = false;

/* Setup of p5js */
function setup() {
    var cnv = createCanvas(
        windowWidth - 2 * WINDOW_MARGIN,
        windowHeight - 3 * WINDOW_MARGIN
    );
    cnv.parent('canvas');
    cnv.mouseClicked(mouseClickedEvent); // To ignore mouse clicks outside canvas area
}

/* The main draw loop */
var frameIdx = 0;
function draw() {
    background(255);

    // drawGrid();
    drawGraph();

    if (STATE == 'runAlgorithm' && shortestPath) {
        FRAME_RATE = 2;
        if (frameIdx == shortestPath.length - 1) {
            STATE = 'createGraph';
            shortestPath = false;
            frameIdx = 0;
            updateState();
        } else {
            curr = getNodeObj(shortestPath[frameIdx]);
            drawCircle(curr.x, curr.y, 'red');
            next = getNodeObj(shortestPath[frameIdx + 1]);
            drawEdge(curr, next, 'blue');
            frameIdx += 1;
        }
    } else FRAME_RATE = 30;
    frameRate(FRAME_RATE);

    // start and end node selection interaction
    var currCell = getCurrCell();
    if (Object.keys(graph).indexOf(getNodeKey(currCell)) != -1) {
        if (STATE == 'selectStartNode')
            drawCircle(currCell.x, currCell.y, 'green');
        else if (STATE == 'selectEndNode')
            drawCircle(currCell.x, currCell.y, 'red');
    }

    // for drawing arrow
    if (mouseDragging) drawArrow(arrowStartCell, { x: mouseX, y: mouseY });
}

/* Inbuilt functions */
function mouseClickedEvent() {
    var cell = getCurrCell();
    // create a new node only if the mouse is not dragging
    if (mouseClicking) {
        if (STATE == 'createGraph') createNode(cell);
        else if (STATE == 'selectStartNode') {
            console.log('select start node');
            setStartNode(cell);
        } else if (STATE == 'selectEndNode') {
            console.log('select end node');
            setEndNode(cell);
        }
    }
}
function mousePressed() {
    arrowStartCell = getCurrCell();
    dragging = false;
    if (!mouseClicking) mouseClicking = true;
}
function mouseDragged() {
    mouseDragging = true;
    mouseClicking = false;
    // check if current mouse position is inside a valid cell, then change arrow color
    var nodes = Object.keys(graph);
    var cell = getNodeKey(getCurrCell());
    if (nodes.indexOf(cell) > -1) COLOR_DRAG_ARROW = 'red';
    else COLOR_DRAG_ARROW = 'black';
}
function mouseReleased() {
    // if the mouse was dragging then check if it is a valid edge
    if (mouseDragging) {
        // check for nodes at start and end of line
        var nodes = Object.keys(graph);
        var start = getNodeKey(arrowStartCell);
        var arrowEndCell = getCurrCell();
        var end = getNodeKey(arrowEndCell);
        if (nodes.indexOf(start) > -1 && nodes.indexOf(end) > -1) {
            // add edge
            var cost = getCost(arrowStartCell, arrowEndCell);
            graph[start][end] = cost;
            // ** UNDIRECTED GRAPH ** //
            graph[end][start] = cost;
        }

        mouseDragging = false;
    }
}

/* Drawing functions */
function drawGrid(
    size = CELL_SIZE,
    width = windowWidth - WINDOW_MARGIN,
    height = windowHeight - WINDOW_MARGIN
) {
    for (var x = size; x < width; x += size) {
        for (var y = size; y < height; y += size) {
            stroke(230);
            strokeWeight(1);
            line(x, 0, x, height);
            line(0, y, width, y);
        }
    }
}
function drawGraph() {
    // draw edges
    Object.keys(graph).forEach(function(start) {
        var startNode = getNodeObj(start);
        Object.keys(graph[start]).forEach(function(end) {
            var endNode = getNodeObj(end);
            drawEdge(startNode, endNode, 'black');
        });
    });
    // draw the node circles
    // this is done separately so the edges don't overlap the node circles
    Object.keys(graph).forEach(function(node) {
        var nodeObj = getNodeObj(node);
        var color = 'blue';
        if (node === startNode) color = 'green';
        else if (node === endNode) color = 'red';
        drawCircle(nodeObj.x, nodeObj.y, color);
    });
}
function drawCircle(x, y, color = 'blue') {
    fill(color);
    strokeWeight(0);
    ellipse(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
}
// draw an arrow for a vector at a given base position
function drawArrow(arrowStartCell, arrowEndCell, myColor = 'red') {
    var base = createVector(
        arrowStartCell.x + CELL_SIZE / 2,
        arrowStartCell.y + CELL_SIZE / 2
    );
    var vec = createVector(arrowEndCell.x, arrowEndCell.y);
    stroke(COLOR_DRAG_ARROW);
    strokeWeight(3);
    line(base.x, base.y, vec.x, vec.y);
    // below not working for some reason - something related to the translation and the vectors
    // push();
    // stroke(myColor);
    // strokeWeight(3);
    // fill(myColor);
    // translate(base.x, base.y);
    // line(0, 0, vec.x, vec.y);
    // rotate(vec.heading());
    // let arrowSize = 7;
    // translate(vec.mag() - arrowSize, 0);
    // triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    // pop();
}
function drawEdge(startNode, endNode, color) {
    stroke(color);
    strokeWeight(2);
    line(
        startNode.x + CELL_SIZE / 2,
        startNode.y + CELL_SIZE / 2,
        endNode.x + CELL_SIZE / 2,
        endNode.y + CELL_SIZE / 2
    );
    strokeWeight(0);
}

/* Object CRUD functions */
function getCurrCell() {
    return {
        x: mouseX - (mouseX % CELL_SIZE),
        y: mouseY - (mouseY % CELL_SIZE)
    };
}
function createNode(cell) {
    /* To create a node and push it onto node stack
    Returns:
        node object
    */

    // define the node structure here
    // node = { x: x, y: y };
    var node = getNodeKey(cell);
    // Create the new node only if it does not exist
    if (Object.keys(graph).indexOf(node) == -1) graph[node] = {};

    console.log(graph);
}
function getNodeObj(node) {
    // returns a node as object
    var values = node.split('_');
    var node = { x: parseInt(values[0]), y: parseInt(values[1]) };
    return node;
}
function getNodeKey(node) {
    // arg can be cell or nodeObj
    // if (typeof node == 'string') return node;
    return `${node.x}_${node.y}`;
}
function setStartNode(cell) {
    var node = getNodeKey(cell);
    if (Object.keys(graph).indexOf(node) != -1) startNode = node;
}
function setEndNode(cell) {
    var node = getNodeKey(cell);
    if (Object.keys(graph).indexOf(node) != -1) endNode = node;
}
function getCost(start, end) {
    var startVec = createVector(start.x, start.y);
    var endVec = createVector(end.x, end.y);
    return round(startVec.dist(endVec));
}

// ALGORITHMS
function dijkstra(start, target) {
    var cost = {};
    var parents = {};
    var visited = {};

    // assign cost
    Object.keys(graph).forEach(function(node) {
        cost[node] = Infinity;
        visited[node] = false;
    });
    cost[start] = 0;
    // visited[start] = true;

    var curr_node = start;

    var min_cost;
    var min_cost_node;
    var iterations = Object.keys(graph).length;

    while (iterations > 0) {
        for (let child in graph[curr_node]) {
            if (
                !visited[child] &&
                cost[child] > cost[curr_node] + graph[curr_node][child]
            ) {
                cost[child] = cost[curr_node] + graph[curr_node][child];
                parents[child] = curr_node;
            }
        }
        visited[curr_node] = true;
        // find lowest cost node
        min_cost = Infinity;
        for (let node in cost) {
            if (cost[node] < min_cost && !visited[node]) {
                min_cost = cost[node];
                min_cost_node = node;
            }
        }
        curr_node = min_cost_node;

        iterations -= 1;
    }

    var optimalPath = [target];
    var parent = parents[target];

    while (parent) {
        optimalPath.push(parent);
        parent = parents[parent];
    }
    optimalPath.reverse();
    return optimalPath;
}

function aStar(start, target) {}
