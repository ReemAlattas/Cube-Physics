LevelHandler = function() {

	this.saveLevel = function() {
		var json = [];
		var levelObjects = [];
		var inventoryItems = [];
		var types = player.inventory.getTypesArray();
		var quantities = player.inventory.getQuantitiesArray();
		var colors = player.inventory.getColorsArray();
		var i;
		for ( i = 0; i < types.length; i++ ) {
			var item = 
				{
					"type" : types[i],
					"color" : colors[i],
					"quantity" : quantities[i]
				};
			inventoryItems.push( item );

		}

		environment.getPuzzleObjects().forEach( 
			function(o) {
				if ( o.name == "GameObject" ) {
					var gameObject = 
						{
							"objectType" : o.objectType,
							"objectColor" : o.color,
							"position" : o.position,
							"quaternion" : o.quaternion,
							"attributes" : o.attributes
						};
					levelObjects.push( gameObject );
				}
			}
		);

		json.push( inventoryItems );
		json.push( levelObjects );

		var url = 'data:text/json;charset=utf8,' + encodeURIComponent( JSON.stringify(json) );
		window.open(url, '_blank');
		window.focus();
	};

	this.loadLevel = function( levelPath ) {
		var levelMaker = new LevelMaker();


		player.inventory = new Inventory();
		var success = function( inLevel ) {
			inLevel[0].forEach( //inventory
				function(i) {
					player.inventory.addObject( i.type, i.color, i.quantity );
				}
			);
			hud.syncWithInventory( player.inventory );

			levelMaker.loadLevel( inLevel[1] );
		}

		loadJSON(levelPath,
				 success,
			 	 function(xhr) { console.error(xhr); }
		);

	};
	
	var loadJSON = function(path, success, error) {
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function()
	    {
		if (xhr.readyState === XMLHttpRequest.DONE) {
		    if (xhr.status === 200) {
			if (success)
			    success(JSON.parse(xhr.responseText));
		    } else {
			if (error)
			    error(xhr);
		    }
		}
	    };
	    xhr.open("GET", path, true);
	    xhr.send();
	};

};
