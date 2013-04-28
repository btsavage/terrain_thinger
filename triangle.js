var EPSILON = 0.001;

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
	this.m_a = NaN;
	this.m_b = NaN;
	this.m_c = NaN;
	this.m_d = NaN;
	this.centroid = null;
	this.cv1 = null;
	this.cv2 = null;
	this.cv3 = null;
}

Triangle.prototype = {
	/**
	 * 0 : on edge 1
	 * 1 : on edge 2
	 * 2 : on edge 3
	 * 3 : inside
	 * 4 : not contained
	 */
	genMatrix: function genMatrix(){
		var p1 = this.points[this.idx1];
		var p2 = this.points[this.idx2];
		var p3 = this.points[this.idx3];
		var a = p2.x - p1.x;
		var b = p3.x - p1.x;
		var c = p2.y - p1.y;
		var d = p3.y - p1.y;
		var det = a*d - b*c;
		this.m_a = d/det;
		this.m_b = -b/det;
		this.m_c = -c/det;
		this.m_d = a/det;
	},
	contains: function contains(x, y){
		var p1 = this.points[this.idx1];
		if( !this.m_a ){
			this.genMatrix();
		}

		var u = this.m_a*(x-p1.x) + this.m_b*(y-p1.y);
		var v = this.m_c*(x-p1.x) + this.m_d*(y-p1.y);
		if( Math.abs(u) < EPSILON && 0 <= v && v <= 1 ){
			return 2;
		}else if( Math.abs(v) < EPSILON && 0 <= u && u <= 1 ){
			return 0;
		}else if( Math.abs( u + v - 1 ) < EPSILON && u > 0 && v > 0 ){
			return 1;
		}
		if( (u >= 0) && (v >= 0) && (u <= 1 ) && (v <= 1 ) && (u + v <= 1) ){
			return 3;
		}else{
			return 4;
		}
	},
	getCentroid: function getCentroid(){
		if( !this.centroid ){
			this.centroid = {
				x: (this.points[ this.idx1 ].x + this.points[ this.idx2 ].x + this.points[ this.idx3 ].x)/3,
				y: (this.points[ this.idx1 ].y + this.points[ this.idx2 ].y + this.points[ this.idx3 ].y)/3,
				tri: this
			};
		}
		return this.centroid;
	},
	drawCircumscribedCircle: function drawCircumscribedCircle(context){
		var pt1 = this.points[this.idx1];
		var pt2 = this.points[this.idx2];
		var pt3 = this.points[this.idx3];
		var midpoint1 = $V([pt1.x + (pt2.x - pt1.x)/2, pt1.y + (pt2.y - pt1.y)/2]);
		var midpoint2 = $V([pt1.x + (pt3.x - pt1.x)/2, pt1.y + (pt3.y - pt1.y)/2]);
		var perp1 = $V([pt2.y - pt1.y, -(pt2.x - pt1.x)]);
		var perp2 = $V([pt3.y - pt1.y, -(pt3.x - pt1.x)]);
		
		var solution = $M([
			[-perp1.elements[0] , perp2.elements[0] ],
			[-perp1.elements[1] , perp2.elements[1] ]
		]).inv().x( midpoint1.subtract(midpoint2) );
		var circumCenter = midpoint1.add( perp1.multiply(solution.elements[0]) );
		var circumCenter2 = midpoint2.add( perp2.multiply(solution.elements[1]) );
		
		var radius = circumCenter.distanceFrom( $V([pt1.x, pt1.y]) );
		
		context.strokeStyle = "rgb(" + Math.floor(Math.random()*256) + "," + Math.floor(Math.random()*256) + "," + Math.floor(Math.random()*256) + ")";
		context.beginPath();
		context.arc(circumCenter.elements[0], circumCenter.elements[1], radius, 0, 2*Math.PI);
		context.stroke();
	},
	edgeCrossed: function edgeCrossed(x, y, context){
		if( !this.centroid || !this.cv1 || !this.cv2 || !this.cv3 ){
			this.centroid = {
				x: (this.points[ this.idx1 ].x + this.points[ this.idx2 ].x + this.points[ this.idx3 ].x)/3,
				y: (this.points[ this.idx1 ].y + this.points[ this.idx2 ].y + this.points[ this.idx3 ].y)/3,
				tri: this
			};
			var p1 = this.points[this.idx1];
			var p2 = this.points[this.idx2];
			var p3 = this.points[this.idx3];
			this.cv1 = {x:-(p1.y - this.centroid.y), y:(p1.x - this.centroid.x)};
			this.cv2 = {x:-(p2.y - this.centroid.y), y:(p2.x - this.centroid.x)};
			this.cv3 = {x:-(p3.y - this.centroid.y), y:(p3.x - this.centroid.x)};
		};
		var v_x = x - this.centroid.x;
		var v_y = y - this.centroid.y;
		var test1 = this.cv1.x*v_x + this.cv1.y*v_y;
		var test2 = this.cv2.x*v_x + this.cv2.y*v_y;
		var test3 = this.cv3.x*v_x + this.cv3.y*v_y;

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
	splitEdgeAt: function splitEdgeAt( splitPointIdx, edge, dirtyEdges ){
		var newTris = [];
		
		var plusOne = (edge+1)%3;
		var plusTwo = (edge+2)%3;
		var newTri = new Triangle(this.points, splitPointIdx, this.getIndex(plusOne), this.getIndex(plusTwo));
		this.setIndex(plusOne, splitPointIdx);
		this.invalidate();
		
		newTri.neighbors[1] = this.neighbors[plusOne];
		if( newTri.neighbors[1] ){
			newTri.neighbors[1].replaceNeighbor(this, newTri);
		}
		newTri.neighbors[2] = this;
		this.neighbors[plusOne] = newTri;
		
		var neighbor = this.neighbors[edge];
		if( neighbor ){
			var neighborEdge = neighbor.getEdge(this);
			var neighborPlusOne = (neighborEdge+1)%3;
			var neighborPlusTwo = (neighborEdge+2)%3;
			var anotherNewTri = new Triangle(this.points, splitPointIdx, neighbor.getIndex(neighborPlusOne), neighbor.getIndex(neighborPlusTwo));
			neighbor.setIndex(neighborPlusOne, splitPointIdx);
			neighbor.invalidate();
			
			anotherNewTri.neighbors[1] = neighbor.neighbors[neighborPlusOne];
			if( anotherNewTri.neighbors[1] ){
				anotherNewTri.neighbors[1].replaceNeighbor(neighbor, anotherNewTri);
			}
			anotherNewTri.neighbors[2] = neighbor;
			neighbor.neighbors[neighborPlusOne] = anotherNewTri;
			
			// Connect the two pairs of triangles to one another
			this.neighbors[edge] = anotherNewTri;
			newTri.neighbors[0] = neighbor;
			neighbor.neighbors[neighborEdge] = newTri;
			anotherNewTri.neighbors[0] = this;
			
			newTris.push( anotherNewTri );
			dirtyEdges.push( [anotherNewTri, 0], [anotherNewTri, 1], [anotherNewTri, 2], [neighbor, neighborPlusTwo] );
		}
		newTris.push( newTri );
		dirtyEdges.push( [newTri, 0], [newTri, 1], [newTri, 2], [this, plusTwo] );
		return newTris;
	},
	split: function split(splitPointIdx, dirtyEdges){
		var newTris = [];
		
		var newTri1 = new Triangle(this.points, this.idx1, this.idx2, splitPointIdx);
		var newTri2 = new Triangle(this.points, splitPointIdx, this.idx2, this.idx3);
		
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
		
		newTris.push( newTri1, newTri2 );
		dirtyEdges.push( [newTri1, 0], [newTri1, 2], [newTri2, 0], [newTri2, 1], [this, 1], [this, 2] );
		return newTris;
	},
	interpolate: function interpolate(x, y, k, r){
		var p1 = this.points[this.idx1];
		var p2 = this.points[this.idx2];
		var p3 = this.points[this.idx3];
		if( !this.m_a ){
			this.genMatrix();
		}
		var u = this.m_a*(x-p1.x) + this.m_b*(y-p1.y);
		var v = this.m_c*(x-p1.x) + this.m_d*(y-p1.y);

		var d1 = Math.sqrt( (p1.x - x)*(p1.x - x) + (p1.y - y)*(p1.y - y) );
		var d2 = Math.sqrt( (p2.x - x)*(p2.x - x) + (p2.y - y)*(p2.y - y) );
		var d3 = Math.sqrt( (p3.x - x)*(p3.x - x) + (p3.y - y)*(p3.y - y) );
		
		var avgDistance = (d1 + d2 + d3)/3;
		var scaledDistance = (Math.sqrt(avgDistance+0.25) - 0.5);
		return p1.z + u*(p2.z - p1.z) + v*(p3.z - p1.z) + 0.2*(scaledDistance)*k*(2*r-1);
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
	getEdge: function getEdge(tri){
		for( var i = 0; i < 3; i++ ){
			if( this.neighbors[i] === tri ){
				return i;
			}
		}
		return -1;
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
		return (angle1 + angle2) <= Math.PI;
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
		var v1_x = this.points[a].x - this.points[b].x;
		var v1_y = this.points[a].y - this.points[b].y;

		var v2_x = this.points[c].x - this.points[b].x;
		var v2_y = this.points[c].y - this.points[b].y;
		
		return Math.acos(
			(v1_x*v2_x + v1_y*v2_y) / (Math.sqrt(v1_x*v1_x + v1_y*v1_y) * Math.sqrt(v2_x*v2_x + v2_y*v2_y))
		);
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
	},
	invalidate: function invalidate(){
		this.m_a = NaN;
		this.m_b = NaN;
		this.m_c = NaN;
		this.m_d = NaN;
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