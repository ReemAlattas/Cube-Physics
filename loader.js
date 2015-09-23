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

		var onLoad = function( geometry, materials ) {
			var scaleVec = new THREE.Vector3( gridUnits/2, gridUnits/2, gridUnits/2 );
			var scaleMat = new THREE.Matrix4();
			scaleMat.scale( scaleVec );
			geometry.applyMatrix( scaleMat );
			geometry.mergeVertices();
			geometry.computeVertexNormals();
			geometry.computeFaceNormals();

			var texture = THREE.ImageUtils.loadTexture( 'textures/passiveCubelet.png' );
			var baseMaterial = new THREE.MeshPhongMaterial( { color: color, shading: THREE.SmoothShading, shininess: 15, specular: 0xFFFF66, map: texture } );
			baseMaterial.transparent = false;
			var highlightMaterial = new THREE.MeshPhongMaterial( { emissive: 0x66FFFF, map: texture } );
			var passiveBlock = new PassiveBlock( geometry, baseMaterial, highlightMaterial, color, abilities );

			var pickerMesh = new THREE.Mesh( new THREE.BoxGeometry( gridUnits, gridUnits, gridUnits ), new THREE.MeshBasicMaterial() );
			pickerMesh.visible = false;
			passiveBlock.add( pickerMesh );
			passiveBlock.pickerMesh = pickerMesh;

			passiveBlock.position.copy( position );
			passiveBlock.quaternion.copy( quaternion );
			callback( passiveBlock );	

		}

		this.load = function() {
			jsonLoader.load( "objects/cubelet.json", onLoad );	
		}
	}

	RotateBlockLoader = function( inPosition, inQuaternion, inColor, inCallback, inAbilities ) {
		var position = inPosition;
		var quaternion = inQuaternion;
		var color = inColor;
		var callback = inCallback;
		var abilities = inAbilities;
		var rotateBlock;

		var onLoadSpinner = function( geometry, materials ) {
			var scaleVec = new THREE.Vector3( gridUnits/2.9, gridUnits/2.9, gridUnits/2.9 );
			var scaleMat = new THREE.Matrix4();
			scaleMat.scale( scaleVec );
			geometry.applyMatrix( scaleMat );
			geometry.mergeVertices();
			geometry.computeVertexNormals();
			geometry.computeFaceNormals();

			var texture = THREE.ImageUtils.loadTexture( 'textures/rotateCubeletSpinner.png' );
			var material = new THREE.MeshPhongMaterial( { color: color, shading: THREE.SmoothShading, shininess: 15, specular: 0xFFFF66, side: THREE.BackSide, map: texture } );
			var spinner = new THREE.Mesh( geometry, material );
			spinner.objectType = "spinner";
			spinner.position.copy( up.clone().multiplyScalar( gridUnits/2 ) );
			rotateBlock.addSpinner( spinner );
			
			callback( rotateBlock );	
		}

		var onLoadCubelet = function( geometry, materials ) {
			var scaleVec = new THREE.Vector3( gridUnits/2, gridUnits/2, gridUnits/2 );
			var scaleMat = new THREE.Matrix4();
			scaleMat.scale( scaleVec );
			geometry.applyMatrix( scaleMat );
			geometry.mergeVertices();
			geometry.computeVertexNormals();
			geometry.computeFaceNormals();

			var texture = THREE.ImageUtils.loadTexture( 'textures/rotateCubelet.png' );
			var baseMaterial = new THREE.MeshPhongMaterial( { color: color, shading: THREE.SmoothShading, shininess: 15, specular: 0xFFFF66, map: texture } );
			baseMaterial.transparent = false;
			var highlightMaterial = new THREE.MeshPhongMaterial( { emissive: 0x66FFFF, map: texture } );
			rotateBlock = new RotateBlock( geometry, baseMaterial, highlightMaterial, color, abilities );
			rotateBlock.position.copy( position );
			rotateBlock.quaternion.copy( quaternion );

			var pickerMesh = new THREE.Mesh( new THREE.BoxGeometry( gridUnits, gridUnits, gridUnits ), new THREE.MeshBasicMaterial() );
			pickerMesh.visible = false;
			rotateBlock.add( pickerMesh );
			rotateBlock.pickerMesh = pickerMesh;

			jsonLoader.load( "objects/spinner.json", onLoadSpinner );	
		}

		this.load = function() {
			jsonLoader.load( "objects/cubelet.json", onLoadCubelet );	
		}
	}

	this.loadObjectToScene = function( inCallback, type, color, position, quaternion, abilities, attributes ) {
		if ( type === "passiveBlock" ) {
			passiveBlockLoader = new PassiveBlockLoader( position, quaternion, color, inCallback, abilities );
			passiveBlockLoader.load();
		} else if ( type === "rotateBlock" ) {
			rotateBlockLoader = new RotateBlockLoader( position, quaternion, color, inCallback, abilities, attributes );
			rotateBlockLoader.load();
		}
	};

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
