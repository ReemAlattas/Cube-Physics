Player = function() {
	var scope = this;
	var controls;
	var mode = "";
	var object, body;
	this.height = 1.65 * gridUnits;
	this.inventory;
	var pitchObject, yawObject;
	var objectControls;

	var init = function() {
		pitchObject = new THREE.Object3D();
		pitchObject.add( camera );

		yawObject = new THREE.Object3D();
		yawObject.position.y = 2;
		yawObject.add( pitchObject );

		body = initBody();

		objectControls = new ObjectControls( scope );
		controls = new PlayerControls( yawObject, pitchObject, body );

		scope.inventory = new Inventory();
	};


	var initBody = function() {
		var radiusTop = gridUnits/3;
		var radiusBottom = radiusTop;
		var numSegments = 8;

        	var playerShape = new CANNON.Cylinder( radiusTop, radiusBottom, scope.height, numSegments);
		
		var q = new CANNON.Quaternion();
		q.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), -Math.PI / 2 );
		playerShape.transformAllPoints( new CANNON.Vec3(), q );

		var playerBody = new CANNON.Body({ mass: 1000, type: CANNON.Body.DYNAMIC, material: physicsMaterial });
		playerBody.addShape( playerShape );
		playerBody.linearDamping = 0.999;

		playerBody.fixedRotation = true;
    		playerBody.updateMassProperties();

		return playerBody;
	};

	this.changePosition = function( newPosition ) {
		body.position.copy( new CANNON.Vec3( newPosition.x, newPosition.y, newPosition.z ) );
	}

	this.changeRotation = function( newQuaternion ) {
		yawObject.quaternion.copy( newQuaternion );
		yawObject.rotation.y += Math.PI;
	}

	this.getObject = function () {
		return yawObject;
	};

	this.getControls = function() {
		return controls;
	};

	this.getObjectControls = function() {
		return objectControls;
	}

	this.getDirection = function( ){
		var direction = new THREE.Vector3();		
		var v = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );
		rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
		return direction.copy( v ).applyEuler( rotation ).normalize();
	};

	this.getPosition = function( ){
		return yawObject.position;
	};

	this.changeToEditMode = function() {
		controls.changeMode( "fly" );
	};

	this.changeToPlayMode = function() {
		controls.changeMode( "walk" );
	};
	
	this.pause = function() {
		controls.enabled = false;
	};

	this.unpause = function() {
		controls.enabled = true;
	};

	this.addToGame = function( inScene, inWorld ) {
		if ( controls != null ) {
			inScene.add( yawObject );
			inWorld.add( body );
		}
	};

	this.update = function( delta ) {
		objectControls.update();
		controls.update( delta );
	};

	init();
}
