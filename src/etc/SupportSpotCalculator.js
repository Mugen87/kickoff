/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Regulator, Vector3 } from 'yuka';

import { CONFIG, TEAM } from '../core/Constants.js';

const _target = new Vector3();

class SupportSpotCalculator {

	constructor( team ) {

		this.team = team;

		this._bestSupportSpot = null;
		this._regulator = new Regulator( CONFIG.SUPPORT_SPOT_CALCULATOR_UPDATE_FREQUENCY );
		this._spots = [];

		this._computeSupportingSpots();

	}

	computeBestSupportingPosition() {

		let bestScore = 0;

		if ( this._regulator.ready() === false && this._bestSupportSpot !== null ) {

			return this._bestSupportSpot.position;

		}

		this._bestSupportSpot = null;

		const spots = this._spots;
		const team = this.team;

		for ( let i = 0, l = spots.length; i < l; i ++ ) {

			const spot = spots[ i ];
			spot.score = 0;

			// 1.Test: Is it possible to make a safe pass from the ball's position to this position?

			if ( team.inControl() && team.isPassSafeFromAllOpponents( this.team.controllingPlayer.position, spot.position, null, CONFIG.PLAYER_MAX_PASSING_FORCE ) ) {

				spot.score += CONFIG.SUPPORT_SPOT_CALCULATOR_SCORE_CAN_PASS;

			}

			// 2.Test: Determine if a goal can be scored from this position.

			if ( team.canShoot( spot.position, CONFIG.PLAYER_MAX_SHOOTING_FORCE, _target ) ) {

				spot.score += CONFIG.SUPPORT_SPOT_CALCULATOR_SCORE_CAN_SCORE;

			}

			// 3. Test: Calculate how far this spot is away from the controlling player.
			// The further away, the higher the score. The constant "OPT_DISTANCE" describes the optimal distance for this score.

			if ( team.supportingPlayer !== null ) {

				const distance = team.controllingPlayer.position.distanceTo( spot.position );

				if ( distance < CONFIG.SUPPORT_SPOT_CALCULATOR_OPT_DISTANCE ) {

					// add the score proportionally to the distance

					const f = ( CONFIG.SUPPORT_SPOT_CALCULATOR_OPT_DISTANCE - distance ) / CONFIG.SUPPORT_SPOT_CALCULATOR_OPT_DISTANCE;
					spot.score += CONFIG.SUPPORT_SPOT_CALCULATOR_SCORE_DISTANCE * f;

				} else {

					// distances greater than "OPT_DISTANCE" get full score

					spot.score += CONFIG.SUPPORT_SPOT_CALCULATOR_SCORE_DISTANCE;

				}

			}

			if ( spot.score > bestScore ) {

				bestScore = spot.score;

				this._bestSupportSpot = spot;

			}

		}

		if ( this._bestSupportSpot !== null ) {

			return this._bestSupportSpot.position;

		}

		return null;

	}

	getBestSupportingPosition() {

		if ( this._bestSupportSpot === null ) {

			return this.calculateBestSupportingPosition();

		} else {

			return this._bestSupportSpot.position;

		}

	}

	_computeSupportingSpots() {

		const playingField = this.team.pitch.playingArea;

		const widthOfSpotRegion = playingField.width * 0.8;
		const heightOfSpotRegion = playingField.height * 0.8;

		const sliceX = widthOfSpotRegion / CONFIG.SUPPORT_SPOT_CALCULATOR_SLICE_X;
		const sliceY = heightOfSpotRegion / CONFIG.SUPPORT_SPOT_CALCULATOR_SLICE_Y;

		const top = playingField.top - ( ( playingField.height - heightOfSpotRegion ) * 0.5 ) - ( sliceY * 0.5 );
		const right = playingField.right - ( ( playingField.width - widthOfSpotRegion ) * 0.5 ) - ( sliceX * 0.5 );
		const left = playingField.left + ( ( playingField.width - widthOfSpotRegion ) * 0.5 ) + ( sliceX * 0.5 );

		for ( let x = 0; x < ( CONFIG.SUPPORT_SPOT_CALCULATOR_SLICE_X * 0.5 ) - 1; x ++ ) {

			for ( let y = 0; y < CONFIG.SUPPORT_SPOT_CALCULATOR_SLICE_Y; y ++ ) {

				if ( this.team.color === TEAM.RED ) {

					this._spots.push( {
						position: new Vector3( left + ( x * sliceX ), 0, top - ( y * sliceY ) ),
						score: 0
					} );

				} else {

					this._spots.push( {
						position: new Vector3( right - ( x * sliceX ), 0, top - ( y * sliceY ) ),
						score: 0
					} );

				}

			}

		}

	}

}

export default SupportSpotCalculator;
