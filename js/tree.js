var TreeGen = function(canvasID){
	// CONFIGURATION
	this.loss = 0.04;		// Width loss per cycle
	this.minSleep = 10;		// Min sleep time (For the animation)
	this.branchLoss = 0.8;	// % width maintained for branches
	this.mainLoss = 0.8;	// % width maintained after branching
	this.speed = 0.3;		// Movement speed
	this.newBranch = 0.8;	// Chance of not starting a new branch 
	this.colorful = false;	// Use colors for new trees
	this.fastMode = true;	// Fast growth mode
	this.fadeOut = true;	// Fade slowly to black
	this.fadeAmount = 0.05;	// How much per iteration
	this.autoSpawn = true;	// Automatically create trees
	this.spawnInterval = 250;// Spawn interval in ms
	this.initialWidth = 10;	// Initial branch width
	
// VARS
	this.canvas = {
		id : canvasID,
		ctx : $(canvasID)[0].getContext("2d"),
		WIDTH : $(canvasID).width(),
		HEIGHT : $(canvasID).height(),
		canvasMinX : $(canvasID).offset().left,
		canvasMaxX : this.canvasMinX + this.WIDTH,
		canvasMinY : $(canvasID).offset().top,
		canvasMaxY : this.canvasMinY + this.HEIGHT
	};
	this.mouse = {
		s : {x:0, y:0},	// Mouse speed
		p : {x:0, y:0}	// Mouse position
	}
		
	this.newColor = function(){
		if(!this.colorful) return '#fff';
		return '#'+Math.round(0xffffff * Math.random()).toString(16);
	}
	
	this.mouseMove = function(e) {
		this.mouse.s.x = Math.max( Math.min( e.pageX - this.mouse.p.x, 40 ), -40 );
		this.mouse.s.y = Math.max( Math.min( e.pageY - this.mouse.p.y, 40 ), -40 );
		
		this.mouse.p.x = e.pageX - this.canvas.canvasMinX;
		this.mouse.p.y = e.pageY - this.canvas.canvasMinY;
	}
	
	// Starts a new branch from x,y. w is initial w
	// lifetime is the number of computed cycles
	this.branch = function(x,y,dx,dy,w,growthRate,lifetime,branchColor,treeObj){
		this.canvas.ctx.lineWidth = w-lifetime*this.loss;
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(x,y);
		if(this.fastMode) growthRate *= 0.5;
		// Calculate new coords
		x = x+dx;
		y = y+dy;
		// Change dir
		dx = dx+Math.sin(Math.random()+lifetime)*this.speed;
		dy = dy+Math.cos(Math.random()+lifetime)*this.speed;
		//
		this.canvas.ctx.strokeStyle = branchColor;
		this.canvas.ctx.lineTo(x,y);
		this.canvas.ctx.stroke();
		// Generate new branches
		// they should spawn after a certain lifetime has been met, although depending on the width
		if(lifetime > 5*w+Math.random()*100 && Math.random()>this.newBranch){
			setTimeout(function(){
				treeObj.branch(x,y,2*Math.sin(Math.random()+lifetime),2*Math.cos(Math.random()+lifetime),(w-lifetime*treeObj.loss)*treeObj.branchLoss,growthRate+100*Math.random(),0,branchColor, treeObj);
				// When it branches, it looses a bit of width
				w *= this.mainLoss;
			},2*growthRate*Math.random()+this.minSleep);
		}
		// Continua la rama
		if(w-lifetime*this.loss>=1) setTimeout(function(){ treeObj.branch(x,y,dx,dy,w,growthRate,++lifetime,branchColor, treeObj); },growthRate);
	}
	
	this.resizeCanvas();
}
	
$(document).ready(function(e) {
	
	var tree = new TreeGen('#tree1');
	
	setTimeout(function(){
		tree.branch(tree.canvas.WIDTH-100, tree.canvas.HEIGHT, 0, -1, Math.random()*tree.initialWidth,5,0,'#333',tree);
	},500);
	
	setTimeout(function(){
		tree.branch(tree.canvas.WIDTH-250, tree.canvas.HEIGHT, 0, -1, Math.random()*tree.initialWidth,5,0,'#333',tree);
	},2000);
	
	setTimeout(function(){
		tree.branch(tree.canvas.WIDTH-350, tree.canvas.HEIGHT, 0, -1, Math.random()*tree.initialWidth,5,0,'#333',tree);
	},6000);
	
	$(window).mousemove(function(e){ tree.mouseMove(e); });
	
	// Branch adding:
	$('canvas').click(function(e){
		e.preventDefault();
		tree.branch(tree.mouse.p.x, tree.canvas.HEIGHT, 0, -1, Math.random()*tree.initialWidth,5,0,'#333',tree);
	});
});