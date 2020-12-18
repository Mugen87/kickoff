/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from 'yuka';
import { Player, ROLE } from './Player.js';

class Goalkeeper extends Player {

	constructor( team, pitch ) {

		super( ROLE.GOALKEEPER, team, pitch );

	}

	isBallWithinRangeForIntercept() {

		const ball = this.team.ball;
		const goal = this.team.homeGoal;

		return goal.squaredDistanceTo( ball.position ) <= KEEPER_INTERCEPT_RANGE_SQ;

	}

	isTooFarFromGoalMouth() {

		return this.position.squaredDistanceTo( this.getRearInterposeTarget() ) > KEEPER_INTERCEPT_RANGE_SQ;

	}

	/**
	 * This method is called by the "interpose" state to determine the spot
	 * along the goalmouth which will act as one of the interpose targets
	 * (the other is the ball). The specific point at the goal line that
	 * the keeper is trying to cover is flexible and can move depending on
	 * where the ball is on the field. To achieve this we just scale the
	 * ball's z value by the ratio of the goal width to playing field height.
	 *
	 * @returns {Vector3} The interpose target.
	 */
	getRearInterposeTarget() {

		const target = new Vector3();

		const pitch = this.pitch;
		const ball = this.team.ball;
		const goal = this.team.homeGoal;

		target.x = goal.position.x;
		target.z = ball.position.z * ( goal.width / pitch.playingArea.height );

		return target;

	}

}

// when the ball becomes within this distance of the goalkeeper he changes state to intercept the ball
const KEEPER_INTERCEPT_RANGE = 3;
const KEEPER_INTERCEPT_RANGE_SQ = KEEPER_INTERCEPT_RANGE * KEEPER_INTERCEPT_RANGE;

export default Goalkeeper;
