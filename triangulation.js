function Triangulation(){
	this.points = [];
	this.triangles = [];
}

Triangulation.prototype = {
	addPoint: function addPoint( x, y ){
		this.points.push( {x:x, y:y} );
		if( this.points.length < 3 ){
			return;
		}else if( this.points.length === 3 ){
			this.triangles.push( new Triangle(this.points, 0, 1, 2) );
		}else{
			var tri = this.searchStartPoint(x, y);
			while( !tri.contains(x, y) ){
				var edge = tri.edgeCrossed(x, y);
				debugger;
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
			var tri1 = dirtyEdge[0];
			var edge = dirtyEdge[1];
			if( !tri1.edgeDelaunay( edge ) ){
			
			}
		}
	}
};