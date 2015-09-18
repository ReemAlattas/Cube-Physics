RotateBlock = function ( geometry, baseMaterial, highlightMaterial, color, abilities ) {
	var scope = this;
	scope.objectType = "rotateBlock";

	this.update = function() {

		this.updateBase();
	}

	GameObject.call( this, geometry, baseMaterial, highlightMaterial, color, abilities );
};

RotateBlock.prototype = new GameObject;
RotateBlock.prototype.constructor = RotateBlock;