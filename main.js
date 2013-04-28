"use strict";
var canvas = null;
var gl = null;

function start() {
	canvas = document.createElement("canvas");
	var dimensions = pageSize();
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	document.body.appendChild( canvas );
	
	canvas.addEventListener( "mousedown", onMouseDown );
	canvas.addEventListener( "mouseup", onMouseUp );
	canvas.addEventListener( "mousewheel", onMouseWheel );

	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch(e) {}

	if (!gl) {
		throw new Error("Unable to initialize WebGL. Your browser may not support it.");
	}
   
	gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
	gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
	gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

	window.onresize = onResize;
	
	initShaders();
	
	initBuffers();
	
	drawScene();
}

var theta = 0.6;
var thetaVelocity = -0.01;
var phi = 0.4;
var phiVelocity = 0;
var rho = 1;
var mouseDownX, mouseDownY, mouseDownTheta, mouseDownPhi, lastMouseTime;
var inertialMovement = false;
function onMouseDown(e){
	inertialMovement = false;
	
	mouseDownX = e.screenX;
	mouseDownY = e.screenY;
	mouseDownTheta = theta;
	mouseDownPhi = phi;
	canvas.addEventListener( "mousemove", onMouseMove );
}

function onMouseUp(e){
	inertialMovement = true;
	canvas.removeEventListener( "mousemove", onMouseMove );
	
	var deltaTime = Date.now() - lastMouseTime;
}

function onMouseMove(e){
	var deltaX = e.screenX - mouseDownX;
	var deltaY = e.screenY - mouseDownY;

	var newTheta = mouseDownTheta + deltaX*3*2*Math.PI/(canvas.width);
	var newPhi = Math.min(Math.PI/2, Math.max(-Math.PI/2, mouseDownPhi + deltaY*5*Math.PI/(canvas.height)));
	var curTime = Date.now();
	phiVelocity = (newPhi - phi)/(curTime - lastMouseTime);
	thetaVelocity = (newTheta - theta)/(curTime - lastMouseTime);


	lastMouseTime = curTime;
	theta = newTheta;
	phi = newPhi;
}

function onMouseWheel(e){
	console.log( rho );
	rho = Math.max(0.5, rho + e.wheelDelta/1000);
}

function onResize(){
	var dimensions = pageSize();
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	
	gl.viewport(0, 0, canvas.width, canvas.height);
}

var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		throw new Error("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgram);

	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	
	vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(vertexColorAttribute);
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	var theSource = "";
	var currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == 3) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, theSource);
	gl.compileShader(shader);
  
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

/*
var terrainVerticesBuffer;
var terrainVerticesColorBuffer;
var terrainIndexBuffer;
var terrain;
*/

var chunks = [];

var NUM_X_TILES = 1;
var NUM_Y_TILES = 1;

function initBuffers() {
	var mersenneTwister = new MersenneTwister();
		
	// Terrain
	for( var x = 0; x < NUM_X_TILES; x++ ){
		chunks[x] = [];
		for( var y = 0; y < NUM_Y_TILES; y++ ){
			var terrain = new Triangulation(mersenneTwister);
			chunks[x][y] = {
				'terrain': terrain,
				'vertexBuffer': gl.createBuffer(),
				'vertexColorBuffer': gl.createBuffer(),
				'indexBuffer': gl.createBuffer(),
				'vertexCount': 0,
				'indexCount': 0
			};
			generateTile( mersenneTwister, terrain, x, y );
			
			gl.bindBuffer(gl.ARRAY_BUFFER, chunks[x][y].vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, terrain.exportVertices(), gl.STATIC_DRAW);
			chunks[x][y].vertexCount = terrain.points.length;
			
			// Terrain Color
			gl.bindBuffer(gl.ARRAY_BUFFER, chunks[x][y].vertexColorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, terrain.exportVertexColors(), gl.STATIC_DRAW);

			// Indices
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunks[x][y].indexBuffer);
			var indices = terrain.exportIndexBuffer();
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
			chunks[x][y].indexCount = indices.length;
		}
	}
}

var HORIZONTAL = 0;
var VERTICAL = 1;
function getSeedForEdge(tileX, tileY, dir){
	switch(dir){
	case 0:
		return (1 << 31) ^ ((tileX & 0xFFFF) | (tileY << 16));
	case 1:
		return (tileX & 0xFFFF) | ((0x7FFF & tileY) << 16);
	default:
		throw new Error("unknown direction");
	}
}
function getSeedForCorner(tileX, tileY){
	return ((tileY & 0xFFFF) | (tileX << 16));
}
function getSeedForInterior(tileX, tileY){ return ( (tileX << 3) ^ (tileX >>> 3) ) ^ ( (tileY << 5 ) ^ (tileY >>> 5 ) ); }

function generateEdge(mersenneTwister, terrain, tileX, tileY, dir, offset){
	mersenneTwister.init_genrand( getSeedForEdge(tileX, tileY, dir) );
	
	for( var i = 0; i < 6; i++ ){
		var numSegments = Math.pow(2, i);
		for( var j = 0; j < numSegments; j++ ){
			var temp = (j + (j+1))/(2*numSegments);
			if( dir === HORIZONTAL ){
				terrain.addPoint( temp, offset );
			}else if( dir === VERTICAL ){
				terrain.addPoint( offset, temp );
			}
		}
	}
}

var GRID = 1;
function generateTile(mersenneTwister, terrain, tileX, tileY){
	
	mersenneTwister.init_genrand( getSeedForCorner(tileX, tileY) );
	terrain.addPoint(0.0, 0.0, 0);
	
	mersenneTwister.init_genrand( getSeedForCorner(tileX+1, tileY) );
	terrain.addPoint(1.0, 0.0, 0);

	mersenneTwister.init_genrand( getSeedForCorner(tileX+1, tileY+1) );
	terrain.addPoint(1.0, 1.0, 0);
	
	mersenneTwister.init_genrand( getSeedForCorner(tileX, tileY+1) );
	terrain.addPoint(0.0, 1.0, 0);
	
	/*
	for( var x = 0; x <= GRID; x++ ){
		for( var y = 0; y <= GRID; y++ ){
			mersenneTwister.init_genrand( getSeedForCorner(x, y) );
			terrain.addPoint(x/GRID, y/GRID, 0);
		}
	}
	*/
	
	for( var x = 0; x < GRID; x++ ){
		for( var y = 0; y < GRID; y++ ){
			mersenneTwister.init_genrand( getSeedForCorner(x, y) );
			for( var i = 0; i < 10000; i++ ){
				terrain.addPoint((x+mersenneTwister.random())/GRID, (y+mersenneTwister.random())/GRID);
			}
		}
	}

/*
	generateEdge(mersenneTwister, terrain, tileX, tileY, HORIZONTAL, 0);
	generateEdge(mersenneTwister, terrain, tileX, tileY, VERTICAL, 0);
	generateEdge(mersenneTwister, terrain, tileX, tileY+1, HORIZONTAL, 1);
	generateEdge(mersenneTwister, terrain, tileX+1, tileY, VERTICAL, 1);
*/
	// Interior Points
	mersenneTwister.init_genrand( getSeedForInterior(tileX, tileY) );
	
	
}

var THETA_FRICTION = 0.005;
var PHI_FRICTION = 0.01;
var lastUpdateTime = Date.now();
function update(){
	var curTime = Date.now();
	var deltaTime = curTime - lastUpdateTime;
	lastUpdateTime = curTime;
	
	if( inertialMovement ){
		theta += thetaVelocity*deltaTime;
		
		if( thetaVelocity > 0 ){
			thetaVelocity = Math.max(0, thetaVelocity - THETA_FRICTION*deltaTime*thetaVelocity);
		}else if( thetaVelocity < 0 ){
			thetaVelocity = Math.min(0, thetaVelocity - THETA_FRICTION*deltaTime*thetaVelocity);
		}
		
		phi += phiVelocity*deltaTime;
		
		if( phi > Math.PI/2 ){
			phi = Math.PI/2;
			phiVelocity = 0;
		}else if( phi < -Math.PI/2 ){
			phi = -Math.PI/2;
			phiVelocity = 0;
		}
		
		if( phiVelocity > 0 ){
			phiVelocity = Math.max(0, phiVelocity - PHI_FRICTION*deltaTime*phiVelocity);
		}else if( phiVelocity < 0 ){
			phiVelocity = Math.min(0, phiVelocity - PHI_FRICTION*deltaTime*phiVelocity);
		}
		
	}
}

function drawScene() {
	update();
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Update values for perspective and model-view matrices
	var perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, 1000);
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
	
	var phiRotationMatrix = Matrix.Rotation(phi, $V([1, 0, 0])).ensure4x4();
	var thetaRotationMatrix = Matrix.Rotation(theta, $V([0, 1, 0])).ensure4x4();
	var baseMvMatrix = Matrix.I(4).x(Matrix.Translation($V([0, 0, -rho])).ensure4x4()).x(phiRotationMatrix).x(thetaRotationMatrix);
	

	
	for( var x = 0; x < NUM_X_TILES; x++ ){
		for( var y = 0; y < NUM_Y_TILES; y++ ){
			var centerMatrix = Matrix.Translation($V([x-NUM_X_TILES/2, 0, y-NUM_Y_TILES/2]));
			
			var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
			gl.uniformMatrix4fv(
				mvUniform, 
				false, 
				new Float32Array(baseMvMatrix.x(centerMatrix).flatten())
			);
			
			var chunk = chunks[x][y];
			gl.bindBuffer(gl.ARRAY_BUFFER, chunk.vertexBuffer);
			gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, chunk.vertexColorBuffer);
			gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.indexBuffer);
			gl.drawElements(gl.TRIANGLES, chunk.indexCount, gl.UNSIGNED_SHORT, 0);
		}
	}

	raf(drawScene);
}