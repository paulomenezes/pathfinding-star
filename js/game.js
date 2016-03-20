var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var START = [5, 0];
var END = [10, 10];

var OPENLIST = [];
var CLOSELIST = [];

var calc = [
	[0, -1], [-1, 0], [1, 0], [0, 1]
];

var WALLS = [
	[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
];

var PLAY = false;

var path = [];

var LENGTH = 50;
var SIZE = 10;

function constructor() {
	reset();

	document.addEventListener('mousedown', function (e) {
		if (!findWall([Math.round(e.x / SIZE), Math.round(e.y / SIZE)])) {
			END = [Math.round(e.x / SIZE), Math.round(e.y / SIZE)];
			PLAY = true;
		}

		reset();
	});

	for (var i = 0; i < 700; i++) {
		WALLS.push([Math.floor((Math.random() * 50)), Math.floor((Math.random() * 50))]);
	};
}

function reset () {
	OPENLIST = [];
	CLOSELIST = [];
	path = [];

	var empty = {
		parent: null,
		point: START
	};

	OPENLIST.push(empty);
	CLOSELIST.push(empty);

	near();

	OPENLIST.splice(0, 1);
}

function near () {
	for (var i = 0; i < calc.length; i++) {
		if (!findWall([START[0] + calc[i][0], START[1] + calc[i][1]]) &&
			calcBoundaries(START[0] + calc[i][0], START[1] + calc[i][1])) {
			OPENLIST.push({
				parent: {
					point: START
				},
				point: [START[0] + calc[i][0], START[1] + calc[i][1]]
			});
		}
	};
}

function update () {
	if (START[0] == END[0] && START[1] == END[1]) {
		PLAY = false;
		console.log('FIND');

		var parent = null;
		for (var i = CLOSELIST.length - 1; i >= 0; i--) {
			if (!parent) {
				parent = CLOSELIST[i].parent.point;
				path.push(CLOSELIST[i].point);
			} else {
				if (CLOSELIST[i].point[0] == parent[0] && CLOSELIST[i].point[1] == parent[1]) {
					if (CLOSELIST[i].parent && CLOSELIST[i].parent.point) {
						parent = CLOSELIST[i].parent.point;
						path.push(CLOSELIST[i].point);
					} else {
						path.push(CLOSELIST[i].point);
						break;
					}
				}
			}
		};
	} else if (OPENLIST.length > 0) {
		// CALCULAR F
		for (var i = 0; i < OPENLIST.length; i++) {
			var v = [OPENLIST[i].point[0] - END[0], OPENLIST[i].point[1] - END[1]];
			var r = [OPENLIST[i].point[0] - OPENLIST[i].parent.point[0], OPENLIST[i].point[1] - OPENLIST[i].parent.point[1]];

			var g = 0;

			var h = (Math.abs(v[0]) + Math.abs(v[1])) * 10;
			//h = h + OPENLIST[i].parent.H;

			/*if (r[0] == -1 && r[1] == -1 || r[0] == 1 && r[1] == -1 || 
				r[0] == -1 && r[1] == 1 || r[0] == 1 && r[1] == 1) {

	    		g = 14;
	    		// + OPENLIST[i].parent.G;
	    	} else */if (r[0] == 0 && r[1] == -1 || r[0] == -1 && r[1] == 0 ||
	    			   r[0] == 1 && r[1] == 0 || r[0] == 0 && r[1] == 1) {
	    		g = 10;
	    		// + OPENLIST[i].parent.G;
	    	}

	    	var F = h + g;

	    	OPENLIST[i].F = F;
	    	OPENLIST[i].H = h;
	    	OPENLIST[i].G = g;
		};

		var lessF = 9999;
		var index = 0;
		for (var i = 0; i < OPENLIST.length; i++) {
			if (OPENLIST[i].F <= lessF) {
				lessF = OPENLIST[i].F;
				index = i;
			}
		}

		var ESCOLHIDO = OPENLIST[index];

		START = ESCOLHIDO.point;

		CLOSELIST.push(OPENLIST[index]);
		OPENLIST.splice(index, 1);

		var opcoes = [];
		for (var i = 0; i < calc.length; i++) {
			var add = false;

			if (!findOpen([ESCOLHIDO.point[0] + calc[i][0], ESCOLHIDO.point[1] + calc[i][1]])) {
				add = true;
			}

			if (findClose([ESCOLHIDO.point[0] + calc[i][0], ESCOLHIDO.point[1] + calc[i][1]]) ||
				findWall([ESCOLHIDO.point[0] + calc[i][0], ESCOLHIDO.point[1] + calc[i][1]])) {
				add = false;
			}

			if (add)
				opcoes.push(calc[i]);
		};

		for (var i = 0; i < opcoes.length; i++) {
			if (calcBoundaries(ESCOLHIDO.point[0] + opcoes[i][0], ESCOLHIDO.point[1] + opcoes[i][1])) {
				OPENLIST.push({
					parent: {
						G: ESCOLHIDO.G,
						point: [ESCOLHIDO.point[0], ESCOLHIDO.point[1]]
					},
					point: [ESCOLHIDO.point[0] + opcoes[i][0], ESCOLHIDO.point[1] + opcoes[i][1]]
				});
			}
		};
	} else {
		console.log('NO PATH');
		PLAY = false;
	}
}

function draw () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < LENGTH; i++) {
		for (var j = 0; j < LENGTH; j++) {
			var text = 0;

			ctx.beginPath();
            ctx.rect(SIZE * i, SIZE * j, SIZE, SIZE);
            
            if (i == START[0] && j == START[1]) { // PAI
            	ctx.fillStyle = "#0095DD";	
            } else if (i === END[0] && j === END[1]) { // DESTINO
            	ctx.fillStyle = "#00FF00";	
            } else if (findWall([i, j])) {
            	ctx.fillStyle = "#0000FF";	
            } else { // OUTROS
            	ctx.fillStyle = "#000";	
            }

            for (var k = 0; k < path.length; k++) {
            	if (i == path[k][0] && j == path[k][1]) {
            		ctx.fillStyle = "#FF0000";
            	}
            };

            ctx.fill();
            ctx.closePath();
		}
	};
}

function findOpen (item) {
	for (var i = 0; i < OPENLIST.length; i++) {
		if (OPENLIST[i].wall) {
			return false;
		} else {
			if (OPENLIST[i].point[0] == item[0] && OPENLIST[i].point[1] == item[1]) {
				return [item[0] - OPENLIST[i].parent.point[0], item[1] - OPENLIST[i].parent.point[1], i];
			}
		}
	};

	return false;
}

function findClose (item) {
	for (var i = 0; i < CLOSELIST.length; i++) {
		if (CLOSELIST[i].point[0] == item[0] && CLOSELIST[i].point[1] == item[1]) {
			return true;
		}
	};

	return false;
}

function findWall (item) {
	for (var i = 0; i < WALLS.length; i++) {
		if (WALLS[i][0] == item[0] && WALLS[i][1] == item[1]) {
			return true;
		}
	};

	return false;
}

function calcBoundaries (value1, value2) {
	if (value1 >= 0 &&  value2 >= 0 && value1 < LENGTH && value2 < LENGTH) {
		return true;
	}

	return false;
}

constructor();
draw();

setInterval(function () {
	if (PLAY) {
		update();
		draw();
	} else {
		draw();
	}
}, 10);