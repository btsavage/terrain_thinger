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
	getCentroid: function getCentroid(){
		if( !this.centroid ){
			this.centroid = {
				x: (this.points[ this.idx1 ].x + this.points[ this.idx2 ].x + this.points[ this.idx3 ].x)/3,
				y: (this.points[ this.idx1 ].y + this.points[ this.idx2 ].y + this.points[ this.idx3 ].y)/3
			};
		}
		return this.centroid;
	},
	edgeCrossed: function edgeCrossed(x, y, context){
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

		if( context ){
			context.strokeStyle = "rgb(255, 0, 255)";
			context.beginPath();
			context.moveTo( this.centroid.x, this.centroid.y );
			context.lineTo( x, y );
			context.stroke();
		}
		if( test1 >= 0 && test2 <= 0 ){
			if( context ){
				context.strokeStyle = "rgb(0, 0, 255)";
				context.beginPath();
				context.moveTo( this.points[this.idx1].x, this.points[this.idx1].y );
				context.lineTo( this.points[this.idx2].x, this.points[this.idx2].y );
				context.stroke();
			}
			return 0;
		}else if( test2 >= 0 && test3 <= 0 ){
			if( context ){
				context.strokeStyle = "rgb(0, 0, 255)";
				context.beginPath();
				context.moveTo( this.points[this.idx2].x, this.points[this.idx2].y );
				context.lineTo( this.points[this.idx3].x, this.points[this.idx3].y );
				context.stroke();
			}
			return 1;
		}else{
			if( context ){
				context.strokeStyle = "rgb(0, 0, 255)";
				context.beginPath();
				context.moveTo( this.points[this.idx3].x, this.points[this.idx3].y );
				context.lineTo( this.points[this.idx1].x, this.points[this.idx1].y );
				context.stroke();
			}
			return 2;
		}
	},
	split: function split(splitPointIdx, trianglesList, dirtyEdges){
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
		this.invalidate();
		this.neighbors[0] = newTri1;
		this.neighbors[1] = newTri2;
		
		trianglesList.push( newTri1, newTri2 );
		dirtyEdges.push( [newTri1, 0], [newTri1, 2], [newTri2, 0], [newTri2, 1], [this, 1], [this, 2] );
	},
	interpolate: function interpolate(x, y, k){
		var p1 = this.points[this.idx1];
		var p2 = this.points[this.idx2];
		var p3 = this.points[this.idx3];
		if( !this.matrix ){
			this.matrix = $M([
				[p2.x - p1.x, p3.x - p1.x],
				[p2.y - p1.y, p3.y - p1.y]
			]).inv();
		}
		var result = this.matrix.x( $V([x - p1.x, y - p1.y]) );
		var u = result.elements[0];
		var v = result.elements[1];

		var d1 = Math.sqrt( (p1.x - x)*(p1.x - x) + (p1.y - y)*(p1.y - y) );
		var d2 = Math.sqrt( (p2.x - x)*(p2.x - x) + (p2.y - y)*(p2.y - y) );
		var d3 = Math.sqrt( (p3.x - x)*(p3.x - x) + (p3.y - y)*(p3.y - y) );
		
		var minDistance = Math.min( d1, d2, d3 );
		
		return p1.z + result.dot( $V([p2.z - p1.z, p3.z - p1.z]) ) + minDistance*k*(2*Math.random()-1);
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
	},
	edgeDelaunay: function edgeDelaunay(edge){
		var neighbor = this.neighbors[edge];
		if( !neighbor ){
			return true;
		}
		
		var angle2 = NaN;
		for( var i = 0; i < 3; i++ ){
			if(neighbor.neighbors[i] === this){
				angle2 = neighbor.angleToEdge(i);
			}
		}
		
		var angle1 = this.angleToEdge(edge);
		return (angle1 + angle2) < Math.PI;
	},
	angleToEdge: function angleToEdge(edge){
		var a, b, c;
		
		switch( edge ){
		case 0:
			a = this.idx2;
			b = this.idx3;
			c = this.idx1;
			break;
		case 1:
			a = this.idx3;
			b = this.idx1;
			c = this.idx2;
			break;
		case 2:
			a = this.idx1;
			b = this.idx2;
			c = this.idx3;
			break;
		}
		var v1 = $V([
			this.points[a].x - this.points[b].x, 
			this.points[a].y - this.points[b].y
		]);
		var v2 = $V([
			this.points[c].x - this.points[b].x, 
			this.points[c].y - this.points[b].y
		]);
		return v1.angleFrom( v2 );
	},
	flip: function flip(edge, dirtyEdges){
		var neighbor = this.neighbors[edge];
		var otherEdge = -1;
		loop: for( var i = 0; i < 3; i++ ){
			if( neighbor.neighbors[i] === this ){
				otherEdge = i;
				break loop;
			}
		}
		
		var edge_plus1 = (edge+1)%3;
		var otherEdge_plus_1 = (otherEdge+1)%3;
		var edge_plus_2 = (edge+2)%3;
		var otherEdge_plus_2 = (otherEdge+2)%3;
		
		this.setIndex( edge_plus1, neighbor.getIndex( otherEdge_plus_2 ) );
		neighbor.setIndex( otherEdge_plus_1, this.getIndex( edge_plus_2 ) );
		
		var B = neighbor.neighbors[ otherEdge_plus_1 ];
		var D = this.neighbors[ edge_plus1 ];
		
		this.neighbors[edge] = B;
		if( B ){
			B.replaceNeighbor(neighbor, this);
		}
		
		neighbor.neighbors[otherEdge] = D;
		if( D ){
			D.replaceNeighbor(this, neighbor);
		}
		
		this.neighbors[edge_plus1] = neighbor;
		neighbor.neighbors[otherEdge_plus_1] = this;
		
		this.invalidate();
		neighbor.invalidate();
		
		// Remove any dirty edges related to the new completely different flipped triangles
		for( var i = 0; i < dirtyEdges.length; i++ ){
			var dirtyTriangle = dirtyEdges[i][0]
			if( dirtyTriangle === this || dirtyTriangle === neighbor ){
				dirtyEdges[i] = null;
			}
		}
		// Make all 4 newly changed edges marked as dirty
		dirtyEdges.push( [this, edge], [this, edge_plus_2], [neighbor, otherEdge], [neighbor, otherEdge_plus_2] );
		
		this.validateNeighbors();
	},
	invalidate: function invalidate(){
		this.matrix = null;
		this.centroid = null;
		this.cv1 = null;
		this.cv2 = null;
		this.cv3 = null;
	},
	getIndex: function getIndex(idx){
		switch( idx ){
		case 0:
			return this.idx1;
		case 1:
			return this.idx2;
		case 2:
			return this.idx3;
		}
	},
	setIndex: function setIndex(idx, value){
		switch( idx ){
		case 0:
			this.idx1 = value;
			break;
		case 1:
			this.idx2 = value;
			break;
		case 2:
			this.idx3 = value;
			break;
		}
	},
	validateNeighbors: function validateNeighbors(){
		for( var i = 0; i < 3; i++ ){
			if( this.neighbors[i] ){
				this.neighbors[i].replaceNeighbor(this, this);
			}
		}
	}
}