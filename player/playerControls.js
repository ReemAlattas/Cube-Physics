/**
* @author mrdoob / http://mrdoob.com/
* @author schteppe / https://github.com/schteppe
*/
var PlayerControls = function ( yawObject, pitchObject, cannonBody ) {
	var scope = this;

	var mode = 'walk';
	var velocityFactor = 100 * gridUnits;
	var jumpVelocity = 20 * gridUnits;
	var headOffset = new THREE.Vector3( 0, 5/8 * gridUnits, 0 );

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	var canJump = false;

	var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
	var upAxis = new CANNON.Vec3(0,1,0);

	cannonBody.addEventListener("collide",function(e){
		var contact = e.contact;

		// contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
		// We do not yet know which one is which! Let's check.
		if(contact.bi.id == cannonBody.id)  // bi is the player body, flip the contact normal
		    contact.ni.negate(contactNormal);
		else
		    contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

		// If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
		if(contactNormal.dot(upAxis) > 0.5) { // Use a "good" threshold value between 0 and 1 here!
			canJump = true;
		}
	});


	var PI_2 = Math.PI / 2;


	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	};


	document.addEventListener( 'mousemove', onMouseMove, false );

	// Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
	var inputVelocity = new THREE.Vector3();
	var euler = new THREE.Euler();
	var quat = new THREE.Quaternion();

	this.jump = function() {
		if ( canJump === true ){
		    cannonBody.velocity.y = jumpVelocity;
		}
		canJump = false;
	};

	this.changeMode = function( inMode ) {
		mode = inMode;
	}

	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;

		inputVelocity.set(0,0,0);
		var y;

		if ( this.moveForward ){
		    inputVelocity.z = -velocityFactor * delta;
		}
		if ( this.moveBackward ){
		    inputVelocity.z = velocityFactor * delta;
		}

		if ( this.moveLeft ){
		    inputVelocity.x = -velocityFactor * delta;
		}
		if ( this.moveRight ){
		    inputVelocity.x = velocityFactor * delta;
		}

		// Convert velocity to world coordinates
		euler.x = pitchObject.rotation.x;
		euler.y = yawObject.rotation.y;

		euler.order = "XYZ";
		quat.setFromEuler( euler );
		inputVelocity.applyQuaternion( quat );

		// Add to the object
		cannonBody.velocity.x += inputVelocity.x;
		cannonBody.velocity.z += inputVelocity.z;

		if ( mode == "fly" ) { 
			if ( this.moveForward ){
			    cannonBody.velocity.y +=  velocityFactor * delta * pitchObject.rotation.x;
			}
			if ( this.moveBackward ){
			    cannonBody.velocity.y -=  velocityFactor * delta * pitchObject.rotation.x;
			}
		}

		
		var camPos = new THREE.Vector3(cannonBody.position.x, cannonBody.position.y, cannonBody.position.z);
		camPos.add(headOffset);
		yawObject.position.copy( camPos );
	};

};
PlayerControls.prototype.constructor = PlayerControls;
