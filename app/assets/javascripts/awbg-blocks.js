/** 
Copyright 2018 Alexander Vega Jiménez

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict'
function awbgblocks (widthInBlocks) {

var awbgc = document.getElementById('awbg-canvas');
var ctx = awbgc.getContext('2d');
var widthInBlocks = widthInBlocks;
    
var b_size = 20; // Block size in canvas pixels.
var lineWidth = b_size/4;
var effectRefreshRate = 40;


var SHAPE_TYPES = { 
    "_reserved" : [] // Don't use or remove.
};

///////////////////////////////////////////////////////////////////////////////
//                                 CLASSES                                   //
///////////////////////////////////////////////////////////////////////////////

/**
 * @class Shape - Represents a shape made with blocks.
 * @param String type Key to use in SHAPE_TYPES to get the blocks coords.
 * @param Object pos The x and y position of the shape. Example {'x':3,'y':5}
 * @param String color A color definition in any valid format.
 */
var Shape = function(type, pos, color) {
    this.blocks = type in SHAPE_TYPES ? SHAPE_TYPES[type] : [];
    this.color = color;
    this.position = pos;
}

Shape.prototype.draw = function (ctx) {
    for (var i = 0; i < this.blocks.length; i++) {
        drawBlock(
            this.position.x + this.blocks[i][0],
            this.position.y + this.blocks[i][1],
            this.color
        );
    }
};

Shape.prototype.move = function (x, y) {
    this.position.x += x;
    this.position.y += y;
};

Shape.prototype.addBlock = function (block) {
    this.blocks.push(block);
}


/**
 * @class ShapesManager - Container/interface to manipulate shapes.
 */
var ShapesManager = function () {
    this._shapes = [];
    this._granulatedBuffer = [];
}


ShapesManager.prototype._granulatedLoop = function () {
    for (var i = this._granulatedBuffer.length-1; i >= 0; i--) {
        var spawningShape = this._granulatedBuffer[i];
        var blocksToSpawn = spawningShape.blocks;
        var nextBlock = Math.floor(randomBetween(0, blocksToSpawn.length));
        
        spawningShape.shape.addBlock(blocksToSpawn[nextBlock]);
        blocksToSpawn.splice(nextBlock,1);
        
        if (blocksToSpawn.length == 0) {
            this._granulatedBuffer.splice(i,1);
        }
    }
    var that = this;
    setTimeout(function() { that.draw(); }, effectRefreshRate);
};

ShapesManager.prototype.removeAllShapes = function () { this._shapes = []; };
ShapesManager.prototype.newShape = function(type, pos, color, spawnType) {
    var s = new Shape(type, pos, color);

    if (spawnType == SpawnType.GRANULATED) {
        s = new Shape('', pos, color);
        this._granulatedBuffer.push ({'shape': s, 'blocks' : SHAPE_TYPES[type].slice()});
    }

    this._shapes.push(s);
}

ShapesManager.prototype.moveAllShapes = function (x, y) {
    for (var i = 0; i < this._shapes.length; i++) {
        this._shapes[i].move(x, y);
    }
}

ShapesManager.prototype.draw = function () {
    for (var i = 0; i < this._shapes.length; i++) {
        this._shapes[i].draw();
    }
    
    if ( this._granulatedBuffer.length != 0 ) {
        this._granulatedLoop();
    }
}

ShapesManager.prototype.removePassedBlock = function (limit, direction) {
    // TO DO: more clean, less code: another approach.
    switch (direction) {    
        case Direction.NORTH:
            for (var i = this._shapes.length-1; i >= 0; i--) {
                if (this._shapes[i].position.y < limit) {
                    this._shapes.splice(i, 1);
                }
            }
            break;
        case Direction.EAST:
            for (var i = this._shapes.length-1; i >= 0; i--) {
                if (this._shapes[i].position.x > limit) {
                    this._shapes.splice(i, 1);
                }
            }
            break;
        case Direction.SOUTH:
            for (var i = this._shapes.length-1; i >= 0; i--) {
                if (this._shapes[i].position.y > limit) {
                    this._shapes.splice(i, 1);
                }
            }
            break;
        case Direction.WEST:
            for (var i = this._shapes.length-1; i >= 0; i--) {
                if (this._shapes[i].position.x < limit) {
                    this._shapes.splice(i, 1);
                }
            }
    }    
}

ShapesManager.prototype.removePassed = function (limit, direction) {
    this.removePassedBlock(limit / b_size, direction);
}

///////////////////////////////////////////////////////////////////////////
//   Core                                                                //
///////////////////////////////////////////////////////////////////////////
const Direction = { NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3 };
const SpawnType = { NORMAL: 0, FADE: 1, GRANULATED: 2};

var addShapeType = function (name, blocks) {
    SHAPE_TYPES[name] = blocks;
}

var drawBlock = function(x, y, color) {
    x = x * b_size;
    y = y * b_size;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, b_size, b_size);
    ctx.strokeStyle = '#0008';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.rect(x + lineWidth/2, y + lineWidth/2, b_size - lineWidth, b_size - lineWidth);
    ctx.stroke();
    ctx.closePath();
};

var clear = function() {
    ctx.clearRect(0,0,awbgc.width, awbgc.height);
}
var clearBlocks = function(from, to) {
    ctx.clearRect(from.x * b_size, from.y * b_size, to.x * b_size, to.y * b_size);
}
    
var setBlockSize = function(newSize) { 
    b_size = newSize; 
    lineWidth = newSize / 4;
}
var setEffectRefreshRate = function (newRate) { 
    effectRefreshRate = newRate; }

var setBlockSizeBasedInWidth = function() {
    setBlockSize( awbgc.width / widthInBlocks );
}    

var getBlockSize = function() {
    return b_size;
}
var resizeCanvas = function () {
    awbgc.width = window.innerWidth;
    awbgc.height = window.innerHeight;
    setBlockSizeBasedInWidth(widthInBlocks);
}
var moveCanvas = function(from, x, y) {
    var imageData = ctx.getImageData(from.x, from.y, awbgc.width, awbgc.height);
    clear();
    ctx.putImageData(imageData, x, y);
}

var setWidthInBlocks = function (newWidthInBlocks) { 
    this.widthInBlocks = newWidthInBlocks;
}

// Event listener to adjust canvas when resize.
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();
    // public members
    return {
        // Enums
        Direction : Direction,
        SpawnType : SpawnType,
        // Classes
        ShapesManager : ShapesManager,
        // Module configuration
        setBlockSize : setBlockSize,
        setWidthInBlocks : setWidthInBlocks,
        setEffectRefreshRate : setEffectRefreshRate,
        getBlockSize : getBlockSize,
        addShapeType : addShapeType,
        // Core members
        canvas : awbgc,
        clear : clear,
        clearBlocks : clearBlocks,
        // Utils
        moveCanvas : moveCanvas
    }
}