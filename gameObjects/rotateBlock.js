RotateBlock = function ( geometry, baseMaterial, highlightMaterial, color, abilities ) {
	var scope = this;
	scope.objectType = "rotateBlock";
	var motorSpeed = 1.0/60.0;
	var spinner;

	this.addSpinner = function( inSpinner ) {
		spinner = inSpinner;
		scope.add( spinner );
	}

	this.update = function() {
		spinner.rotation.y += motorSpeed;
		this.updateBase();
	}

	GameObject.call( this, geometry, baseMaterial, highlightMaterial, color, abilities );
};

RotateBlock.prototype = new GameObject;
RotateBlock.prototype.constructor = RotateBlock;