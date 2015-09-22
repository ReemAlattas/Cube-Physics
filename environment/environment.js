Environment = function( scene ) {
	var scope = this;
	var sky, floorPlane;
	this.chunkSize = 25;

	var pickerObjects = [];
	var roots = [];
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
		var ambientLight = new THREE.AmbientLight( 0xAAAAAA );
		scene.add( ambientLight );
	};

	var initFloor = function() {

		var floorSize = 100;
		var texGridDim = 100;
		var nGrids = 5;
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

		var material = new THREE.MeshPhongMaterial( { map: texture, bumpMap: bumpMap, bumpScale: .005 } );

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
		pickerObjects.push(floorPlane);

		var floorBody = new CANNON.Body({ mass: 0, material: objectMaterial });
        var floorShape = new CANNON.Plane();
        floorBody.addShape( floorShape );
        floorBody.quaternion.setFromVectors( new CANNON.Vec3( 0, 0, 1), new CANNON.Vec3( 0, 1, 0) );
        world.add( floorBody );
	};

	this.unpauseWorld = function() {
		pickerObjects.forEach( function( o ) {
			if ( o.abilities.isDynamic == true ) o.onWorldUnpause();
		});
	};

	this.pauseWorld = function() {
		pickerObjects.forEach( function( o ) {
			if ( o.abilities.isDynamic == true ) o.onWorldPause();
		});
	};

	this.intersectPickerObjects = function( rCaster ) {
		var intersects = rCaster.intersectObjects( pickerObjects, true );

		return intersects;
	}; 

	this.getPickerObjects = function() {
		return pickerObjects;
	};

	this.addPickerObject = function( obj ) {
		pickerObjects.push( obj );
	};

	this.addRoot = function( inRoot ) {
		roots.push( inRoot );
	}

	this.removePickerObject = function( obj ) {
		var index = pickerObjects.indexOf( obj );
		if (index > -1) {
			var body = pickerObjects[index].getBody();
			if ( body != null ) world.remove( body ); 
			scene.remove( obj );
			pickerObjects.splice(index, 1);

			updateScene = true;
		}

	};

	this.update = function( delta ) {
		roots.forEach( function( r ) {
			r.update();
		});
		sky.render( delta );
	}
};
