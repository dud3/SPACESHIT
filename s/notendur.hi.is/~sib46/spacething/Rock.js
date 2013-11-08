// ====
// ROCK
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

function Rock(descr) {
	for (var property in descr) {
        this[property] = descr[property];
    }

    // TODO: Implement this

    // NB: Set our `cx` and `cy` values to random positions on the canvas
    //     `g_canvas`, and its properties, are available to you here.

    // Rock randomisation
    this.cx = util.randRange(0, g_canvas.width); // -
    this.cy = util.randRange(0, g_canvas.height); // -
    this.rotation = 0;


    var MIN_SPEED = 20,
        MAX_SPEED = 70;

    // Set the velocity so that the rock has a random direction,
    // and a speed between the MIN and MAX as defined above.
    //
    // The SPEED vals are expressed in pixels per SECOND.
    // ...but `du` will be in "nominals", of course...
    // ...use SECS_TO_NOMINALS (from "globals.js") to convert.
    //
    // Yes, this needs a bit of Math.
    // Also, the `util` module can help you.
    //
    // Some helper vars (e.g. `speed` and `dirn` might be good to have)
    //
    
    // Generate a random sign for the velocity and rotation
    var _randVX = ( Math.round(Math.random()) == 0 ? -1 : 1 );
    var _randVY = ( Math.round(Math.random()) == 0 ? -1 : 1 );
    var _randVR = ( Math.round(Math.random()) == 0 ? -1 : 1 );
    
    this.velX = (util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS) * _randVX; // CHANGE THIS
    this.velY = (util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS) * _randVY; // CHANGE THIS


    var MIN_ROT_SPEED = 0.5,
        MAX_ROT_SPEED = 2.5;

    // Set the rotational velocity between the MIN and MAX above.
    // (Again, these are expressed in pixels per second).

    this.velRot = (util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS) * _randVR; 
	// this.velRot = util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED); // * _randVR; // anything above 0.1 is a recipe for epilepsy tbh

}

Rock.prototype.collision = function () {
	if (this.cx < 0 || this.cx > g_canvas.width) { this.velX *= -1; }
	
};

Rock.prototype.getRot = function () {
	return "velRot: " + this.velRot;
};

Rock.prototype.update = function (du) {
    
    // I DID THIS BIT FOR YOU. NICE, AREN'T I?

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.rotation += this.velRot * du;
    this.rotation = util.wrapRange(this.rotation,
				   0, consts.FULL_CIRCLE);

    this.wrapPosition();
};

Rock.prototype.setPos = function (cx, cy) {
    this.cx = cx;
    this.cy = cy;
}

Rock.prototype.getPos = function () {
    return {posX : this.cx, posY : this.cy};
}

Rock.prototype.wrapPosition = function () {
    this.cx = util.wrapRange(this.cx, 0, g_canvas.width);
    this.cy = util.wrapRange(this.cy, 0, g_canvas.height);
};

Rock.prototype.render = function (ctx) {

    g_sprites.rock.drawWrappedCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );

};
