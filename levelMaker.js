var LevelMaker = function() {
	var boxes = [];
	var slabs = [];
	var editMode = false;

	this.loadLevel = function( objects ) {
		objects.forEach( 
			function(o) {
				var p = new THREE.Vector3( o.position.x,
							   o.position.y,
							   o.position.z );
				if ( o.objectType == 'box' && editMode == false ) {
					var box = new Box( p, o.objectColor );
					boxes.push( box );
				} else {
					var q = new THREE.Quaternion( o.quaternion._x, 
								      o.quaternion._y,
								      o.quaternion._z,
								      o.quaternion._w );
					if ( editMode == false ) {
						if ( o.objectType != "playerStartPoint" ) {
							var canRotate = true;
							var canHighlight = true;
							var canRemove = false;
							var canUpdate = true;
							var abilities = new Abilities( canRotate, canHighlight, canRemove, canUpdate );
							var attributes = o.attributes;
							loader.loadObjectToScene( loader.addToScene, o.objectType, o.objectColor, p, q, abilities, attributes );
						}
					} else {
						var canRotate = true;
						var canHighlight = true;
						var canRemove = true;
						var canUpdate = true;
						var abilities = new Abilities( canRotate, canHighlight, canRemove, canUpdate );
						var attributes = o.attributes;
						loader.loadObjectToScene( loader.addToScene, o.objectType, o.objectColor, p, q, abilities, attributes );
					}
					if ( o.objectType == "playerStartPoint") {
						player.changePosition( o.position );
						player.changeRotation( new THREE.Quaternion( o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w ) );
					}
				}
			}
		);
		if ( editMode == false ) {
			parseBoxes();
		}
	};

	var parseBoxes = function() {
		while ( boxes.length > 0 ) { 
			var slabBoxes = getSlabBoxes( boxes[0] );
			var slab = new Slab( slabBoxes, slabBoxes[0].color );
			slabs.push( slab );
			for ( var i = 0; i < slabBoxes.length; i++ ) {
				var index = boxes.indexOf( slabBoxes[i] );
				if (index > -1) {
				    boxes.splice(index, 1);
				}
			}

		}
		
		for ( var s = 0; s < slabs.length; s++ ) {
			var canRotate, canHightlight, canRemove, canUpdate;
			if ( slabs[s].color === white ) {
				canRotate = false;
				canHighlight = false;
				canRemove = false;
				canUpdate = false;
			} else {
				canRotate = false;
				canHighlight = false;
				canRemove = false;
				canUpdate = true;
			}
			var abilities = new Abilities( canRotate, canHighlight, canRemove, canUpdate );
			loader.loadSlabToScene( loader.addToScene, slabs[s].color, slabs[s].position, new THREE.Quaternion(), slabs[s].xLength, slabs[s].yLength, slabs[s].zLength, abilities );
		}

	};

	

	var getSlabBoxes = function( seedBox ) {
		var boxRowRight = seedBox.getBoxesInDirection( right );
		var boxRowLeft = seedBox.getBoxesInDirection( left );
		var boxRow = [ seedBox ].concat( boxRowLeft.concat( boxRowRight ) );

		var boxRectUp = getBoxRectangleInDirection( boxRow, up );
		var boxRectDown = getBoxRectangleInDirection( boxRow, down );
		var boxRect = boxRow.concat( boxRectUp.concat( boxRectDown ) );

		var boxPrismFront = getBoxRectangleInDirection( boxRect, front );
		var boxPrismBack = getBoxRectangleInDirection( boxRect, back );
		var boxPrism = boxPrismFront.concat( boxRect.concat( boxPrismBack ) );

		return boxPrism;
	};

	var getBoxRectangleInDirection = function( boxRow, direction ) {
		var minBoxColLength = Infinity;
		var boxRect = [];
		for ( var r = 0; r < boxRow.length; r++ ) {
			var boxCol = boxRow[r].getBoxesInDirection( direction );

			if ( boxCol.length < minBoxColLength ) { minBoxColLength = boxCol.length; }
			boxRect[r] = boxCol;
		}

		var boxRectArray = [];
		for ( var r = 0; r < boxRow.length; r++ ) { boxRectArray = boxRectArray.concat( boxRect[r].slice( 0, minBoxColLength ) ); }

		return boxRectArray;
	};

	var Slab = function( inBoxes, inColor ) {
		var scope = this;
		var boxes = inBoxes;
		scope.color = inColor;

		scope.xLength = 0;
		scope.yLength = 0;
		scope.zLength = 0;
		scope.position = new THREE.Vector3();
				
		var init = function() {
			var maxX = boxes[0].position.x;
			var minX = boxes[0].position.x;
			var maxY = boxes[0].position.y;
			var minY = boxes[0].position.y;
			var maxZ = boxes[0].position.z;
			var minZ = boxes[0].position.z;

			for ( var b = 0; b < boxes.length; b++ ) {
				if ( boxes[b].position.x > maxX ) { maxX = boxes[b].position.x; }
				if ( boxes[b].position.x < minX ) { minX = boxes[b].position.x; }
				if ( boxes[b].position.y > maxY ) { maxY = boxes[b].position.y; }
				if ( boxes[b].position.y < minY ) { minY = boxes[b].position.y; }
				if ( boxes[b].position.z > maxZ ) { maxZ = boxes[b].position.z; }
				if ( boxes[b].position.z < minZ ) { minZ = boxes[b].position.z; }
			}

			var x = (maxX + minX)/2;
			var y = (maxY + minY)/2;
			var z = (maxZ + minZ)/2;
			scope.position.copy( new THREE.Vector3( x, y, z ) );
			scope.xLength = maxX - minX + gridUnits;
			scope.yLength = maxY - minY + gridUnits;
			scope.zLength = maxZ - minZ + gridUnits;
		};

		init();
	};

	var Box = function( inPosition, inColor ) {
		this.position = inPosition;
		this.color = inColor;

		this.getBoxesInDirection = function( direction ) {
			var lineOfBoxes = [];
			var adjacentBoxPosition = this.position.clone().add( direction.clone().multiplyScalar( gridUnits ) );
			for ( var b = 0; b < boxes.length; b++ ) {
				if ( boxes[b].color == this.color &&
				     boxes[b].position.x < adjacentBoxPosition.x + eps && boxes[b].position.x > adjacentBoxPosition.x - eps &&
				     boxes[b].position.y < adjacentBoxPosition.y + eps && boxes[b].position.y > adjacentBoxPosition.y - eps &&
				     boxes[b].position.z < adjacentBoxPosition.z + eps && boxes[b].position.z > adjacentBoxPosition.z - eps) {
					lineOfBoxes.push( boxes[b] );
					lineOfBoxes = lineOfBoxes.concat( boxes[b].getBoxesInDirection( direction ) );
					break;
				}
			}
			return lineOfBoxes;
		}

	};
}
