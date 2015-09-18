var Sky = function() {
	var sky;
	var sun, sunLight;
	var time = 0;
	var dayLength = 300; //seconds
	var radius = 120;

	this.init = function() {
		sky = new THREE.Sky();

		sky.uniforms.luminance.value = 1;
		sky.uniforms.turbidity.value = 10;
		sky.uniforms.reileigh.value = 2;
		sky.uniforms.mieCoefficient.value = 0.005;
		sky.uniforms.mieDirectionalG.value = 0.8;

		sky.mesh.visible = true;
		scene.add( sky.mesh );


		sun = new THREE.Mesh( new THREE.SphereGeometry( 2, 30, 30 ), new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
		//sun.position.y = radius;
		//sun.visible = true;
		//scene.add( sun );

	}


	this.render = function( delta ) {
		time += delta;
		var phi = 2 * Math.PI * time/dayLength; //azimuth
		var theta = -2 * Math.PI/3 * Math.cos(phi); //polar
		sun.position.z = radius * Math.sin(theta) * Math.cos(phi);
		sun.position.x = radius * Math.sin(theta) * Math.sin(phi); 
		sun.position.y = radius * Math.cos(theta);
		sky.uniforms.sunPosition.value.copy( new THREE.Vector3( sun.position.x, -sun.position.y, sun.position.z ) );
	}
};
