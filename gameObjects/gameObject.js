GameObject = function ( geometry, baseMaterial, highlightMaterial, color, abilities ) {
	var scope = this;

	scope.body = null;

	this.animatingRotation = false;
	var rotFrames = 14;
	var currentRotFrame = 0;

	var targetQ = new THREE.Quaternion();

	useQuaternion = true;
	matrixAutoUpdate = true;

	var baseMaterial = baseMaterial;
	var highlightMaterial = highlightMaterial;
	var rotationAngle = Math.PI/2;
	this.transparent = false;
	this.color = color;
	scope.abilities = abilities;

	var animateRotation = function() { 
		if ( currentRotFrame <= rotFrames ) {
			scope.quaternion.slerp( targetQ, currentRotFrame / rotFrames );
			if ( scope.ody !== null ) {
				scope.body.quaternion.x = scope.quaternion.x;
				scope.body.quaternion.y = scope.quaternion.y;
				scope.body.quaternion.z = scope.quaternion.z;
				scope.body.quaternion.w = scope.quaternion.w;
			}
			currentRotFrame++;
		} else {
			scope.matrixWorldNeedsUpdate = true;
			scope.animatingRotation = false;
			currentRotFrame = 0;
		}
	};

	this.onWorldUnpause = function() {
		scope.body.mass = 100;
	};

	this.onWorldPause = function() {
		scope.body.mass = 100;
	}

	this.getBody = function() {
		return scope.body;
	};
	
	this.addBodyToWorld = function() {
		if ( scope.body != null ) {
			scope.body.position.copy( scope.position );
			scope.body.quaternion.copy( new CANNON.Quaternion( scope.quaternion.x, scope.quaternion.y, scope.quaternion.z, scope.quaternion.w ) );

			world.add( scope.body );
		}
	};

	this.removeBodyFromWorld = function() {
		world.remove( scope.body );
	};

/*
	this.remove = function() {
		if ( abilities.canRemove == true ) {
			environment.removePuzzleObject( scope );
		}
	};
*/
	this.addBody = function( inBody ) {
		scope.body = inBody;
	};

	this.addToBody = function( inGameObject, inShape, offset ) {
		scope.add( inGameObject );
		scope.body.addShape( inShape, new CANNON.Vec3( offset.x, offset.y, offset.z ) );
	}

	this.useHighlightMaterial = function() {
		if ( abilities.canHighlight == true ) {
			if ( scope.material !== highlightMaterial ) {
				scope.material = highlightMaterial;
			}
		}
	};

	this.useBaseMaterial = function() {
		if ( abilities.canHighlight == true ) {
			if ( scope.material !== baseMaterial ) {
				scope.material = baseMaterial;
			}
		}
	};

	this.rotate = function( axis, sign ) {
		if ( abilities.canRotate == true ) {
			angle = sign * rotationAngle;
			if ( scope.animatingRotation === false ) {
				var q = new THREE.Quaternion( 0, 0, 0, 0 );
				q.setFromAxisAngle( axis, angle );
				targetQ.multiplyQuaternions( q, scope.quaternion );
				currentRotFrame = 1;
				scope.animatingRotation = true;
			}
		}
	};

	this.updateBase = function( ) {
		if ( abilities.canUpdate == true ) {
			if ( scope.animatingRotation === true ) {
				animateRotation( );
			}
			scope.matrixWorldNeedsUpdate = true;
		}
		if ( scope.body != null ) {
			scope.position.copy( scope.body.position );
			scope.quaternion.copy( scope.body.quaternion );
		}

	};

	THREE.Mesh.call( this, geometry, baseMaterial);
	scope.name = "GameObject";
	scope.matrixAutoUpdate = true;

};

GameObject.prototype = new THREE.Mesh;
GameObject.prototype.constructor = GameObject;
