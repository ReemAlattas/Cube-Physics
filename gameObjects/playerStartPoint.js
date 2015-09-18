PlayerStartPoint = function ( geometry, baseMaterial, highlightMaterial, color, abilities ) {
	var scope = this;
	scope.objectType = "playerStartPoint";

	this.getBody = function() {
		return body;
	};
	
	this.addBodyToWorld = function() {
		if ( body != null )	world.add( body );
	};

	this.addBody = function( inBody ) {
		body = inBody;
	};

	this.whenCrystalOn = function() {}
	this.whenCrystalOff = function() {}
	this.useBaseMaterial = function() {}

	this.update = function() {

		this.updateBase();
	};

	GameObject.call( this, geometry, baseMaterial, highlightMaterial, color, abilities );

	scope.matrixAutoUpdate = true;

};

PlayerStartPoint.prototype = new GameObject;
PlayerStartPoint.prototype.constructor = PlayerStartPoint;
