var KeyHandler = function() {
	var editing = false;
	var shiftKeyDown = false;
	var worldPaused = true;
	var playerControls, objectControls;

	this.init = function() {
		playerControls = player.getControls();
		objectControls = player.getObjectControls();
		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );
	}

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 16: //SHIFT
			playerControls.moveForward = false;
			playerControls.moveLeft = false;
			playerControls.moveBackward = false;
			playerControls.moveRight = false;
			shiftKeyDown = true;
			break;

		    case 87: // w
		    if ( shiftKeyDown === true ) {
		    	objectControls.upArrowDown = true;
		    } else {
		    	playerControls.moveForward = true;
		    }
			break;

		    case 65: // a
		    if ( shiftKeyDown === true ) {
		    	objectControls.leftArrowDown = true;
		    } else {
				playerControls.moveLeft = true;
			}
			break;

		    case 83: // s
		    if ( shiftKeyDown === true ) {
		    	objectControls.downArrowDown = true;
		    } else {
				playerControls.moveBackward = true;
			}
			break;

		    case 68: // d
		    if ( shiftKeyDown === true ) {
		    	objectControls.rightArrowDown = true;
		    } else {
				playerControls.moveRight = true;
			}
			break;

		    case 32: // space
			playerControls.jump();
			break;

			case 48: //0
				player.inventory.moveToIndex( 0 );
			break;
		
			case 49: //1
				player.inventory.moveToIndex( 1 );
			break;

			case 50: //2
				player.inventory.moveToIndex( 2 );
			break;

			case 51: //3
				player.inventory.moveToIndex( 3 );
			break;
		
			case 52: //4
				player.inventory.moveToIndex( 4 );
			break;

			case 53: //5
				player.inventory.moveToIndex( 5 );
			break;
					
			case 54: //6
				player.inventory.moveToIndex( 6 );
			break;
		
			case 55: //7
				player.inventory.moveToIndex( 7 );
			break;

			case 56: //8
				player.inventory.moveToIndex( 8 );
			break;

			case 57: //9
				player.inventory.moveToIndex( 9 );
			break;

		    case 70: // f
			toggleEditMode();
			break;

		    case 80: // p
			togglePauseWorld();
			break;

		    case 79: // o
			levelHandler.saveLevel();
			break;

		    //case 76: // l
			//levelHandler.loadLevel();
			//break;
		}
	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 16: //SHIFT
			objectControls.leftArrowDown = false;
			objectControls.upArrowDown = false;
			objectControls.downArrowDown = false;
			objectControls.rightArrowDown = false;
			shiftKeyDown = false;
			break;


		    case 87: // w
		    objectControls.upArrowDown = false;
			playerControls.moveForward = false;
			break;

		    case 65: // a
		    objectControls.leftArrowDown = false;
			playerControls.moveLeft = false;
			break;

		    case 83: // a
		    objectControls.downArrowDown = false;
			playerControls.moveBackward = false;
			break;

		    case 68: // d
		    objectControls.rightArrowDown = false;
			playerControls.moveRight = false;
			break;

		}
	};


	var toggleEditMode = function() {
		if ( editing == false ) {
			enterEditMode();
			editing = true;
		} else {
			enterPlayMode();
			editing = false;
		}
	}

	var enterEditMode = function() {
		world.gravity.set( 0, 0, 0 );
		player.changeToEditMode( );
	}

	var enterPlayMode = function() {
		world.gravity.set(0,-70 * gridUnits ,0);;
		player.changeToPlayMode( );
	}

	var togglePauseWorld = function() {
		if ( worldPaused == true ) {
			environment.unpauseWorld();
			worldPaused = false;
		} else {
			environment.pauseWorld();
			worldPaused = true;
		}
	}

	this.init();
};
