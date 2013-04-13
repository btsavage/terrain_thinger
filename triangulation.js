K = 0.3;

function Triangulation(){
	this.points = [];
	this.triangles = [];
}

Triangulation.prototype = {
	addPoint: function addPoint( x, y, z ){
		var pt = {x:x, y:y, z:z};
		var generateZValue = (typeof(z) === "undefined");

		this.points.push( pt );
		if( this.points.length < 3 ){
			return;
		}else if( this.points.length === 3 ){
			this.triangles.push( new Triangle(this.points, 0, 1, 2) );
		}else{
			var tri = this.searchStartPoint(x, y);
			while( !tri.contains(x, y) ){
				var edge = tri.edgeCrossed(x, y);
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
		}
	},
	searchStartPoint: function searchStartPoint(x, y){
		return this.triangles[0];
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
				console.log("edge was flipped!");
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