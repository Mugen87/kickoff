/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, Plane, Vector3 } from 'yuka';
import { MESSAGE } from '../core/Constants.js';

import Region from '../etc/Region.js';

class Pitch extends GameEntity {

	constructor( width, height, world ) {

		super();

		this.world = world;

		this.walls = [
			new Plane( new Vector3( 0, 0, - 1 ), 7.5 ), // top
			new Plane( new Vector3( 0, 0, 1 ), 7.5 ), // bottom
			new Plane( new Vector3( - 1, 0, 0 ), 10 ), // right (red goal)
			new Plane( new Vector3( 1, 0, 0 ), 10 ), // left (blue goal)
		];

		this.isPlaying = true;
		this.isGoalKeeperInBallPossession = false;

		this.ball = null;
		this.teamRed = null;
		this.teamBlue = null;

		this.playingArea = new Region( this.position.clone(), width, height );

		this.regionCountWidth = 6;
		this.regionCountHeight = 3;

		this.regions = [];
		this._createRegions();

	}

	handleMessage( telegram ) {

		switch ( telegram.message ) {

			case MESSAGE.GOAL_SCORED:

				this.isPlaying = false;

				this.world.refreshUI();

				return true;

		}

		return false;

	}

	getRegionById( id ) {

		return this.regions[ id ];

	}

	_createRegions() {

		const playingArea = this.playingArea;

		let id = 0;

		const width = playingArea.width / this.regionCountWidth;
		const height = playingArea.height / this.regionCountHeight;

		for ( let col = 0; col < this.regionCountWidth; col ++ ) {

			for ( let row = 0; row < this.regionCountHeight; row ++ ) {

				const x = col * width + ( width / 2 ) - ( playingArea.width / 2 );
				const y = 0;
				const z = row * height + ( height / 2 ) - ( playingArea.height / 2 );

				this.regions[ id ] = new Region( new Vector3( x, y, z ), width, height, id );

				id ++;

			}

		}

	}

}

export default Pitch;
