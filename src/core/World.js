/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Mesh, Scene, PerspectiveCamera, PlaneBufferGeometry, SphereBufferGeometry, AmbientLight, DirectionalLight, WebGLRenderer, MeshPhongMaterial, sRGBEncoding, PCFSoftShadowMap, AxesHelper, MeshBasicMaterial, PlaneHelper } from 'three';
import { EntityManager, Time } from 'yuka';

import AssetManager from './AssetManager.js';
import Ball from '../entities/Ball.js';
import Goal from '../entities/Goal.js';
import Pitch from '../entities/Pitch.js';
import Team from '../entities/Team.js';

class World {

	constructor() {

		this.entityManager = new EntityManager();
		this.time = new Time();

		this.camera = null;
		this.scene = null;
		this.renderer = null;

		this.assetManager = null;

		this.ui = {
			startScreen: document.getElementById( 'start-screen' ),
		};

		//

		this.ballMesh = null;
		this.goalMesh = null;
		this.pitchMesh = null;

		//

		this.pitchDimension = {
			width: 20,
			height: 15
		};

		//

		this._requestID = null;

		this._startAnimation = startAnimation.bind( this );
		this._stopAnimation = stopAnimation.bind( this );
		this._onWindowResize = onWindowResize.bind( this );

	}

	async init() {

		this.assetManager = new AssetManager();

		await this.assetManager.init();

		this._initScene();

		this._initGame();

		this._startAnimation();

		// this.ui.startScreen.remove();

	}

	update() {

		const delta = this.time.update().getDelta();

		// game logic

		this.entityManager.update( delta );

		// rendering

		this.renderer.render( this.scene, this.camera );


	}

	_initScene() {

		// rendering setup

		this.camera = new PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 200 );
		this.camera.position.set( 0, 10, 20 );

		this.scene = new Scene();
		this.camera.lookAt( this.scene.position );

		const ambientLight = new AmbientLight( 0xcccccc, 0.4 );
		ambientLight.matrixAutoUpdate = false;
		this.scene.add( ambientLight );

		const dirLight = new DirectionalLight( 0xffffff, 0.6 );
		dirLight.position.set( 0, 20, 0 );
		dirLight.matrixAutoUpdate = false;
		dirLight.updateMatrix();
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 10;
		dirLight.shadow.camera.bottom = - 10;
		dirLight.shadow.camera.left = - 10;
		dirLight.shadow.camera.right = 10;
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 25;
		dirLight.shadow.mapSize.x = 2048;
		dirLight.shadow.mapSize.y = 2048;
		dirLight.shadow.bias = 0.01;
		this.scene.add( dirLight );

		// this.scene.add( new CameraHelper( dirLight.shadow.camera ) );

		const helper = new AxesHelper( 10 );
		helper.position.y = 0.1;
		this.scene.add( helper );

		this.renderer = new WebGLRenderer( { antialias: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.outputEncoding = sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		document.body.appendChild( this.renderer.domElement );

		window.addEventListener( 'resize', this._onWindowResize, false );

		// render components

		const radius = 0.1;

		const ballGeometry = new SphereBufferGeometry( radius, 16, 16 );
		ballGeometry.translate( 0, radius, 0 );
		const ballMaterial = new MeshPhongMaterial( { color: 0xffffff } );

		this.ballMesh = new Mesh( ballGeometry, ballMaterial );
		this.ballMesh.castShadow = true;
		this.ballMesh.matrixAutoUpdate = false;

		//

		const pitchGeometry = new PlaneBufferGeometry( this.pitchDimension.width, this.pitchDimension.height );
		pitchGeometry.rotateX( Math.PI * - 0.5 );
		const pitchMaterial = new MeshPhongMaterial( { color: 0x00ff00 } );

		this.pitchMesh = new Mesh( pitchGeometry, pitchMaterial );
		this.pitchMesh.receiveShadow = true;
		this.pitchMesh.matrixAutoUpdate = false;

		//

		const goalGeometry = new PlaneBufferGeometry( 2, 1 );
		goalGeometry.rotateY( Math.PI * - 0.5 );
		goalGeometry.translate( 0, 0.5, 0 );
		const goalMaterial = new MeshPhongMaterial( { color: 0xffff00 } );

		this.goalMesh = new Mesh( goalGeometry, goalMaterial );
		this.goalMesh.matrixAutoUpdate = false;

	}

	_initGame() {

		const goalRed = this._createGoal();
		goalRed.position.x = 10;
		this.entityManager.add( goalRed );
		this.scene.add( goalRed._renderComponent );

		const goalBlue = this._createGoal();
		goalBlue.position.x = - 10;
		goalBlue.rotation.fromEuler( 0, Math.PI, 0 );
		this.entityManager.add( goalBlue );
		this.scene.add( goalBlue._renderComponent );

		const pitch = this._createPitch( this.pitchDimension.width, this.pitchDimension.height );
		this.entityManager.add( pitch );
		this.scene.add( pitch._renderComponent );

		const ball = this._createBall( pitch );
		this.entityManager.add( ball );
		this.scene.add( ball._renderComponent );

		const teamRed = this._createTeam( ball, pitch, goalRed, goalBlue );
		this.entityManager.add( teamRed );

		const teamBlue = this._createTeam( ball, pitch, goalBlue, goalRed );
		this.entityManager.add( teamBlue );

		teamRed.opposingTeam = teamBlue;
		teamBlue.opposingTeam = teamRed;

		//this._debugPitch( pitch );

	}

	_createBall( pitch ) {

		const ball = new Ball( pitch );
		const ballMesh = this.ballMesh.clone();
		ball.setRenderComponent( ballMesh, sync );

		return ball;

	}

	_createGoal() {

		const goal = new Goal();
		const goalMesh = this.goalMesh.clone();
		goal.setRenderComponent( goalMesh, sync );

		return goal;

	}

	_createPitch( width, height ) {

		const pitch = new Pitch( width, height );
		const pitchMesh = this.pitchMesh.clone();
		pitch.setRenderComponent( pitchMesh, sync );

		return pitch;

	}

	_createTeam( ball ) {

		const team = new Team( ball );
		return team;

	}

	_debugPitch( pitch ) {

		// regions

		const regions = pitch.regions;

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const geometry = new PlaneBufferGeometry( region.width, region.height );
			const material = new MeshBasicMaterial( { color: 0xffffff * Math.random(), polygonOffset: true, polygonOffsetFactor: - 4, } );
			const mesh = new Mesh( geometry, material );

			mesh.position.set( region.x, 0, region.y );
			mesh.rotation.x = Math.PI * - 0.5;

			this.scene.add( mesh );

		}

		// walls

		const walls = pitch.walls;

		for ( let i = 0, l = walls.length; i < l; i ++ ) {

			const wall = walls[ i ];
			wall.normal.isVector3 = true;

			const helper = new PlaneHelper( wall, ( i < 2 ) ? 20 : 15 );
			this.scene.add( helper );

		}

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

function sync( entity, renderComponent ) {

	renderComponent.matrix.copy( entity.worldMatrix );

}

export default new World();
