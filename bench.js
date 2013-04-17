

function start() {
	
	setInterval(test, 100);

}

function test(){
	console.log("hi");
	var terrain = new Triangulation();
	terrain.addPoint(-1, -1, Math.random()-0.5);
	terrain.addPoint(1, -1, Math.random()-0.5);
	terrain.addPoint(-1, 1, Math.random()-0.5);
	terrain.addPoint(1, 1, Math.random()-0.5);
	for( var i = 0; i < 2000; i++ ){
		terrain.addPoint( 2*Math.random()-1, 2*Math.random()-1 );
	}
}