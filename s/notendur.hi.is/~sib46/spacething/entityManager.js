/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA

_rocks   : [],
_bullets : [],
_ships   : [],
_radar   : 0,

_bShowRocks : false,
_emLastDuVal : 0,
// "PRIVATE" METHODS

_generateRocks : function() {
    var i, _vx, _vy,
    NUM_ROCKS = 4;

    // TODO: Make `NUM_ROCKS` Rocks!
    for (var i = 0; i < NUM_ROCKS; i++) {
        this._rocks.push( new Rock() );
    }
},


_findNearestShip : function(posX, posY) {

   var min_index = 0;
    var min_value;
    var chk;
    for (var i = 0; i < this._ships.length; i++) {
        if (i == 0) { min_value = this._ships[i].getDelta(posX, posY); }
        else {
            chk = this._ships[i].getDelta(posX, posY);
            if (chk < min_value) {
                min_index = i;
                min_value = chk;
            }
        }
    }
    return {
    theShip : this._ships[min_index],   // the object itself
    theIndex: min_index   // the array index where it lives
    };
    
},

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//

// Generate some rocks
getRockPositions : function () {
    var _rpos = new Array(this._rocks.length);
    for (var i = 0; i < this._rocks.length; i++) {
        _rpos.push( this._rocks[i].getPos() );
    }
    return _rpos;
},

// Check if the collide
checkCollRocks : function () {
    var _arrRocks = new Array(this._rocks.length);
    for (var i = 0; i < this._rocks.length; i++) {
        _arrRocks.push(this._rocks[i].getPos());
    }
    
    
},

getShipPositions : function () {
    var _spos = new Array(this._ships.length);
    for (var i = 0; i < this._ships.length; i++) {
        _spos.push( this._ships[i].getPos() );
    }
    return _spos;
},

// Wrapper to call object functions inside entityManager arrays
queryObjectCall : function () {
    return this._rocks[0].getRot();
},

deferredSetup : function () {
    this._categories = [this._rocks, this._bullets, this._ships];
},

init: function() {
    this._generateRocks();

    // I could have made some ships here too, but decided not to.

},

// Puush the objects into the array
fireBullet: function(x, y, vX, vY, rot) {
    this._bullets.push(new Bullet( { cx : x, cy : y, velX : vX,
                                     velY : vY, rotation : rot  } ));
},

// Same as above
generateShip : function(descr) {
    this._ships.push(new Ship(descr));
},

killNearestShip : function(xPos, yPos) {
    // TODO: Implement this
    // console.log("kns called: x = " + xPos + " y = " + yPos);
    var r = this._findNearestShip(xPos, yPos);
    this._ships.splice(r.theIndex, 1);
    //console.log("should kill ship[" + min_index + "]");

    // NB: Don't forget the "edge cases"
},

yoinkNearestShip : function(xPos, yPos) {
    // TODO: Implement this
    var r = this._findNearestShip(xPos, yPos);
    r.theShip.setPos(xPos, yPos);

    // NB: Don't forget the "edge cases"
},

resetShips: function() {
    this._forEachOf(this._ships, Ship.prototype.reset);
},

haltShips: function() {
    this._forEachOf(this._ships, Ship.prototype.halt);
},  

toggleRocks: function() {
    this._bShowRocks = !this._bShowRocks;
},
fetchDu : function() {
    return this._emLastDuVal;
},



update: function(du) {

    // TODO: Implement this
    this._emLastDuVal = du;
    var _ret;
    if (this._bShowRocks) {
        for (var i = 0; i < this._rocks.length; i++) {
            this._rocks[i].update(du);
        }
    }
    
    for (var i = 0; i < this._ships.length; i++) {
        this._ships[i].update(du);
    }
    
    for (var i = 0; i < this._bullets.length; i++) {
        //console.log("em bullet update");
        _ret = this._bullets[i].update(du);
        if (_ret == this.KILL_ME_NOW) {
            //console.log("bullet should die");
            this._bullets.splice(i, 1);
        }
    }
},

render: function(ctx) {

    // TODO: Implement this
    for (var i = 0; i < this._rocks.length; i++) {
        this._rocks[i].render(ctx);
    }
    
    for (var i = 0; i < this._ships.length; i++) {
        this._ships[i].render(ctx);
    }
    
    for (var i = 0; i < this._bullets.length; i++) {
        this._bullets[i].render(ctx);
    }

    // NB: Remember to implement the ._bShowRocks toggle!
    // (Either here, or if you prefer, in the Rock objects)

}

};

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

entityManager.init();
