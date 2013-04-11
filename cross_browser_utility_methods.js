function pageSize(){
	var e = document.documentElement;
	var g = document.getElementsByTagName('body')[0];
	var x = window.innerWidth || e.clientWidth || g.clientWidth;
	var y = window.innerHeight|| e.clientHeight|| g.clientHeight;
	return {width: x, height: y};
}

function raf(fun){
	if( window.requestAnimationFrame ){
		window.requestAnimationFrame(fun);
	}else if( window.mozRequestAnimationFrame ){
		window.mozRequestAnimationFrame(fun);
	}
}