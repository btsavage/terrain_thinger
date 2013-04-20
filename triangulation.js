K = 1;

function Triangulation(){
	this.points = [];
	this.triangles = [];
}

Triangulation.prototype = {
	validate: function validate(){
		this.triangles.forEach( function(triangle){
			for( var i = 0; i < 3; i++ ){
				triangle.validateNeighbors();
			}
		});
	},
	addPoint: function addPoint( x, y, z, context ){
		// TODO: check if it's THE SAME as a point
		
		var pt = {x:x, y:y, z:z};
		var generateZValue = (typeof(z) === "undefined");

		this.points.push( pt );
		if( this.points.length < 3 ){
			return;
		}else if( this.points.length === 3 ){
			this.triangles.push( new Triangle(this.points, 0, 1, 2) );
		}else{
			var tri = this.searchStartPoint(x, y);
			while( true ){
				
				var val = tri.contains(x, y);
				if( val === 3 ){
					break;
				}else if( 0 <= val && val <= 2 ){
					debugger;
					var dirtyEdges = [];
					tri.splitEdgeAt( this.points.length-1, val, this.triangles, dirtyEdges );
					
					this.ensureDelaunay([]);
					this.validate();
					return;
				}
				
				/**
				 * 0 : on edge 1
				 * 1 : on edge 2
				 * 2 : on edge 3
				 * 3 : inside
				 * 4 : not contained
				 */
				var edge = tri.edgeCrossed(x, y, context);
				var neighbor = tri.neighbors[ edge ];
				if( !neighbor ){
					var p1, p2;
					
					switch( edge ){
					case 0:
						p1 = tri.idx1;
						p2 = tri.idx2;
						break;
					case 1:
						p1 = tri.idx2;
						p2 = tri.idx3;
						break;
					case 2:
						p1 = tri.idx3;
						p2 = tri.idx1;
						break;
					}
					
					var newTri = new Triangle(this.points, p2, p1, this.points.length-1);
					this.triangles.push( newTri );
					tri.neighbors[edge] = newTri;
					newTri.neighbors[0] = tri;
					
					this.ensureDelaunay([[tri, edge]]);
					this.validate();
					return;
				}else{
					tri = neighbor;
				}
			}
			var dirtyEdges = [];
			if( generateZValue ){
				pt.z = tri.interpolate( x, y, K );
			}
			tri.split( this.points.length-1, this.triangles, dirtyEdges );
			this.ensureDelaunay(dirtyEdges);
			this.validate();
		}
	},
	searchStartPoint: function searchStartPoint(x, y){
		var closestTriangle = null;
		var smallestSquaredDistance = Number.POSITIVE_INFINITY;
		for( var i = 0; i < this.triangles.length; i++ ){
			var tempTriangle = this.triangles[i];
			var tempPoint = tempTriangle.getCentroid();
			var tempSquaredDistance = (tempPoint.x - x)*(tempPoint.x - x) + (tempPoint.y - y)*(tempPoint.y - y);
			if( tempSquaredDistance < smallestSquaredDistance ){
				closestTriangle = tempTriangle;
				smallestSquaredDistance = tempSquaredDistance;
			}
		}
		return closestTriangle;
	},
	ensureDelaunay: function ensureDelaunay( dirtyEdges ){
		while( dirtyEdges.length > 0 ){
			var dirtyEdge = dirtyEdges.shift();
			if( dirtyEdge === null ){
				continue;
			}
			var tri1 = dirtyEdge[0];
			var edge = dirtyEdge[1];
			if( !tri1.edgeDelaunay( edge ) ){
				tri1.flip( edge, dirtyEdges );
			}
		}
	},
	exportVertices: function exportVertices(){
		var values = [];
		for( var i = 0; i < this.points.length; i++ ){
			var vertex = this.points[i];
			values[3*i] = vertex.x;
			values[3*i + 1] = vertex.z;
			values[3*i + 2] = vertex.y;
			
		}
		return new Float32Array(values);
	},
	exportVertexColors: function exportVertexColors(){
		var vertexColors = [];
		for( var i = 0; i < this.points.length; i++ ){
			vertexColors[4*i] = Math.random();
			vertexColors[4*i+1] = Math.random();
			vertexColors[4*i+2] = Math.random();
			vertexColors[4*i+3] = 1;
		}
		return new Float32Array(vertexColors);
	},
	exportIndexBuffer: function exportIndexBuffer(){
		var indices = [];
		for( var i = 0; i < this.triangles.length; i++ ){
			var triangle = this.triangles[i];
			indices[3*i] = triangle.idx1;
			indices[3*i+1] = triangle.idx2;
			indices[3*i+2] = triangle.idx3;
		}
		return new Uint16Array(indices);
	}
};