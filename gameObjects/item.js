Item = function ( geometry, material, inType, inColor ) {
	var scope = this;
	this.objectType = inType;
	this.color = inColor;
	var body = null;
	var mini = null;
	this.transparent = true;

	this.getBody = function() {
		return body;
	};

	this.addMini = function( inMini ) {
		scope.add( inMini );
		mini = inMini;
	}
	
	this.addBodyToWorld = function() {
		world.add( body );
	};

	this.removeBodyFromWorld = function() {
		world.remove( body );
	};

	this.addBody = function( inBody ) {
		body = inBody;
	};

	this.update = function() {
		if ( body !== null ) {
			scope.position.copy( new THREE.Vector3( body.position.x, body.position.y, body.position.z ) );
			scope.quaternion.copy( new THREE.Quaternion( body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w ) );
			var playerPos = player.getPosition();
			if ( Math.sqrt( Math.pow( scope.position.x - playerPos.x, 2 ) + Math.pow( scope.position.z - playerPos.z, 2 )) < 0.75 * gridUnits &&
			     Math.abs(scope.position.y - playerPos.y) < 2.0 * gridUnits ) {
				player.inventory.pickupItem( scope );
			}
		}
	};

	THREE.Mesh.call( this, geometry, material );
	scope.name = "item";
	scope.matrixAutoUpdate = true;

};

Item.prototype = new THREE.Mesh;
Item.prototype.constructor = Item;
