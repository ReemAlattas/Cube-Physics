GameObject = function ( geometry, baseMaterial, highlightMaterial, color, abilities ) {
	var scope = this;

	var body = null;

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
			if ( body !== null ) {
				body.quaternion.x = scope.quaternion.x;
				body.quaternion.y = scope.quaternion.y;
				body.quaternion.z = scope.quaternion.z;
				body.quaternion.w = scope.quaternion.w;
			}
			currentRotFrame++;
		} else {
			scope.matrixWorldNeedsUpdate = true;
			scope.animatingRotation = false;
			currentRotFrame = 0;
		}
	};

	this.onWorldUnpause = function() {
		body.mass = 100;
	};

	this.onWorldPause = function() {
		body.mass = 100;
	}

	this.getBody = function() {
		return body;
	};
	
	this.addBodyToWorld = function() {
		if ( body != null ) {
			body.position.copy( scope.position );
			body.quaternion.copy( new CANNON.Quaternion( scope.quaternion.x, scope.quaternion.y, scope.quaternion.z, scope.quaternion.w ) );

			world.add( body );
		}
	};

	this.removeBodyFromWorld = function() {
		world.remove( body );
	};

/*
	this.remove = function() {
		if ( abilities.canRemove == true ) {
			environment.removePuzzleObject( scope );
		}
	};
*/
	this.addBody = function( inBody ) {
		body = inBody;
	};

	this.addToBody = function( inGameObject, inShape, offset ) {
		scope.add( inGameObject );
		body.addShape( inShape, new CANNON.Vec3( offset.x, offset.y, offset.z ) );
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
		if ( body != null ) {
			scope.position.copy( body.position );
			scope.quaternion.copy( body.quaternion );
		}

	};

	THREE.Mesh.call( this, geometry, baseMaterial);
	scope.name = "GameObject";
	scope.matrixAutoUpdate = true;

};

GameObject.prototype = new THREE.Mesh;
GameObject.prototype.constructor = GameObject;
