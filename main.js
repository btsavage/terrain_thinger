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

var theta = 0;
var thetaVelocity = 0;
var phi = 0;
var phiVelocity = 0;
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
var NUM_VERTS = 10;
var NUM_TERRAIN_VERTS = 0;
var NUM_TERRAIN_INDICES = 0;

var squareVerticesBuffer;
var squareVerticesColorBuffer;

var terrainVerticesBuffer;
var terrainVerticesColorBuffer;
var terrainIndexBuffer;
var terrain;
function initBuffers() {
	squareVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

	var vertices = [
		1.0,  1.0,  -1.0,
		-1.0, 1.0,  -1.0,
		1.0,  -1.0, -1.0,
		-1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
		1.0,  1.0, 1.0,
		-1.0, 1.0, 1.0,
		1.0,  1.0,  -1.0,
		-1.0, 1.0,  -1.0,
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	var colors = [
		1.0,  1.0,  1.0,  1.0,    // white
		1.0,  0.0,  0.0,  1.0,    // red
		0.0,  1.0,  0.0,  1.0,    // green
		0.0,  0.0,  1.0,  1.0,     // blue
		1.0,  1.0,  0.0,  1.0,		// yellow
		1.0,  0.0,  1.0,  1.0,		// magenta
		0.0,  1.0,  1.0,  1.0,		// cyan
		1.0,  1.0,  0.0,  1.0,      // green?
		1.0,  1.0,  1.0,  1.0,
		1.0,  0.0,  0.0,  1.0,    // red
	];

	squareVerticesColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	// Terrain
	terrainVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVerticesBuffer);
	
	terrain = new Triangulation();
	terrain.addPoint(-1, -1, Math.random()-0.5);
	terrain.addPoint(1, -1, Math.random()-0.5);
	terrain.addPoint(-1, 1, Math.random()-0.5);
	terrain.addPoint(1, 1, Math.random()-0.5);
	for( var i = 0; i < 2000; i++ ){
		terrain.addPoint( 2*Math.random()-1, 2*Math.random()-1 );
	}
	gl.bufferData(gl.ARRAY_BUFFER, terrain.exportVertices(), gl.STATIC_DRAW);
	
	// Terrain Color
	terrainVerticesColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVerticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, terrain.exportVertexColors(), gl.STATIC_DRAW);
	
	NUM_TERRAIN_VERTS = terrain.points.length;
	
	// Indices
	terrainIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
	var indices = terrain.exportIndexBuffer();
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	NUM_TERRAIN_INDICES = indices.length;
}

function addPoint(){
	terrain.addPoint( 2*Math.random()-1, 2*Math.random()-1 );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVerticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, terrain.exportVertices(), gl.STATIC_DRAW);
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
	var perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);
	var mvMatrix = Matrix.I(4).x(Matrix.Translation($V([0.0, 0.0, -3.0])).ensure4x4());
	
	var phiRotationMatrix = Matrix.Rotation(phi, $V([1, 0, 0])).ensure4x4();
	mvMatrix = mvMatrix.x(phiRotationMatrix);
	
	var thetaRotationMatrix = Matrix.Rotation(theta, $V([0, 1, 0])).ensure4x4();
	mvMatrix = mvMatrix.x(thetaRotationMatrix);
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
	
	// Bind model data
/*
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, NUM_VERTS);
*/
	
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVerticesColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
	gl.drawElements(gl.TRIANGLES, NUM_TERRAIN_INDICES, gl.UNSIGNED_SHORT, 0);

	raf(drawScene);
}