ObjectControls = function( inPlayer ) {
	
	var scope = this;
	var player = inPlayer;
	var maxPlacingRadius = gridUnits * 100;
	var minPlacingRadius = gridUnits * 1.25;

	var animatingRotation = false;
	var rotationFrames = 14;
	var currentRotationFrame = 0;
	var targetRotationQuaternion = new THREE.Quaternion();
	var selectedTargetRotationQuaternion = new THREE.Quaternion();

	scope.leftArrowDown = false;
	scope.rightArrowDown = false;
	scope.upArrowDown = false;
	scope.downArrowDown = false;

	var object = null;

	var init = function() {
		document.addEventListener( 'mousedown', onMouseDown, false );

  		document.addEventListener( "mousewheel", onMouseScroll, false);
	};

	var onMouseScroll = function( e ) {
		if ( updateLoop === true ) {
			var wheelData = e.detail ? e.detail : e.wheelDelta;
			if ( wheelData > 0 ) { 
				player.inventory.moveToPrevious();
			}
			else {
				player.inventory.moveToNext();
			}
		}
	};

	var onMouseDown = function( e ) {
		if ( updateLoop === true ) {
			switch (e.which) {
				case 1:	//left click
					var quantity = player.inventory.getCurrentQuantity();
					if ( quantity !== 0 ) {
						var type = player.inventory.getCurrentType();
						var color = player.inventory.getCurrentColor();
						if ( type !== "none" ) {
							var canRotate = true;
							var canHighlight = true;
							var canRemove = true;
							var canUpdate = true;
							var isDynamic = true;
							var abilities = new Abilities( canRotate, canHighlight, canRemove, canUpdate, isDynamic );
							loader.loadObjectToScene( scope.onObjectLoad, type, color, new THREE.Vector3(0,0,0), new THREE.Quaternion(0,0,0,1), abilities );
						}
					}
					break;
				case 3: 
					deleteAtReticle();
					break; 
			}
		}
	};

	var deleteAtReticle = function() {
		var reticleObject = getObjectAtReticle();
		if ( reticleObject != null ) {
			if ( reticleObject.name == "GameObject" ) {
				reticleObject.remove();
				object = null;
			}
		}
	};

	var rotateUp = function( obj ) {
		var facingDir = player.getDirection();
		var unalignedAxis = facingDir.cross( up );
		var axis;
		if ( Math.abs( unalignedAxis.z / unalignedAxis.x ) < 1 ) { 
			if (unalignedAxis.x > 0 ) { axis = back; }
			else { axis = front; }
		}
		else {
			if ( unalignedAxis.z > 0 ) { axis = right; }
			else { axis = left; }
		}
		obj.rotate( axis, 1 );
	};

	var rotateDown = function( obj ) {
		var facingDir = player.getDirection();
		var unalignedAxis = facingDir.cross( up );
		var axis;
		if ( Math.abs( unalignedAxis.z / unalignedAxis.x ) < 1 ) { 
			if (unalignedAxis.x > 0 ) { axis = back; }
			else { axis = front; }
		}
		else {
			if ( unalignedAxis.z > 0 ) { axis = right; }
			else { axis = left; }
		}	
		obj.rotate( axis, -1 );
	};

	var rotateLeft = function( obj ) {
		obj.rotate( up, -1 );
	};

	var rotateRight = function( obj ) {
		obj.rotate( up, 1 );
	};

	var highlightAtReticle = function() {
		var reticleObj = getObjectAtReticle( );
		if ( reticleObj != null ) {
			if ( object === null ) {
				object = reticleObj;
			}
			if ( reticleObj.id === object.id ) {
				if ( reticleObj.name == "GameObject" ) {
					object.useHighlightMaterial();
					if ( scope.leftArrowDown === true ) { rotateLeft( object ); }
					else if ( scope.rightArrowDown === true ) { rotateRight( object ); }
					else if ( scope.upArrowDown === true ) { rotateUp( object ); }
					else if ( scope.downArrowDown === true ) { rotateDown( object ); }
				}
			} else if ( object.animatingRotation !== true ) {

				if ( object.name == "GameObject"){
					object.useBaseMaterial();
				}
				object = reticleObj;
				if ( object.name == "GameObject"){
					object.useHighlightMaterial();
				}
			} else if (object !== null ) {
				if ( object.name == "GameObject"){
					object.useBaseMaterial();
				}
				object = null;
			}
		} else if ( object !== null ) {
			if ( object.name == "GameObject"){
				object.useBaseMaterial();
			}
			object = null;
		}
	};



	var getObjectAtReticle = function( ) {
		var baseObj;
		raycaster.ray.set( player.getPosition(), player.getDirection() );
		var intersects = [];
		if ( environment != null ) {
			intersects = environment.intersectPuzzleObjects( raycaster );
		}

		for ( var i = 0; i < intersects.length; i++ ) {
			baseObj = intersects[ i ].object;
			break;
		}

		return baseObj;
	};

	var getIntersectAtReticle = function( ) {
		var intersect;
		raycaster.ray.set( player.getPosition(), player.getDirection() );
		var intersects = [];
		if ( environment != null ) {
			intersects = environment.intersectPuzzleObjects( raycaster );
		}

		for ( var i = 0; i < intersects.length; i++ ) {
			var objName = intersects[ i ].object.name;
			if ( objName !== "item" ) {
				intersect = intersects[ i ];
				break;
			}
		}

		return intersect;
	};

	var loadBoxBody = function( xLength, yLength, zLength ) {
        	var boxShape = new CANNON.Box(new CANNON.Vec3( xLength/2, yLength/2, zLength/2 ));
        	var boxBody = new CANNON.Body({ mass: 100, material: objectMaterial });
        	boxBody.addShape(boxShape);

		return boxBody;
	}


	var placeAtReticle = function( inObj ) {
		if ( inObj != null ) {
			var atObject = getIntersectAtReticle();
			if ( atObject != null ) {
				var distance = player.getPosition().distanceTo( atObject.point );
				if ( distance > minPlacingRadius && distance < maxPlacingRadius ) {

					var normalMatrix = new THREE.Matrix3().getNormalMatrix( atObject.object.matrixWorld );
					var worldFaceNormal = atObject.face.normal.clone().applyMatrix3( normalMatrix ).normalize();
					var worldPosition = new THREE.Vector3();
					worldPosition.setFromMatrixPosition( atObject.object.matrixWorld );
					
					if ( atObject.object.name == "GameObject" ) {
						var root = atObject.object.userData.root
						inObj.userData.root = root;
						var body = root.body;

						var offsetAtObject = atObject.face.normal.clone().multiplyScalar( gridUnits );
						var offset = offsetAtObject.add( atObject.object.position );
						
						inObj.position.copy( offset );
						root.add( inObj );

						var boxShape = new CANNON.Box( new CANNON.Vec3( gridUnits/2, gridUnits/2, gridUnits/2 ) );
						body.addShape( boxShape, new CANNON.Vec3( offset.x, offset.y, offset.z ) );
						body.mass += 10;

						updateCOM( body, root );

					} else {
						var boxShape = new CANNON.Box(new CANNON.Vec3( gridUnits/2, gridUnits/2, gridUnits/2 ) );
						var boxBody = new CANNON.Body({ mass: 10, material: objectMaterial });
						boxBody.addShape(boxShape);

						var rootObj = new THREE.Object3D();
						rootObj.position.copy( atObject.point ).add( worldFaceNormal.multiplyScalar( gridUnits/2 ) );
						rootObj.position.divideScalar( gridUnits ).floor().multiplyScalar( gridUnits ).addScalar( gridUnits/2 );
						rootObj.name = "GameObject";
						inObj.userData.root = rootObj;
						rootObj.add( inObj );
						boxBody.position.copy( rootObj.position );
						rootObj.update = function() {
							this.position.copy( this.body.position );
							this.quaternion.copy( this.body.quaternion );
						};
						rootObj.body = boxBody;
						world.add( rootObj.body );
						environment.addPuzzleObject( rootObj );
						scene.add( rootObj );
					}

					inObj.useBaseMaterial();
					player.inventory.decrementQuantity();
				}
			}
		}
	};

	var updateCOM = function( body, mesh ) {
		//first calculate the center of mass
		var com = new CANNON.Vec3();
		body.shapeOffsets.forEach( function( offset ) {
			com.vadd( offset, com );
		});
		com.scale( 1/body.shapes.length, com );

		//move the shapes so the body origin is at the COM
		body.shapeOffsets.forEach( function( offset ) {
			offset.vsub( com, offset );
		});

		//now move the body so the shapes' net displacement is 0
		body.position.vadd( com, body.position );

		//mesh.position.( com );
		mesh.children.forEach( function( m ) {
			m.position.sub( com );
		});
	};


	this.onObjectLoad = function( inObject ) {
		placeAtReticle( inObject );
	};

	this.update = function() {
		highlightAtReticle();
	};
	
	init();
};
