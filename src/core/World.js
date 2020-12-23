/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Mesh, Scene, PerspectiveCamera, CylinderBufferGeometry, ConeBufferGeometry, PlaneBufferGeometry, SphereBufferGeometry, AmbientLight, DirectionalLight, WebGLRenderer, MeshPhongMaterial, sRGBEncoding, PCFSoftShadowMap, AxesHelper, MeshBasicMaterial, PlaneHelper, CanvasTexture, Sprite, SpriteMaterial, Color, Fog } from 'three';
import { EntityManager, Time } from 'yuka';
import * as DAT from 'dat.gui';

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
			goalsBlue: document.getElementById( 'goals-blue' ),
			goalsRed: document.getElementById( 'goals-red' )
		};

		this.debug = true;

		//

		this.pitch = null;

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

		this.debugParameter = {
			'showAxes': false,
			'showWalls': false,
			'showRegions': false,
			'showSupportSpotsBlue': false,
			'showSupportSpotsRed': false,
			'showStatesBlue': false,
			'showStatesRed': false
		};

		this._axesHelper = null;
		this._regionHelpers = [];
		this._wallHelpers = [];
		this._supportingSpotsRedHelpers = [];
		this._supportingSpotsBlueHelpers = [];
		this._statesRedHelpers = [];
		this._statesBlueHelpers = [];

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

		if ( this.debug ) {

			this._initUI();

		}

		this._startAnimation();

	}

	refreshUI() {

		const teamBlue = this.pitch.teamBlue;
		const teamRed = this.pitch.teamRed;

		this.ui.goalsBlue.innerText = teamBlue.goals;
		this.ui.goalsRed.innerText = teamRed.goals;

	}

	update() {

		const delta = this.time.update().getDelta();

		// game logic

		this.entityManager.update( delta );

		// update helpers

		if ( this.debug ) {

			this._updateTeamHelpers( this.pitch.teamBlue, this._supportingSpotsBlueHelpers, this._statesBlueHelpers );
			this._updateTeamHelpers( this.pitch.teamRed, this._supportingSpotsRedHelpers, this._statesRedHelpers );

		}

		// rendering

		this.renderer.render( this.scene, this.camera );


	}

	_createBall( pitch ) {

		const ball = new Ball( pitch );
		const ballMesh = this.ballMesh.clone();
		ball.setRenderComponent( ballMesh, sync );

		this.scene.add( ballMesh );

		return ball;

	}

	_createGoal( width, height, color ) {

		const goal = new Goal( width, height, color );
		const goalMesh = this.goalMesh.clone();
		goal.setRenderComponent( goalMesh, sync );

		this.scene.add( goalMesh );

		return goal;

	}

	_createPitch( width, height, world ) {

		const pitch = new Pitch( width, height, world );
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

	_debugPitch() {

		const pitch = this.pitch;

		const helper = new AxesHelper( 10 );
		helper.visible = false;
		helper.position.y = 0.01;
		this.scene.add( helper );

		this._axesHelper = helper;

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
			const material = new MeshBasicMaterial( { color: 0xffffff * Math.random(), map: new CanvasTexture( canvas ), polygonOffset: true, polygonOffsetFactor: - 1 } );

			const helper = new Mesh( geometry, material );
			helper.visible = false;
			helper.position.copy( region.center );
			helper.rotation.x = Math.PI * - 0.5;
			this.scene.add( helper );

			this._regionHelpers.push( helper );

		}

		// walls

		const walls = pitch.walls;

		for ( let i = 0, l = walls.length; i < l; i ++ ) {

			const wall = walls[ i ];
			wall.normal.isVector3 = true;

			const helper = new PlaneHelper( wall, ( i < 2 ) ? 20 : 15 );
			helper.visible = false;
			this.scene.add( helper );

			this._wallHelpers.push( helper );

		}

	}

	_debugTeam( team, supportSpotsHelpers, statesHelpers ) {

		// support spots

		const spots = team._supportSpotCalculator._spots;

		const spotGeometry = new SphereBufferGeometry( 0.1, 16, 12 );
		spotGeometry.translate( 0, 0.1, 0 );

		for ( let i = 0, l = spots.length; i < l; i ++ ) {

			const spot = spots[ i ];

			const spotMaterial = new MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.6 } );

			const helper = new Mesh( spotGeometry, spotMaterial );
			helper.visible = false;
			helper.position.copy( spot.position );
			this.scene.add( helper );

			supportSpotsHelpers.push( helper );

		}

		// states

		const players = team.children;

		for ( let i = 0, l = players.length; i < l; i ++ ) {

			const player = players[ i ];

			const canvas = document.createElement( 'canvas' );
			const context = canvas.getContext( '2d' );

			canvas.width = 256;
			canvas.height = 64;

			context.fillStyle = '#ffffff';
			context.fillRect( 0, 0, canvas.width, canvas.height );

			context.fillStyle = "#000000";
			context.font = '24px Arial';
			context.textAlign = 'center';
			context.textBaseline = 'middle';

			context.fillText( 'null', canvas.width / 2, canvas.height / 2 );

			const material = new SpriteMaterial( { map: new CanvasTexture( canvas ) } );

			const helper = new Sprite( material );
			helper.visible = false;
			helper.scale.set( 2, 0.5, 1 );
			helper.position.y = 2;

			player._renderComponent.add( helper );

			statesHelpers.push( helper );

		}

	}

	_initScene() {

		// rendering setup

		this.camera = new PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 200 );
		this.camera.position.set( 0, 10, 20 );

		this.scene = new Scene();
		this.scene.background = new Color( 0x94dbe2 );
		this.scene.fog = new Fog( 0x94dbe2, 40, 50 );
		this.camera.lookAt( this.scene.position );

		const ambientLight = new AmbientLight( 0xcccccc, 0.4 );
		ambientLight.matrixAutoUpdate = false;
		this.scene.add( ambientLight );

		const dirLight = new DirectionalLight( 0xffffff, 0.6 );
		dirLight.position.set( 5, 20, - 5 );
		dirLight.matrixAutoUpdate = false;
		dirLight.updateMatrix();
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 15;
		dirLight.shadow.camera.bottom = - 15;
		dirLight.shadow.camera.left = - 15;
		dirLight.shadow.camera.right = 15;
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 25;
		dirLight.shadow.mapSize.x = 2048;
		dirLight.shadow.mapSize.y = 2048;
		dirLight.shadow.bias = 0.01;
		this.scene.add( dirLight );

		this.renderer = new WebGLRenderer( { antialias: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.outputEncoding = sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		document.body.appendChild( this.renderer.domElement );

		window.addEventListener( 'resize', this._onWindowResize, false );

		// ground

		const groundGeometry = new PlaneBufferGeometry( 75, 75 );
		groundGeometry.rotateX( Math.PI * - 0.5 );
		const groundMaterial = new MeshBasicMaterial( { color: new Color( 0xdb8d6e ).convertSRGBToLinear(), depthWrite: false } );
		const groundMesh = new Mesh( groundGeometry, groundMaterial );
		groundMesh.matrixAutoUpdate = false;
		this.scene.add( groundMesh );

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

		const pitchTexture = this.assetManager.textures.get( 'pitchTexture' );
		const pitchMaterial = new MeshPhongMaterial( { map: pitchTexture } );

		this.pitchMesh = new Mesh( pitchGeometry, pitchMaterial );
		this.pitchMesh.receiveShadow = true;
		this.pitchMesh.matrixAutoUpdate = false;

		//

		const goalGeometry = new PlaneBufferGeometry( this.goalDimensions.width, this.goalDimensions.height );
		goalGeometry.translate( 0, 0.5, 0 );
		const goalMaterial = new MeshPhongMaterial( { color: 0xffff00 } );

		this.goalMesh = new Mesh( goalGeometry, goalMaterial );
		this.goalMesh.matrixAutoUpdate = false;

		//

		const bodyGeometry = new CylinderBufferGeometry( 0.2, 0.2, 0.5, 16 );
		bodyGeometry.translate( 0, 0.25, 0 );
		const headGeometry = new ConeBufferGeometry( 0.2, 0.2, 16 );
		headGeometry.rotateX( Math.PI * 0.5 );
		headGeometry.translate( 0, 0.3, 0.3 );

		const teamRedMaterial = new MeshPhongMaterial( { color: 0xff0000 } );
		const teamBlueMaterial = new MeshPhongMaterial( { color: 0x0000ff } );

		this.teamRedMesh = new Mesh( bodyGeometry, teamRedMaterial );
		this.teamRedMesh.castShadow = true;
		this.teamRedMesh.matrixAutoUpdate = false;

		this.teamBlueMesh = new Mesh( bodyGeometry, teamBlueMaterial );
		this.teamBlueMesh.castShadow = true;
		this.teamBlueMesh.matrixAutoUpdate = false;

		const coneRed = new Mesh( headGeometry, teamRedMaterial );
		coneRed.castShadow = true;
		coneRed.matrixAutoUpdate = false;

		const coneBlue = new Mesh( headGeometry, teamBlueMaterial );
		coneBlue.castShadow = true;
		coneBlue.matrixAutoUpdate = false;

		this.teamRedMesh.add( coneRed );
		this.teamBlueMesh.add( coneBlue );

	}

	_initGame() {

		const goalRed = this._createGoal( this.goalDimensions.width, this.goalDimensions.height, TEAM.RED );
		goalRed.rotation.fromEuler( 0, Math.PI * - 0.5, 0 );
		goalRed.position.x = 10;
		this.entityManager.add( goalRed );

		const goalBlue = this._createGoal( this.goalDimensions.width, this.goalDimensions.height, TEAM.BLUE );
		goalBlue.position.x = - 10;
		goalBlue.rotation.fromEuler( 0, Math.PI * 0.5, 0 );
		this.entityManager.add( goalBlue );

		const pitch = this._createPitch( this.pitchDimension.width, this.pitchDimension.height, this );
		this.entityManager.add( pitch );

		const ball = this._createBall( pitch );
		this.entityManager.add( ball );

		const teamRed = this._createTeam( ball, pitch, goalRed, goalBlue, TEAM.RED );
		this.entityManager.add( teamRed );

		const teamBlue = this._createTeam( ball, pitch, goalBlue, goalRed, TEAM.BLUE );
		this.entityManager.add( teamBlue );

		teamRed.opposingTeam = teamBlue;
		teamBlue.opposingTeam = teamRed;

		pitch.ball = ball;
		pitch.teamBlue = teamBlue;
		pitch.teamRed = teamRed;

		this.pitch = pitch;

	}

	_initUI() {

		// prepare visual helpers

		this._debugPitch();
		this._debugTeam( this.pitch.teamBlue, this._supportingSpotsBlueHelpers, this._statesBlueHelpers );
		this._debugTeam( this.pitch.teamRed, this._supportingSpotsRedHelpers, this._statesRedHelpers );

		// setup UI

		const gui = new DAT.GUI( { width: 300 } );
		const params = this.debugParameter;

		const folderPitch = gui.addFolder( 'Pitch' );

		folderPitch.add( params, 'showAxes' ).name( 'show axes' ).onChange( ( value ) => {

			this._axesHelper.visible = value;

		} );

		folderPitch.add( params, 'showRegions' ).name( 'show regions' ).onChange( ( value ) => {

			const helpers = this._regionHelpers;

			for ( let i = 0, l = helpers.length; i < l; i ++ ) {

				helpers[ i ].visible = value;

			}

		} );

		folderPitch.add( params, 'showWalls' ).name( 'show walls' ).onChange( ( value ) => {

			const helpers = this._wallHelpers;

			for ( let i = 0, l = helpers.length; i < l; i ++ ) {

				helpers[ i ].visible = value;

			}

		} );

		folderPitch.open();

		//

		const folderTeamRed = gui.addFolder( 'Team Red' );

		folderTeamRed.add( params, 'showStatesRed' ).name( 'show states' ).onChange( ( value ) => {

			const helpers = this._statesRedHelpers;

			for ( let i = 0, l = helpers.length; i < l; i ++ ) {

				helpers[ i ].visible = value;

			}

		} );

		folderTeamRed.add( params, 'showSupportSpotsRed' ).name( 'show support spots' ).onChange( ( value ) => {

			const helpers = this._supportingSpotsRedHelpers;

			for ( let i = 0, l = helpers.length; i < l; i ++ ) {

				helpers[ i ].visible = value;

			}

		} );

		folderTeamRed.open();

		//

		const folderTeamBlue = gui.addFolder( 'Team Blue' );

		folderTeamBlue.add( params, 'showStatesBlue' ).name( 'show states' ).onChange( ( value ) => {

			const helpers = this._statesBlueHelpers;

			for ( let i = 0, l = helpers.length; i < l; i ++ ) {

				helpers[ i ].visible = value;

			}

		} );

		folderTeamBlue.add( params, 'showSupportSpotsBlue' ).name( 'show support spots' ).onChange( ( value ) => {

			const helpers = this._supportingSpotsBlueHelpers;

			for ( let i = 0, l = helpers.length; i < l; i ++ ) {

				helpers[ i ].visible = value;

			}

		} );

		folderTeamBlue.open();

	}

	_updateTeamHelpers( team, supportSpotsHelpers, statesHelpers ) {

		// support spots

		const spots = team._supportSpotCalculator._spots;

		for ( let i = 0, l = spots.length; i < l; i ++ ) {

			const spot = spots[ i ];
			const helper = supportSpotsHelpers[ i ];

			if ( helper.visible === true ) {

				helper.scale.setScalar( spot.score || 0.5 );
				helper.material.color.set( ( spot.best === true ) ? 0xff0000 : 0xffffff );

			}

		}

		// states

		const players = team.children;

		for ( let i = 0, l = players.length; i < l; i ++ ) {

			const player = players[ i ];
			const helper = statesHelpers[ i ];

			if ( helper.visible === true ) {

				const currentState = player.stateMachine.currentState;
				const text = ( currentState !== null ) ? currentState.constructor.name : 'null';

				const canvas = helper.material.map.image;
				const context = canvas.getContext( '2d' );

				context.fillStyle = '#ffffff';
				context.fillRect( 0, 0, canvas.width, canvas.height );

				context.fillStyle = "#000000";
				context.font = '24px Arial';
				context.textAlign = 'center';
				context.textBaseline = 'middle';

				context.fillText( text, canvas.width / 2, canvas.height / 2 );

				helper.material.map.needsUpdate = true;

			}

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
