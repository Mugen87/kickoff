/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, Plane, Vector3 } from 'yuka';

import Region from '../etc/Region.js';

class Pitch extends GameEntity {

	constructor( width, height ) {

		super();

		this.field = null;

		this.walls = [
			new Plane( new Vector3( 0, 0, - 1 ), 7.5 ), // top
			new Plane( new Vector3( 0, 0, 1 ), 7.5 ), // bottom
			new Plane( new Vector3( - 1, 0, 0 ), 10 ), // right (red goal)
			new Plane( new Vector3( 1, 0, 0 ), 10 ), // left (blue goal)
		];

		this.isPlaying = false;
		this.isGoalKeeperInBallPossession = false;

		this.playingArea = new Region( this.position.x, this.position.z, width, height );

		this.regionCountWidth = 6;
		this.regionCountHeight = 3;

		this.regions = [];
		this._createRegions();

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
				const y = row * height + ( height / 2 ) - ( playingArea.height / 2 );

				this.regions[ id ] = new Region( x, y, width, height, id );

				id ++;

			}

		}

	}

}

export default Pitch;
