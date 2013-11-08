// Asteriods
// Copyright Chris Giles

// Variables and enumerations

var canvas, context, ship, rocks, bullets, particles, keys, stars, time, level, score, cooldown, state, stateChangeTime;

var ObjectType = {
	Ship : 0,
	Asteroid : 1,
	Bullet : 2,
	Particle : 3
};

var GameState = {
	Title : 0,
	LevelStarting : 1,
	Playing : 2,
	GameOver : 3
};

// Utility functions

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function pointInPolygon(vertx, verty, testx, testy) {
	var i, j, c = false;
	for (i = 0, j = vertx.length - 1; i < vertx.length; j = i++) {
		if ( ((verty[i] > testy) != (verty[j] > testy)) && 
			(testx < (vertx[j] - vertx[i]) * (testy - verty[i]) / (verty[j] - verty[i]) + vertx[i]) ) {
			c = !c;
		}
	}
	return c;
}

function transformPolygon(vertxIn, vertyIn, vertxOut, vertyOut, tx, ty, rotation) {
	var cosR = Math.cos(rotation);
	var sinR = Math.sin(rotation);
	for (i = 0; i < vertxIn.length; i++) {
		vertxOut[i] = vertxIn[i] * cosR - vertyIn[i] * sinR + tx;
		vertyOut[i] = vertxIn[i] * sinR + vertyIn[i] * cosR + ty;
	}
}

// Drawing functions

function drawObjectAt(obj, x, y) {
    context.translate(x, y);
    context.rotate(obj.rotation);
    context.beginPath();
    context.moveTo(obj.polygonX[0], obj.polygonY[0]);
    for (i = 1; i < obj.polygonX.length; i++) {
        context.lineTo(obj.polygonX[i], obj.polygonY[i]);
    }
    context.closePath();
    context.lineWidth = 1.5;
    context.fillStyle = obj.fillColor;
    context.fill();
    context.strokeStyle = obj.strokeColor;
    context.stroke();
    context.rotate(-obj.rotation);
    context.translate(-x, -y);
}

function drawObject(obj) {
    if (obj == null)
        return;

    drawObjectAt(obj, obj.x, obj.y);
    if (obj.x > canvas.width / 2) {
        drawObjectAt(obj, obj.x - canvas.width, obj.y);
        if (obj.y > canvas.height / 2) {
            drawObjectAt(obj, obj.x - canvas.width, obj.y - canvas.height);
            drawObjectAt(obj, obj.x, obj.y - canvas.height);
        }
        else {
            drawObjectAt(obj, obj.x - canvas.width, obj.y + canvas.height);
            drawObjectAt(obj, obj.x, obj.y + canvas.height);
        }
    }
    else {
        drawObjectAt(obj, obj.x + canvas.width, obj.y);
        if (obj.y > canvas.height / 2) {
            drawObjectAt(obj, obj.x + canvas.width, obj.y - canvas.height);
            drawObjectAt(obj, obj.x, obj.y - canvas.height);
        }
        else {
            drawObjectAt(obj, obj.x + canvas.width, obj.y + canvas.height);
            drawObjectAt(obj, obj.x, obj.y + canvas.height);
        }
    }
}

function drawStars() {
    for (i = 0; i < stars.length; i++) {
        context.globalAlpha = 1 - Math.pow(Math.abs(Math.sin(time * 0.05 + stars[i].r * 100)), 4) * 0.5;
        context.beginPath();
        context.arc(stars[i].x, stars[i].y, stars[i].r, 0, 2 * Math.PI, false);
        context.fillStyle = "#FFFFFF";
        context.fill();
    }
    context.globalAlpha = 1;
}

function drawText() {
    context.font = "20px Arial";
    context.lineWidth = 1.0;
    context.fillStyle = "#FFFFFF";
    context.strokeStyle = "#00FF00";

	context.font = "30px Arial";
	
    if (state == GameState.Title) {
		var text = "Press space to play";
        var textWidth = context.measureText(text).width;
        context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
        context.strokeText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
    }
	else if (state == GameState.LevelStarting) {
		var text = "Level " + level;
        var textWidth = context.measureText(text).width;
        context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
        context.strokeText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
	}
	else if (state == GameState.GameOver) {
		var text = "Good job, you're dead.";
        var textWidth = context.measureText(text).width;
        context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
        context.strokeText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
		
		text = "Score: " + score;
        textWidth = context.measureText(text).width;
        context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2 + 42, textWidth);
        context.strokeText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2 + 42, textWidth);
	}
}

// Object update functions

function integrateObject(obj) {
    if (obj == null)
        return;

    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.rotation += obj.va;

    if (obj.x > canvas.width)
        obj.x = 0;
    else if (obj.x < 0)
        obj.x = canvas.width;

    if (obj.y > canvas.height)
        obj.y = 0;
    else if (obj.y < 0)
        obj.y = canvas.height;
}

function collideObject(obj1, obj2) {
	var x1 = new Array(), y1 = new Array(), x2 = new Array(), y2 = new Array();
	transformPolygon(obj1.polygonX, obj1.polygonY, x1, y1, obj1.x, obj1.y, obj1.rotation);
	transformPolygon(obj2.polygonX, obj2.polygonY, x2, y2, obj2.x, obj2.y, obj2.rotation);
	
	for (i = 0; i < x1.length; i++) {
		if (pointInPolygon(x2, y2, x1[i], y1[i])) {
			return true;
		}
	}
	
	for (i = 0; i < x2.length; i++) {
		if (pointInPolygon(x1, y1, x2[i], y2[i])) {
			return true;
		}
	}
	
	return false;
}

// Object creation functions

function buildAsteroid(x, y, vx, vy, va, radius) {
    var a = new Object();
	a.type = ObjectType.Asteroid;
    a.radius = radius;
    a.x = x;
    a.y = y;
    a.vx = vx;
    a.vy = vy;
    a.va = va;
    a.rotation = 0;
    a.strokeColor = "#707070";
    a.fillColor = "#404040";
    a.polygonX = new Array();
    a.polygonY = new Array();

    var i = 0;
    for (var t = 0; t < Math.PI * 2; t += Math.random() * Math.PI / 2) {
        var r = Math.random() * radius / 2 + radius / 2;
        a.polygonX[i] = Math.cos(t) * r;
        a.polygonY[i] = Math.sin(t) * r;
        i++;
    }

    return a;
}

function buildShip() {
    var s = new Object();
	s.type = ObjectType.Ship;
    s.x = canvas.width / 2;
    s.y = canvas.height / 2;
    s.vx = 0;
    s.vy = 0;
    s.va = 0;
    s.rotation = 0;
    s.strokeColor = "#00FF00";
    s.fillColor = "#009000";
    s.polygonX = new Array();
    s.polygonY = new Array();
    s.polygonX[0] = -10; s.polygonY[0] = -5;
    s.polygonX[1] = 10;  s.polygonY[1] = 0;
    s.polygonX[2] = -10; s.polygonY[2] = 5;
    return s;
}

function buildBullet(x, y, vx, vy) {
	var b = new Object();
	b.type = ObjectType.Bullet;
	b.x = x;
	b.y = y;
	b.vx = vx;
	b.vy = vy;
	b.va = 0;
	b.rotation = 0;
    b.strokeColor = "#00FF00";
    b.fillColor = "#009000";
	b.timeToLive = 75;
    b.polygonX = new Array();
    b.polygonY = new Array();
    b.polygonX[0] = -1; b.polygonY[0] = -1;
    b.polygonX[1] = 1;  b.polygonY[1] = -1;
	b.polygonX[2] = 1;  b.polygonY[2] = 1;
	b.polygonX[3] = -1; b.polygonY[3] = 1;
	return b;
}

function buildParticle(x, y, vx, vy, va, radius, strokeColor, fillColor, line, dalpha) {
	var p = new Object();
	p.type = ObjectType.Particle;
	p.x = x;
	p.y = y;
	p.vx = vx;
	p.vy = vy;
	p.va = va;
	p.rotation = 0;
	p.strokeColor = strokeColor;
    p.fillColor = fillColor;
    p.polygonX = new Array();
    p.polygonY = new Array();
	p.alpha = 1;
	p.dalpha = dalpha;

	if (!line) {
		var i = 0;
		for (var t = 0; t < Math.PI * 2; t += Math.random() * Math.PI / 4) {
			var r = Math.random() * radius / 2 + radius / 2;
			p.polygonX[i] = Math.cos(t) * r;
			p.polygonY[i] = Math.sin(t) * r;
			i++;
		}
	}
	else {
		var rot = Math.random() * Math.PI;
		var wid = Math.random() * radius;
		p.polygonX[0] = Math.cos(rot) * wid;
		p.polygonY[0] = Math.sin(rot) * wid;
		p.polygonX[1] = Math.cos(rot) * -wid;
		p.polygonY[1] = Math.sin(rot) * -wid;
	}

    return p;
}

// Main game functions

function initLevel() {
    time = 0;
    cooldown = 0;
	
    if (state == GameState.Title)
        ship = null;
    else
        ship = buildShip();

    rocks = new Array();
    for (var i = 0; i < Math.min(Math.max(3, level), 8); i++) {
        var x = Math.random() * canvas.width / 4;
        if (x > canvas.width / 8)
            x += canvas.width / 8;
        var y = Math.random() * canvas.height / 4;
        if (y > canvas.height / 8)
            y += canvas.height / 8;
        var vx = Math.random() * Math.min(level + 1, 5) / 3 - Math.min(level + 1, 5) / 6;
        var vy = Math.random() * Math.min(level + 1, 5) / 3 - Math.min(level + 1, 5) / 6;
        var va = Math.random() * Math.min(level + 1, 5) / 30 - Math.min(level + 1, 5) / 60;
        rocks[i] = buildAsteroid(x, y, vx, vy, va, Math.random() * 30 + 30);
    }

    bullets = new Array();
	particles = new Array();
	
    stars = new Array();
    for (var i = 0; i < 100; i++) {
        stars[i] = new Object();
        stars[i].x = Math.random() * canvas.width;
        stars[i].y = Math.random() * canvas.height;
        stars[i].r = Math.random() * 2;
    }
}

function update() {

	if (state == GameState.Title) {
	    if (keys[32]) {
			score = 0;
            level = 1;
            initLevel();
			keys[32] = false;
			state = GameState.LevelStarting;
			stateChangeTime = time + 150;
        }
	}
	else if (state == GameState.LevelStarting) {
		if (time >= stateChangeTime) {
			initLevel();
			state = GameState.Playing;
			stateChangeTime = time + 10000000;
		}
	}
	else if (state == GameState.GameOver) {
		if (time >= stateChangeTime) {
			state = GameState.Title;
		}
	}
	else {
		var turnSpeed = 0.05;
		var moveSpeed = 0.05;

		if (keys[37])
			ship.rotation -= turnSpeed;
		if (keys[39])
			ship.rotation += turnSpeed;
		if (keys[38]) {
			ship.vx += Math.cos(ship.rotation) * moveSpeed;
			ship.vy += Math.sin(ship.rotation) * moveSpeed;
			
			for (var i = 0; i < 3; i++) {
				var dir = ship.rotation + Math.random() * Math.PI / 2 - Math.PI / 4;
				var speed = -(0.75 + Math.random() * 0.75);
				var vx = Math.cos(dir) * speed + ship.vx, vy = Math.sin(dir) * speed + ship.vy;
				particles[particles.length] = buildParticle(ship.x - Math.cos(ship.rotation) * 8, 
					ship.y - Math.sin(ship.rotation) * 8, vx, vy, ship.va, 
					Math.random() * 8, "rgb(255, 0, 0)", "rgb(165, 45, 45)", false, 0.05);
			}
		}
		if (keys[32] && cooldown <= 0) {
			var vx = Math.cos(ship.rotation) * 4 + ship.vx;
			var vy = Math.sin(ship.rotation) * 4 + ship.vy;
			var b = buildBullet(ship.x, ship.y, vx, vy);
			bullets[bullets.length] = b;
			cooldown = 25;
		}
	}

	integrateObject(ship);
	
	for (var i = 0; i < rocks.length; i++) {
		integrateObject(rocks[i]);
		
		if (ship != null && collideObject(ship, rocks[i])) {
		
			for (var i = 0; i < 16; i++) {
				var dir = ship.rotation + Math.random() * Math.PI * 2;
				var speed = -1 + Math.random() * 2;
				var vx = Math.cos(dir) * speed - ship.vx * 0.5, vy = Math.sin(dir) * speed - ship.vy * 0.5;
				particles[particles.length] = buildParticle(ship.x - Math.cos(ship.rotation) * 8, 
					ship.y - Math.sin(ship.rotation) * 8, vx, vy, -0.1 + Math.random() * 0.2, 
					4 + Math.random() * 12, "rgb(0, 255, 0)", "rgb(0, 150, 0)", true, 0.01);
			}
		
			ship = null;
			state = GameState.GameOver;
			stateChangeTime = time + 300;
			level = 0;
		}
	}
	
	for (var i = 0; i < particles.length; i++) {
		integrateObject(particles[i]);
		particles[i].alpha -= particles[i].dalpha;
		
		if (particles[i].alpha < 0.05) {
			particles.remove(i--);
			continue;
		}
	}
	
	for (var i = 0; i < bullets.length; i++) {
		integrateObject(bullets[i]);
		bullets[i].timeToLive -= 1;
		
		if (bullets[i].timeToLive <= 0) {
			bullets.remove(i--);
			continue;
		}
			
		for (var j = 0; j < rocks.length; j++) {
			if (collideObject(bullets[i], rocks[j])) {
				var oldRock = rocks[j];
			
				bullets.remove(i--);
				rocks.remove(j);
				
				for (var i = 0; i < 6; i++) {
					var dir = Math.random() * Math.PI * 2;
					var speed = -(0.5 + Math.random() * 0.5);
					var vx = Math.cos(dir) * speed + oldRock.vx, vy = Math.sin(dir) * speed + oldRock.vy;
					particles[particles.length] = buildParticle(oldRock.x - Math.cos(dir) * Math.random() * oldRock.radius * 0.5, 
						oldRock.y - Math.sin(dir) * Math.random() * oldRock.radius * 0.5, vx, vy, oldRock.va, 
						8 + oldRock.radius * 0.15 * Math.random(), "#707070", "#404040", false, 0.025);
				}
				
				for (var i = 0; i < 12; i++) {
					var dir = Math.random() * Math.PI * 2;
					var speed = -(0.5 + Math.random() * 0.5);
					var vx = Math.cos(dir) * speed + oldRock.vx, vy = Math.sin(dir) * speed + oldRock.vy;
					particles[particles.length] = buildParticle(oldRock.x - Math.cos(dir) * Math.random() * oldRock.radius * 0.5, 
						oldRock.y - Math.sin(dir) * Math.random() * oldRock.radius * 0.5, vx, vy, oldRock.va, 
						8 + oldRock.radius * 0.5 * Math.random(), "#707070", "#404040", true, 0.025);
				}
				
				if (oldRock.radius >= 30) {
					var numSplit = Math.floor(Math.random() * 2) + 2;
					for (var k = 0; k < numSplit; k++) {
						var dir = Math.atan2(oldRock.vy, oldRock.vx) + Math.random() * Math.PI / 2 - Math.PI / 4;
						var speed = Math.sqrt(oldRock.vx * oldRock.vx + oldRock.vy * oldRock.vy) * (0.75 + Math.random() * 0.5);
						var x = oldRock.x + Math.cos(dir) * Math.random() * oldRock.radius * 0.5;
						var y = oldRock.y + Math.sin(dir) * Math.random() * oldRock.radius * 0.5;
						var vx = Math.cos(dir) * speed, vy = Math.sin(dir) * speed;
						var va = oldRock.va + Math.random() * oldRock.va * 0.5 - oldRock.va * 0.25;
						rocks[rocks.length] = buildAsteroid(x, y, vx, vy, va, oldRock.radius / numSplit);
					}
				}
				
				if (rocks.length == 0)
					stateChangeTime = time + 50;
				
				score += 1;
				
				break;
			}
		}
	}
	
	if (time >= stateChangeTime) {
		level += 1;
		state = GameState.LevelStarting;
		stateChangeTime = time + 150;
	}

    context.clearRect(0, 0, canvas.width, canvas.height);
	
    drawStars();
	
	for (var i = 0; i < particles.length; i++) {
		context.globalAlpha = particles[i].alpha;
		drawObject(particles[i]);
	}
	context.globalAlpha = 1;
	
    drawObject(ship);
    for (var i = 0; i < rocks.length; i++)
        drawObject(rocks[i]);
	for (var i = 0; i < bullets.length; i++)
		drawObject(bullets[i]);
	
    drawText();

    time += 1;
	cooldown -= 1;
}

window.onload = function () {
    canvas = document.getElementById("mainCanvas");
    context = canvas.getContext("2d");

    keys = new Array();
    for (var i = 0; i < 256; i++)
        keys[i] = false;

    document.onkeydown = function (event) {
        if (event.charCode) {
            keys[event.charCode] = true;
			if ((event.charCode >= 37 && event.charCode <= 40) || event.charCode == 32)
				event.preventDefault();
		}
        else {
            keys[event.keyCode] = true;
			if ((event.keyCode >= 37 && event.keyCode <= 40) || event.keyCode == 32)
				event.preventDefault();
		}
    }

    document.onkeyup = function (event) {
        if (event.charCode)
            keys[event.charCode] = false;
        else
            keys[event.keyCode] = false;
    }

    score = 0;
    level = 0;
    state = GameState.Title;
    initLevel();

    setInterval(update, 16);
};