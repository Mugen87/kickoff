/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from 'three';
import * as YUKA from 'yuka';

import { AssetManager } from './AssetManager.js';

class World {

	constructor() {

		this.entityManager = new YUKA.EntityManager();
		this.time = new YUKA.Time();

		this.camera = null;
		this.scene = null;
		this.renderer = null;

		this.assetManager = null;

		this.ui = {
			startScreen: document.getElementById( 'start-screen' ),
		};

		//

		this._requestID = null;

		this._startAnimation = startAnimation.bind( this );
		this._stopAnimation = stopAnimation.bind( this );
		this._onWindowResize = onWindowResize.bind( this );

	}

	async init() {

		this.assetManager = new AssetManager(); // creating the asset manager here to avoid a web audio context warning

		await this.assetManager.init();

		this._initScene();

		this._startAnimation();

		this.ui.startScreen.remove();

	}

	update() {

		const delta = this.time.update().getDelta();

		// game logic

		this.entityManager.update( delta );

		// rendering

		this.renderer.render( this.scene, this.camera );


	}

	_initScene() {

		// camera

		this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 200 );
		this.camera.position.set( 0, 20, 20 );

		// scene

		this.scene = new THREE.Scene();
		this.camera.lookAt( this.scene.position );

		// lights

		const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
		ambientLight.matrixAutoUpdate = false;
		this.scene.add( ambientLight );

		const dirLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
		dirLight.position.set( 1, 10, - 1 );
		dirLight.matrixAutoUpdate = false;
		dirLight.updateMatrix();
		this.scene.add( dirLight );

		// this.scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

		// field

		const fieldGeometry = new THREE.PlaneBufferGeometry( 20, 15 );
		const fieldMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

		this.fieldMesh = new THREE.Mesh( fieldGeometry, fieldMaterial );
		this.fieldMesh.matrixAutoUpdate = false;
		this.fieldMesh.rotation.x = Math.PI * - 0.5;
		this.fieldMesh.updateMatrix();
		this.scene.add( this.fieldMesh );

		// renderer

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		document.body.appendChild( this.renderer.domElement );

		// listeners

		window.addEventListener( 'resize', this._onWindowResize, false );

	}

}

function onWindowResize() {

	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );

}

function startAnimation() {

	this._requestID = requestAnimationFrame( this._startAnimation );

	this.update();

}

function stopAnimation() {

	cancelAnimationFrame( this._requestID );

}

export default new World();
