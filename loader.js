Loader = function ( ) {
	var jsonLoader = new THREE.JSONLoader;

	var loadObjectBody = function( object ) {
        	var objectBody = new CANNON.Body({ mass: 0, material: objectMaterial });
		var rawVerts = object.geometry.vertices;
                var rawFaces = object.geometry.faces.slice();

		if ( object.children ) { //it's a mirror object -- pretty lousy way to do this...
			rawFaces.push( new THREE.Face3( 0, 3, 4 ) );
			rawFaces.push( new THREE.Face3( 3, 5, 4 ) );

		}

                var verts=[], faces=[], offset;

                for(var j=0; j<rawVerts.length; j++){
                    verts.push(new CANNON.Vec3( rawVerts[j].x,
                                                rawVerts[j].y,
                                                rawVerts[j].z));
                }

                for(var j=0; j<rawFaces.length; j++){
                    faces.push([rawFaces[j].a,rawFaces[j].b,rawFaces[j].c]);
                }

                // Construct polyhedron
                var objectPart = new CANNON.ConvexPolyhedron(verts,faces);

                objectBody.addShape( objectPart );		
		return objectBody;
	};

	var loadBoxBody = function( xLength, yLength, zLength ) {
        	var boxShape = new CANNON.Box(new CANNON.Vec3( xLength/2, yLength/2, zLength/2 ));
        	var boxBody = new CANNON.Body({ mass: 100, material: objectMaterial });
        	boxBody.addShape(boxShape);

		return boxBody;
	}


	PassiveBlockLoader = function( inPosition, inQuaternion, inColor, inCallback, inAbilities ) {
		var position = inPosition;
		var quaternion = inQuaternion;
		var color = inColor;
		var callback = inCallback;
		var abilities = inAbilities;

		this.load = function( ) {
			var boxWidth = gridUnits;
			var geometry = new THREE.BoxGeometry( boxWidth, boxWidth, boxWidth );

			var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );

			var baseMaterial = new THREE.MeshBasicMaterial( { color: color, map: texture } );
			baseMaterial.transparent = true;
			var highlightMaterial = new THREE.MeshBasicMaterial( {color: 0x66FFFF, map: texture } );
			var passiveBlock = new PassiveBlock( geometry, baseMaterial, highlightMaterial, color, abilities );
			//var body = loadBoxBody( boxWidth, boxWidth, boxWidth );
			passiveBlock.position.copy( position );
			passiveBlock.quaternion.copy( quaternion );
			//passiveBlock.addBody( body );
			callback( passiveBlock );	
		};
	}

	RotateBlockLoader = function( inPosition, inQuaternion, inColor, inCallback, inAbilities ) {
		var position = inPosition;
		var quaternion = inQuaternion;
		var color = inColor;
		var callback = inCallback;
		var abilities = inAbilities;

		this.load = function( ) {
			var boxWidth = gridUnits;
			var geometry = new THREE.BoxGeometry( boxWidth, boxWidth, boxWidth );

			var texture = THREE.ImageUtils.loadTexture( 'textures/snow.jpg' );			

			var baseMaterial = new THREE.MeshBasicMaterial( { color: color, map: texture } );
			baseMaterial.transparent = true;
			var highlightMaterial = new THREE.MeshBasicMaterial( {color: 0x66FFFF, map: texture } );
			var rotateBlock = new RotateBlock( geometry, baseMaterial, highlightMaterial, color, abilities );
			//var body = loadBoxBody( boxWidth, boxWidth, boxWidth );
			rotateBlock.position.copy( position );
			rotateBlock.quaternion.copy( quaternion );
			//rotateBlock.addBody( body );
			callback( rotateBlock );	
		};
	}


	PlayerStartPointLoader = function( inPosition, inQuaternion, inColor, inCallback, inAbilities ) {
		var position = inPosition;
		var quaternion = inQuaternion;
		var color = inColor;
		var callback = inCallback;
		var abilities = inAbilities;

		var onLoad = function( geometry, materials ) {
			var baseMaterial = new THREE.MeshBasicMaterial( );
			var highlightMaterial = new THREE.MeshBasicMaterial( {color: 0x6333FF } );
			var scaleVec = new THREE.Vector3( gridUnits/4, gridUnits/4, gridUnits/4 );
			var scaleMat = new THREE.Matrix4();
			scaleMat.scale( scaleVec );
			scaleMat.setPosition( new THREE.Vector3(0, gridUnits, 0) );
			geometry.applyMatrix( scaleMat );

			var object = new PlayerStartPoint( geometry, baseMaterial, highlightMaterial, color, abilities );

			var body = loadBoxBody( gridUnits, gridUnits, gridUnits );
			object.position.copy( position );
			object.quaternion.copy( quaternion );
			object.addBody( body );

			callback( object );
		};

		this.load = function( ) {
			jsonLoader.load( "objects/bronco.json", onLoad );	
		};
	}

	PortalLoader = function( inPosition, inQuaternion, inColor, inCallback, inAbilities, inAttributes ) {
		var position = inPosition;
		var quaternion = inQuaternion;
		var color = inColor;
		var callback = inCallback;
		var abilities = inAbilities;
		var attributes = inAttributes;


		this.load = function( ) {
			var boxWidth = gridUnits;
			var geometry = new THREE.BoxGeometry( 3 * boxWidth, 5 * boxWidth, boxWidth );
			var portalShader = THREE.ShaderLib[ "portal" ];
			var portalUniforms = THREE.UniformsUtils.clone( portalShader.uniforms );

			var material = new THREE.ShaderMaterial( { 
				fragmentShader: portalShader.fragmentShader, 
				vertexShader: portalShader.vertexShader, 
				uniforms: portalUniforms
			} );

			var portal = new Portal( geometry, material, color, abilities, attributes );
			portal.position.copy( position );
			portal.quaternion.copy( quaternion );


			callback( portal );	
		};
	}


	ItemLoader = function( inPosition, inQuaternion, type, inCallback, inColor ) {
		var position = inPosition;
		var quaternion = inQuaternion;
		var color = inColor;
		var callback = inCallback;


		this.load = function( ) {
			var mass = 1.0;
			var itemRadius = gridUnits/3;
			itemShape = new CANNON.Sphere( itemRadius );
			itemBody = new CANNON.Body({ mass: mass, material: physicsMaterial });
			itemBody.addShape( itemShape );
			itemBody.linearDamping = 0.999;

			var textureCube = THREE.ImageUtils.loadTextureCube( [], THREE.CubeRefractionMapping );
			var itemGeometry = new THREE.SphereGeometry( itemRadius, 32, 32);
			var itemMaterial = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, envMap: textureCube, refractionRatio: 0.8, transparent: true, opacity: 0.6  }  );
		
			var item = new Item( itemGeometry, itemMaterial, type, color );

			itemBody.position.x = position.x;
			itemBody.position.y = position.y;
			itemBody.position.z = position.z;

			if ( type == "box" ) {
				var boxWidth = gridUnits/3;
				var boxGeometry = new THREE.BoxGeometry( boxWidth, boxWidth, boxWidth );
				var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );

				var boxMaterial = new THREE.MeshBasicMaterial( { color: color, map: texture } );
				var box = new THREE.Mesh( boxGeometry, boxMaterial );
				box.transparent = true;
				item.addMini( box );
			}

			item.position.copy( position );
			item.quaternion.copy( quaternion );
			item.addBody( itemBody );

			callback( item );
		};
	}

	this.loadObjectToScene = function( inCallback, type, color, position, quaternion, abilities, attributes ) {
		if ( type === "passiveBlock" ) {
			passiveBlockLoader = new PassiveBlockLoader( position, quaternion, color, inCallback, abilities );
			passiveBlockLoader.load();
		} else if ( type === "rotateBlock" ) {
			rotateBlockLoader = new RotateBlockLoader( position, quaternion, color, inCallback, abilities, attributes );
			rotateBlockLoader.load();
		} else if ( type === "portal" ) {
			portalLoader = new PortalLoader( position, quaternion, color, inCallback, abilities, attributes );
			portalLoader.load();
		} else if ( type === "playerStartPoint" ) {
			playerStartPointLoader = new PlayerStartPointLoader( position, quaternion, color, inCallback, abilities );
			playerStartPointLoader.load();
		}
	};

	this.loadItemToScene = function( position, quaternion, inCallback, type, color ) {
		itemLoader = new ItemLoader( position, quaternion, type, inCallback, color );
		itemLoader.load();
	}

	this.addToScene = function( object ) {
		object.useBaseMaterial();
		environment.addPuzzleObject( object );
		object.addBodyToWorld();
		object.matrixWorldNeedsUpdate = true;
		if ( object.objectType === "crystal" ) { object.deactivate(); }
		scene.add( object );
		environment.puzzleNeedsUpdate();
	};

};

Loader.prototype.constructor = Loader;
