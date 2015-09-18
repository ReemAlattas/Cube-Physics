PassiveBlock = function ( geometry, baseMaterial, highlightMaterial, color, abilities ) {
	var scope = this;
	scope.objectType = "passiveBlock";

	this.update = function() {

		this.updateBase();
	}

	GameObject.call( this, geometry, baseMaterial, highlightMaterial, color, abilities );
};

PassiveBlock.prototype = new GameObject;
PassiveBlock.prototype.constructor = PassiveBlock;