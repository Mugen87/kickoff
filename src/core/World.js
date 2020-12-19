/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Mesh, Scene, PerspectiveCamera, CylinderBufferGeometry, ConeBufferGeometry, PlaneBufferGeometry, SphereBufferGeometry, AmbientLight, DirectionalLight, WebGLRenderer, MeshPhongMaterial, sRGBEncoding, PCFSoftShadowMap, AxesHelper, MeshBasicMaterial, PlaneHelper, CanvasTexture } from 'three';
import { EntityManager, Time, Vector3 } from 'yuka';

import AssetManager from './AssetManager.js';
import Ball from '../entities/Ball.js';
import Goal from '../entities/Goal.js';
import Pitch from '../entities/Pitch.js';
import Team from '../entities/Team.js';
import { TEAM } from './Constants.js';

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
		this.teamRedMesh = null;
		this.teamBlueMesh = null;

		//

		this.pitchDimension = {
			width: 20,
			height: 15
		};

		this.goalDimensions = {
			width: 2,
			height: 1
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

		const goalGeometry = new PlaneBufferGeometry( this.goalDimensions.width, this.goalDimensions.height );
		goalGeometry.rotateY( Math.PI * - 0.5 );
		goalGeometry.translate( 0, 0.5, 0 );
		const goalMaterial = new MeshPhongMaterial( { color: 0xffff00 } );

		this.goalMesh = new Mesh( goalGeometry, goalMaterial );
		this.goalMesh.matrixAutoUpdate = false;

		//

		const bodyGeometry = new CylinderBufferGeometry( 0.2, 0.2, 1, 16 );
		const headGeometry = new ConeBufferGeometry( 0.2, 0.2, 16 );
		headGeometry.rotateX( Math.PI * 0.5 );
		headGeometry.translate( 0, 0.3, 0.3 );

		const teamRedMaterial = new MeshPhongMaterial( { color: 0xff0000 } );
		const teamBlueMaterial = new MeshPhongMaterial( { color: 0x0000ff } );

		this.teamRedMesh = new Mesh( bodyGeometry, teamRedMaterial );
		this.teamRedMesh.matrixAutoUpdate = false;
		this.teamBlueMesh = new Mesh( bodyGeometry, teamBlueMaterial );
		this.teamBlueMesh.matrixAutoUpdate = false;

		const coneRed = new Mesh( headGeometry, teamRedMaterial );
		coneRed.matrixAutoUpdate = false;
		const coneBlue = new Mesh( headGeometry, teamBlueMaterial );
		coneBlue.matrixAutoUpdate = false;

		this.teamRedMesh.add( coneRed );
		this.teamBlueMesh.add( coneBlue );

	}

	_initGame() {

		const goalRed = this._createGoal( this.goalDimensions.width, this.goalDimensions.height );
		goalRed.position.x = 10;
		this.entityManager.add( goalRed );

		const goalBlue = this._createGoal( this.goalDimensions.width, this.goalDimensions.height );
		goalBlue.position.x = - 10;
		goalBlue.rotation.fromEuler( 0, Math.PI, 0 );
		this.entityManager.add( goalBlue );

		const pitch = this._createPitch( this.pitchDimension.width, this.pitchDimension.height );
		this.entityManager.add( pitch );

		const ball = this._createBall( pitch );
		this.entityManager.add( ball );

		const teamRed = this._createTeam( ball, pitch, goalRed, goalBlue, TEAM.RED );
		this.entityManager.add( teamRed );

		const teamBlue = this._createTeam( ball, pitch, goalBlue, goalRed, TEAM.BLUE );
		this.entityManager.add( teamBlue );

		teamRed.opposingTeam = teamBlue;
		teamBlue.opposingTeam = teamRed;

		// temp

		teamRed.setupTeamPositions();
		teamBlue.setupTeamPositions();

		teamRed.children[ 0 ].position.set( 5, 0, 0 );
		teamRed.returnAllFieldPlayersToHome( true );

		this._debugPitch( pitch );

		setTimeout( () => {

			ball.kick( new Vector3( 0, 0, 2 ) );

		}, 1000 );

	}

	_createBall( pitch ) {

		const ball = new Ball( pitch );
		const ballMesh = this.ballMesh.clone();
		ball.setRenderComponent( ballMesh, sync );

		this.scene.add( ballMesh );

		return ball;

	}

	_createGoal( width, height ) {

		const goal = new Goal( width, height );
		const goalMesh = this.goalMesh.clone();
		goal.setRenderComponent( goalMesh, sync );

		this.scene.add( goalMesh );

		return goal;

	}

	_createPitch( width, height ) {

		const pitch = new Pitch( width, height );
		const pitchMesh = this.pitchMesh.clone();
		pitch.setRenderComponent( pitchMesh, sync );

		this.scene.add( pitchMesh );

		return pitch;

	}

	_createTeam( ball, pitch, homeGoal, opposingGoal, color ) {

		const team = new Team( color, ball, pitch, homeGoal, opposingGoal );

		const baseMesh = ( color === TEAM.RED ) ? this.teamRedMesh : this.teamBlueMesh;

		for ( let i = 0, l = team.children.length; i < l; i ++ ) {

			const player = team.children[ i ];
			const playerMesh = baseMesh.clone();
			player.setRenderComponent( playerMesh, sync );
			this.scene.add( playerMesh );

		}

		return team;

	}

	_debugPitch( pitch ) {

		// regions

		const regions = pitch.regions;

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const canvas = document.createElement( 'canvas' );
			const context = canvas.getContext( '2d' );

			canvas.width = 128;
			canvas.height = 128;

			context.fillStyle = '#ffffff';
			context.fillRect( 0, 0, canvas.width, canvas.height );

			context.fillStyle = "#000000";
			context.font = '24px Arial';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText( `ID: ${i}`, canvas.width / 2, canvas.height / 2 );

			const geometry = new PlaneBufferGeometry( region.width, region.height );
			const material = new MeshBasicMaterial( { color: 0xffffff * Math.random(), map: new CanvasTexture( canvas ), polygonOffset: true, polygonOffsetFactor: - 4 } );
			const mesh = new Mesh( geometry, material );

			mesh.position.copy( region.center );
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
