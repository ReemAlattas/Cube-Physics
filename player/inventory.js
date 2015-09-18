Inventory = function () {
	var objectTypes = [];
	var objectColors = [];
	var objectQuantities = [];
	objectTypes.push( "none" );
	objectColors.push( "none" );
	objectQuantities.push( 0 );
	var selectedIndex = 0;

	var onChangeIndex = function() {
		hud.setHighlightItem( selectedIndex );
	}

	this.moveToIndex = function( inIndex ) {
		if ( inIndex < objectTypes.length ) {
			selectedIndex = inIndex;
			onChangeIndex();
		}
	}

	this.moveToNext = function() {
		if ( selectedIndex >= objectTypes.length - 1 ) { selectedIndex = 0; }
		else { selectedIndex++; }
		onChangeIndex();
	};

	this.moveToPrevious = function() {
		if ( selectedIndex == 0 ) { selectedIndex = objectTypes.length - 1; }
		else { selectedIndex--; }
		onChangeIndex();
	};

	this.getQuantitiesArray = function() {
		return objectQuantities;
	};

	this.getTypesArray = function() {
		return objectTypes;
	};

	this.getColorsArray = function() {
		return objectColors;
	};

	this.getCurrentType = function() {
		return objectTypes[ selectedIndex ];
	};

	this.getCurrentColor = function() {
		return objectColors[ selectedIndex ];
	};

	this.getCurrentQuantity = function() {
		return objectQuantities[ selectedIndex ];
	};

	this.setCurrentObjectToNone = function() {
		selectedIndex = 0;
		onChangeIndex();
	};

	this.incrementQuantity = function( inIndex) {
		if ( objectQuantities[ inIndex ] !== 99 ) {
			objectQuantities[ inIndex ]++;
			hud.updateItem( inIndex, objectQuantities[ inIndex ] );
		}
	};

	this.decrementQuantity = function() {
		if ( objectQuantities[ selectedIndex ] !== 99 ) {
			objectQuantities[ selectedIndex ]--;
			hud.updateItem( selectedIndex, objectQuantities[ selectedIndex ] );
		}
	};

	this.pickupItem = function( item ) {
		var i;
		for ( i = 0; i < objectTypes.length; i++ ) {
			if ( objectTypes[i] == item.objectType && objectColors[i] == item.color ) {
				this.incrementQuantity( i );
				environment.removeItem( item );
			}		
		}
	};

	this.addObject = function( type, color, quantity ) {
		objectTypes.push( type );
		objectColors.push( color );
		objectQuantities.push( quantity );
		
	};
};

Inventory.prototype.constructor = Inventory;
