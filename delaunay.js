var canvas = null;
var context = null;
var triangulation = new Triangulation();

function start() {
	canvas = document.createElement("canvas");
	var dimensions = pageSize();
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	document.body.appendChild( canvas );
	
	canvas.addEventListener( "mousedown", onMouseDown );
	canvas.addEventListener( "mouseup", onMouseUp );

	context = canvas.getContext("2d");
	
	window.onresize = onResize;
	
	var terrain = triangulation;
	var SIDE_LENGTH = 500;
	var EDGE_VERTS = 20;
	
	terrain.addPoint(0, SIDE_LENGTH, 0);
	terrain.addPoint(0, 0, 0);

	for( var i = 0; i < EDGE_VERTS; i++ ){
		terrain.addPoint( SIDE_LENGTH*(i+1)/(EDGE_VERTS+1), 0, 0);
	}
	for( var i = 0; i < EDGE_VERTS; i++ ){
		terrain.addPoint( SIDE_LENGTH, SIDE_LENGTH*(i+1)/(EDGE_VERTS+1), 0);
	}
	terrain.addPoint(SIDE_LENGTH, 0, 0);
	for( var i = 0; i < EDGE_VERTS; i++ ){
		terrain.addPoint( SIDE_LENGTH - SIDE_LENGTH*(i+1)/(EDGE_VERTS+1), SIDE_LENGTH, 0);
	}
	
	terrain.addPoint(SIDE_LENGTH, SIDE_LENGTH, 0);
	
	for( var i = 0; i < EDGE_VERTS; i++ ){
		terrain.addPoint( 0, SIDE_LENGTH - SIDE_LENGTH*(i+1)/(EDGE_VERTS+1), 0);
	}
	
	drawScene();
}

function onResize(){
	console.log("resized");

	var dimensions = pageSize();
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	
	raf(drawScene);
}

function onMouseDown(e){
}

function onMouseUp(e){
	triangulation.addPoint( e.clientX, e.clientY, 0, context );
	triangulation.validate();
	raf(drawScene);
}

function drawScene(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	context.lineWidth = 2;
	context.lineCap = "butt";
	context.lineJoin = "miter";
	context.miterLimit = 1000;
	context.strokeStyle = "rgb(255, 0, 0)";
	
	triangulation.triangles.forEach( function(triangle){
		context.beginPath();
		var pt1 = triangulation.points[triangle.idx1];
		context.moveTo( pt1.x, pt1.y );
		var pt2 = triangulation.points[triangle.idx2];
		context.lineTo( pt2.x, pt2.y );
		var pt3 = triangulation.points[triangle.idx3];
		context.lineTo( pt3.x, pt3.y );
		context.closePath();
		context.stroke();
	});
	
	triangulation.triangles.forEach( function(triangle){
		triangle.drawCircumscribedCircle(context);
	});
	
	context.fillStyle = "rgb(0, 0, 0)";
	
	triangulation.points.forEach( function(point){
		context.beginPath();
		context.arc( point.x, point.y, 10, 0, 2*Math.PI );
		context.fill();
	});
}