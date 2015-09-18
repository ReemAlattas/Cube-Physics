HUD = function () {
	var cameraOrtho, sceneOrtho;
	var items = [];

	this.init = function() {
		var width = window.innerWidth / 2;
		var height = window.innerHeight / 2;

		cameraOrtho = new THREE.OrthographicCamera( - width, width, height, - height, 1, 10 );

		cameraOrtho.position.z = 10;
		sceneOrtho = new THREE.Scene();
		THREE.ImageUtils.loadTexture( "textures/hud/reticle.png", undefined, onReticleLoad );
	};

	var onReticleLoad = function( texture ) {
		var material = new THREE.SpriteMaterial( { map: texture } );

		iconWidth = material.map.image.width;
		iconHeight = material.map.image.height;

		icon = new THREE.Sprite( material );
		icon.scale.set( iconWidth, iconHeight, 1 );
		sceneOrtho.add( icon );
		
		icon.position.set( 0, 0, 1 );
		
	};


	this.syncWithInventory = function( inInventory ) {
		var types = inInventory.getTypesArray();
		var quantities = inInventory.getQuantitiesArray();
		var colors = inInventory.getColorsArray();
		var i;
		for ( i = 0; i < types.length; i++ ) {
			var item = new hudItem( types[i], colors[i], quantities[i], i );
			items.push( item );
			if ( types[i] !== "none" ) {
				item.addToScene();
			}
		}
	};

	this.setHighlightItem = function( index ) {
		if ( items.length !== 0 ) {
			items.forEach( 
				function(i) {
					i.unhighlight();
				}
			);

			items[index].highlight();
		}
	};

	this.updateItem = function( index, newQuantity ) {
		items[index].changeQuantity( newQuantity );
	};

	hudItem = function( inType, inColor, inQuantity, inIndex ) {
		var scope = this;
		var type = inType;
		var color = inColor;
		var quantity = inQuantity;
		var index = inIndex;
		var iconWidth, iconHeight;
		var numberWidth, numberHeight;
		var icon, number;

		var onIconLoad = function( texture ) {
			var material = new THREE.SpriteMaterial( { map: texture } );
			material.color = new THREE.Color( color );

			iconWidth = material.map.image.width;
			iconHeight = material.map.image.height;

			icon = new THREE.Sprite( material );
			icon.scale.set( iconWidth, iconHeight, 1 );
			sceneOrtho.add( icon );
			
			icon.position.set( -width + iconWidth/2,
					   height/2 - index * iconHeight,
					   1 );
			
		};

		var onNumberLoad = function( texture ) {
			var material = new THREE.SpriteMaterial( { map: texture } );

			numberWidth = material.map.image.width;
			numberHeight = material.map.image.height;

			number = new THREE.Sprite( material );
			number.scale.set( numberWidth, numberHeight, 1 );
			sceneOrtho.add( number );


			number.position.set( -width - numberWidth/2 + 64,
					     height/2 - index * 64 - 32 + numberHeight/2,
					     1.1 );
		};

		this.highlight = function() {
			if ( icon ) {
				icon.material.color = new THREE.Color( yellow );
			}
		};

		this.unhighlight = function() {
			if ( icon ) {
				icon.material.color = new THREE.Color( color );
			}
		};

		this.setPosition = function() {
			if ( icon ) {
			icon.position.set( -width + iconWidth/2,
					   height/2 - index * iconHeight,
					   1 );
			}

			if ( number ) {
			number.position.set( -width - numberWidth/2 + 64,
					     height/2 - index * 64 - 32 + numberHeight/2,
					     1.1 );
			}
		};

		this.changeQuantity = function( newQuantity ) {
			quantity = newQuantity;
			var numberPath = "textures/hud/" + quantity.toString() + ".png";
			sceneOrtho.remove( number );
			THREE.ImageUtils.loadTexture( numberPath, undefined, onNumberLoad );
		};

		this.addToScene = function() {
			THREE.ImageUtils.loadTexture( "textures/hud/itemIcon.png", undefined, onIconLoad );
			var numberPath = "textures/hud/" + quantity.toString() + ".png";
			THREE.ImageUtils.loadTexture( numberPath, undefined, onNumberLoad );
		};

	};

	this.onWindowResize = function() {
		cameraOrtho.left = - width;
		cameraOrtho.right = width;
		cameraOrtho.top = height;
		cameraOrtho.bottom = - height;
		cameraOrtho.updateProjectionMatrix();

		var i;
		for ( i = 0; i < items.length; i++ ) {
			items[i].setPosition();
		}

	};

	this.render = function() {
		renderer.render( sceneOrtho, cameraOrtho );
	};
};
HUD.prototype.constructor = HUD;
