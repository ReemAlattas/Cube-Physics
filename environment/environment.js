Environment = function( scene ) {
	var scope = this;
	var sky, floorPlane;
	this.chunkSize = 25;

	var puzzleObjects = [];
	var mode = 'play';

	this.init = function() {
		initAmbientLight();
		initSky();
		initFloor();
	};

	var initSky = function() {
		sky = new Sky();
		sky.init();
	};

	var initAmbientLight = function() {
		var ambientLight = new THREE.AmbientLight( 0xFFFFFF );
		scene.add( ambientLight );
	};

	var initFloor = function() {

		var floorSize = 100;
		var texGridDim = 100;
		var nGrids = floorSize/texGridDim;
		var geometry = new THREE.PlaneBufferGeometry( floorSize, floorSize, nGrids, nGrids);
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

		floorPlane = new THREE.Mesh( geometry );

		var texture = THREE.ImageUtils.loadTexture( 'textures/saltFlats.png' );
		texture.anisotropy = renderer.getMaxAnisotropy();
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.x = texGridDim;
		texture.repeat.y = texGridDim;
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;
	
		var bumpMap = THREE.ImageUtils.loadTexture('textures/saltFlatsBumpMap.png')
		bumpMap.anisotropy = renderer.getMaxAnisotropy();
		bumpMap.wrapS = THREE.RepeatWrapping;
		bumpMap.wrapT = THREE.RepeatWrapping;
		bumpMap.repeat.x = texGridDim;
		bumpMap.repeat.y = texGridDim;

		var material = new THREE.MeshPhongMaterial( { map: texture, bumpMap: bumpMap, bumpScale: .05 } );

		floorPlane.material = material;

		var canRotate = false;
		var canHighlight = false;
		var canRemove = false;
		var canUpdate = false;
		var isDynamic = false;
		var abilities = new Abilities( canRotate, canHighlight, canRemove, canUpdate, isDynamic );
		floorPlane.abilities = abilities;

		floorPlane.visible = true;
		scene.add( floorPlane );
		floorPlane.name = "floor";
		puzzleObjects.push(floorPlane);

		var floorBody = new CANNON.Body({ mass: 0, material: objectMaterial });
        var floorShape = new CANNON.Plane();
        floorBody.addShape( floorShape );
        floorBody.quaternion.setFromVectors( new CANNON.Vec3( 0, 0, 1), new CANNON.Vec3( 0, 1, 0) );
        world.add( floorBody );
	};

	this.unpauseWorld = function() {
		puzzleObjects.forEach( function( o ) {
			if ( o.abilities.isDynamic == true ) o.onWorldUnpause();
		});
	};

	this.pauseWorld = function() {
		puzzleObjects.forEach( function( o ) {
			if ( o.abilities.isDynamic == true ) o.onWorldPause();
		});
	};

	this.intersectPuzzleObjects = function( rCaster ) {
		var intersects = rCaster.intersectObjects( puzzleObjects, true );
		return intersects;
	}; 

	this.getPuzzleObjects = function() {
		return puzzleObjects;
	};

	this.addPuzzleObject = function( obj ) {
		puzzleObjects.push( obj );

	};

	this.removePuzzleObject = function( obj ) {
		var index = puzzleObjects.indexOf( obj );
		if (index > -1) {
			var body = puzzleObjects[index].getBody();
			if ( body != null ) world.remove( body ); 
			scene.remove( obj );
			puzzleObjects.splice(index, 1);
			var smallPerturbation = new THREE.Vector3( gridUnits * (0.33 - Math.random() ),  gridUnits * (0.33 - Math.random() ),  gridUnits * (0.33 - Math.random() ) );
			var itemDropPos = new THREE.Vector3();
			itemDropPos.copy( obj.position ).add( smallPerturbation );
			var itemColor = obj.color;
			itemType = obj.objectType;

			loader.loadItemToScene( itemDropPos, new THREE.Quaternion(), onItemLoad, itemType, itemColor );

			updateScene = true;
		}

	};

	var onItemLoad = function( item ) {
		item.addBodyToWorld();
		scene.add( item );
		puzzleObjects.push( item );
	};

	this.removeItem = function( item ) {
		var index = puzzleObjects.indexOf( item );
		if (index > -1) {
			world.remove( puzzleObjects[index].getBody() ); 
			scene.remove( item );
			puzzleObjects.splice(index, 1);
		}
	};

	this.update = function( delta ) {
		for ( var i = 0; i < puzzleObjects.length; i++ ) {
			if ( puzzleObjects[i].name == "GameObject" || puzzleObjects[i].name == "item") {
				puzzleObjects[i].update();
			}
		}
		sky.render( delta );
	}
};
