Portal = function ( geometry, material, color, abilities, inAttributes ) {
	var scope = this;
	scope.objectType = "portal";
	scope.attributes = inAttributes;
	if ( inAttributes != null ) var destinationPath = scope.attributes.destinationPath;
	geometry.computeBoundingBox();

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
		var playerPos = player.getPosition();
		var dist = new THREE.Vector3();
		dist.subVectors( scope.position, playerPos );
		var bBox = geometry.boundingBox.max;
		if ( ( dist.x < bBox.x && dist.x > -bBox.x ) && 
			 ( dist.y < bBox.y && dist.y > -bBox.y ) && 
			 ( dist.z < bBox.z && dist.z > -bBox.z ) ) {
			if ( destinationPath != null ) switchLevel( destinationPath );
		}
		scope.material.uniforms.time.value = scope.material.uniforms.time.value + 0.05;
		this.updateBase();
	};

	GameObject.call( this, geometry, material, material, color, abilities );

	scope.matrixAutoUpdate = true;

};

Portal.prototype = new GameObject;
Portal.prototype.constructor = Portal;
