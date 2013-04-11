function Triangle(points, idx1, idx2, idx3){
	this.points = points;
	this.idx1 = idx1;
	this.idx2 = idx2;
	this.idx3 = idx3;
	this.neighbors = [
		null,			// shares idx1, idx2
		null,			// shares idx2, idx3
		null 			// shares idx3, idx1
	];
	this.matrix = null;
	this.centroid = null;
	this.cv1 = null;
	this.cv2 = null;
	this.cv3 = null;
}

Triangle.prototype = {
	contains: function contains(x, y){
		var p1 = this.points[this.idx1];
		if( !this.matrix ){
			var p2 = this.points[this.idx2];
			var p3 = this.points[this.idx3];
			this.matrix = $M([
				[p2.x - p1.x, p3.x - p1.x],
				[p2.y - p1.y, p3.y - p1.y]
			]).inv();
		}
		var result = this.matrix.x( $V([x - p1.x, y - p1.y]) ).elements;
		return (result[0] >= 0) && (result[1] >= 0) && (result[0] <= 1 ) && (result[1] <= 1 ) && (result[0] + result[1] <= 1);
	},
	edgeCrossed: function edgeCrossed(x, y){
		if( !this.centroid || !this.cv1 || !this.cv2 || !this.cv3 ){
			this.centroid = {
				x: (this.points[ this.idx1 ].x + this.points[ this.idx2 ].x + this.points[ this.idx3 ].x)/3,
				y: (this.points[ this.idx1 ].y + this.points[ this.idx2 ].y + this.points[ this.idx3 ].y)/3
			};
			var p1 = this.points[this.idx1];
			var p2 = this.points[this.idx2];
			var p3 = this.points[this.idx3];
			var rot90 = $M([
				[0, -1],
				[1,  0]
			]);
			this.cv1 = rot90.x( $V([p1.x - this.centroid.x, p1.y - this.centroid.y]) );
			this.cv2 = rot90.x( $V([p2.x - this.centroid.x, p2.y - this.centroid.y]) );
			this.cv3 = rot90.x( $V([p3.x - this.centroid.x, p3.y - this.centroid.y]) );
		};
		var v = $V([x - this.centroid.x, y - this.centroid.y]);
		var test1 = this.cv1.dot( v );
		var test2 = this.cv2.dot( v );
		var test3 = this.cv3.dot( v );
		
		context.strokeStyle = "rgb(255, 0, 255)";
		context.beginPath();
		context.moveTo( this.centroid.x, this.centroid.y );
		context.lineTo( x, y );
		context.stroke();
		if( test1 >= 0 && test2 <= 0 ){
			context.strokeStyle = "rgb(0, 0, 255)";
			context.beginPath();
			context.moveTo( this.points[this.idx1].x, this.points[this.idx1].y );
			context.lineTo( this.points[this.idx2].x, this.points[this.idx2].y );
			context.stroke();
			return 0;
		}else if( test2 >= 0 && test3 <= 0 ){
			context.strokeStyle = "rgb(0, 0, 255)";
			context.beginPath();
			context.moveTo( this.points[this.idx2].x, this.points[this.idx2].y );
			context.lineTo( this.points[this.idx3].x, this.points[this.idx3].y );
			context.stroke();
			return 1;
		}else{
			context.strokeStyle = "rgb(0, 0, 255)";
			context.beginPath();
			context.moveTo( this.points[this.idx3].x, this.points[this.idx3].y );
			context.lineTo( this.points[this.idx1].x, this.points[this.idx1].y );
			context.stroke();
			return 2;
		}
	},
	split: function split(splitPointIdx, trianglesList){
		var newTri1 = new Triangle(this.points, this.idx1, this.idx2, splitPointIdx);
		var newTri2 = new Triangle(this.points, splitPointIdx, this.idx2, this.idx3);
//		var newTri3 = new Triangle(this.points, tri.idx3, tri.idx1, splitPointIdx);
		
		newTri1.neighbors[0] = this.neighbors[0];
		newTri1.neighbors[1] = newTri2;
		newTri1.neighbors[2] = this;
		
		newTri2.neighbors[0] = newTri1;
		newTri2.neighbors[1] = this.neighbors[1];
		newTri2.neighbors[2] = this;
		
		if( this.neighbors[0] ){
			this.neighbors[0].replaceNeighbor(this, newTri1);
		}
		if( this.neighbors[1] ){
			this.neighbors[1].replaceNeighbor(this, newTri2);
		}
		
		this.idx2 = splitPointIdx;
		this.matrix = null;
		this.centroid = null;
		this.cv1 = null;
		this.cv2 = null;
		this.cv3 = null;
		this.neighbors[0] = newTri1;
		this.neighbors[1] = newTri2;
		
		trianglesList.push( newTri1, newTri2 );
	},
	replaceNeighbor: function replaceNeighbor(oldTri, newTri){
		for( var i = 0; i < 3; i++ ){
			if( this.neighbors[i] === oldTri ){
				this.neighbors[i] = newTri;
				return;
			}
		}
		debugger;
		alert("could not replaceNeighbor");
	}
}