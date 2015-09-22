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


	var placeAtReticle = function( inObject ) {
		if ( inObject != null ) {
			var atObject = getIntersectAtReticle();
			if ( atObject != null ) {
				var distance = player.getPosition().distanceTo( atObject.point );
				if ( distance > minPlacingRadius && distance < maxPlacingRadius ) {
					if ( atObject.object.objectType == "passiveBlock" ) {
						attachToRoot( atObject, inObject );
					} else if ( atObject.object.objectType == "rotateBlock" ) {
						var normal = getLocalPointNormal( atObject );
						if ( normal.equals( up ) ) {
							var worldPosition = getWorldPosition( atObject );
							var newRoot = createNewRoot( atObject, inObject );
							var atRoot = atObject.object.userData.root;
							var worldFaceNormal = getWorldFaceNormal( atObject );

							var offsetAtObject = worldFaceNormal.multiplyScalar( gridUnits );
							var offset = offsetAtObject.add( worldPosition );
							newRoot.position.copy( offset );
							newRoot.quaternion.copy( atRoot.quaternion );
							newRoot.body.position.copy( newRoot.position );
							newRoot.body.quaternion.copy( newRoot.quaternion );

							var offsetAtObject = atObject.face.normal.clone().multiplyScalar( gridUnits/2 );
							var offset = offsetAtObject.add( atObject.object.position );

						
							var pivotA = convertVec( down.clone().multiplyScalar( gridUnits/2 ) );
							var axisA = convertVec( up );
							var pivotB = convertVec( offset );
							var axisB = convertVec( up );
					        var constraint = new CANNON.HingeConstraint( newRoot.body, atRoot.body, { "pivotA": pivotA,
					        																		  "axisA": axisA,
					        																		  "pivotB": pivotB,
					        																		  "axisB": axisB,
					        																		  "maxForce": 1e12 });
					        constraint.enableMotor();
					        constraint.setMotorSpeed( 1 );
					        constraint.setMotorMaxForce( 10000 );

							newRoot.userData.constraints.push( { "constraint": constraint, "letter": "A" } );
							atRoot.userData.constraints.push( { "constraint": constraint, "letter": "B" }  );	
	                        world.addConstraint( constraint );
							world.add( newRoot.body );
							environment.addPuzzleObject( newRoot );
							scene.add( newRoot );
						} else {
							attachToRoot( atObject, inObject );
						}
					} else {
						var worldFaceNormal = getWorldFaceNormal( atObject );
						var root = createNewRoot( atObject, inObject );

						root.position.copy( atObject.point ).add( worldFaceNormal.multiplyScalar( gridUnits/2 ) );
						root.position.divideScalar( gridUnits ).floor().multiplyScalar( gridUnits ).addScalar( gridUnits/2 );
						root.body.position.copy( root.position );

						world.add( root.body );
						environment.addPuzzleObject( root );
						scene.add( root );
					}

					inObject.useBaseMaterial();
					player.inventory.decrementQuantity();
				}
			}
		}
	};

	var getWorldFaceNormal = function( atObject ) {
		var normalMatrix = new THREE.Matrix3().getNormalMatrix( atObject.object.matrixWorld );
		var worldFaceNormal = atObject.face.normal.clone().applyMatrix3( normalMatrix ).normalize();
		return worldFaceNormal
	}

	var getLocalPointNormal = function( atObject ) {
		var worldPosition = getWorldPosition( atObject );
		var normal = up;
		var localPoint = atObject.object.worldToLocal( atObject.point );
		var tol = gridUnits/2 - gridUnits/12;
		if ( localPoint.x > tol ) { normal = front; }
		else if ( localPoint.y > tol ) { normal = up; }
		else if ( localPoint.z > tol ) { normal = left; }
		else if ( localPoint.x < -tol ) { normal = back; }
		else if ( localPoint.y < -tol ) { normal = down; }
		else if ( localPoint.z < -tol ) { normal = right; }

		return normal;
	}

	var getWorldPosition = function( atObject ) {
		var worldPosition = new THREE.Vector3();
		worldPosition.setFromMatrixPosition( atObject.object.matrixWorld );
		return worldPosition;
	}

	var convertVec = function( threeVector3 ) {
		var cannonVec3 = new CANNON.Vec3( threeVector3.x, threeVector3.y, threeVector3.z );
		return cannonVec3;
	};

	var attachToRoot = function( atObject, inObject ) {
		var normal = getLocalPointNormal( atObject );
		var root = atObject.object.userData.root
		inObject.userData.root = root;
		var body = root.body;

		var offsetAtObject = normal.clone().multiplyScalar( gridUnits );
		var offset = offsetAtObject.add( atObject.object.position );
		
		inObject.position.copy( offset );
		root.add( inObject );

		var boxShape = new CANNON.Box( new CANNON.Vec3( gridUnits/2, gridUnits/2, gridUnits/2 ) );
		body.addShape( boxShape, new CANNON.Vec3( offset.x, offset.y, offset.z ) );
		body.mass += 100;

		updateCOM( body, root );	
	}

	var createNewRoot = function( atObject, inObject ) {
		var boxShape = new CANNON.Box(new CANNON.Vec3( gridUnits/2, gridUnits/2, gridUnits/2 ) );
		var boxBody = new CANNON.Body({ mass: 100, material: objectMaterial });
		boxBody.addShape(boxShape);

		var root = new THREE.Object3D();
		root.name = "GameObject";
		inObject.userData.root = root;
		root.add( inObject );
		root.update = function() {
			this.children.forEach( function( c ) {
				c.update();
			})
			this.position.copy( this.body.position );
			this.quaternion.copy( this.body.quaternion );
		};
		root.body = boxBody;
		root.userData.constraints = [];

		return root;
	}

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

		//and do the same with the meshes
		mesh.children.forEach( function( m ) {
			m.position.sub( com );
		});

		mesh.userData.constraints.forEach( function( c ) {
			if ( c.letter == "A") { 
				c.constraint.pivotA.vsub( com, c.constraint.pivotA );
			} else { 
				c.constraint.pivotB.vsub( com, c.constraint.pivotB );
			}
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
