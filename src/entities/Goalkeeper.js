/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { ArriveBehavior, PursuitBehavior, Vector3 } from 'yuka';
import { GOALKEEPER_STATES, CONFIG, ROLE } from '../core/Constants.js';
import { GlobalState, InterceptBallState, PutBallBackInPlayState, ReturnHomeState, TendGoalState } from '../states/GoalkeeperStates.js';
import Player from './Player.js';

const _target = new Vector3();

class Goalkeeper extends Player {

	constructor( team, pitch, homeRegionId ) {

		super( ROLE.GOALKEEPER, team, pitch, homeRegionId );

		this.updateOrientation = false;

		this.stateMachine.globalState = new GlobalState();

		this.stateMachine.add( GOALKEEPER_STATES.RETURN_HOME, new ReturnHomeState() );
		this.stateMachine.add( GOALKEEPER_STATES.TEND_GOAL, new TendGoalState() );
		this.stateMachine.add( GOALKEEPER_STATES.INTERCEPT_BALL, new InterceptBallState() );
		this.stateMachine.add( GOALKEEPER_STATES.PUT_BALL_BACK_IN_PLAY, new PutBallBackInPlayState() );

		//

		const arriveBehavior = new ArriveBehavior();
		arriveBehavior.active = false;
		this.steering.add( arriveBehavior );

		const pursuitBehavior = new PursuitBehavior();
		pursuitBehavior.active = false;
		this.steering.add( pursuitBehavior );

	}

	update( delta ) {

		super.update( delta );

		this.rotateTo( this.team.ball.position, delta );

	}

	isBallWithinRangeForIntercept() {

		const ball = this.team.ball;
		const goal = this.team.homeGoal;

		return goal.position.squaredDistanceTo( ball.position ) <= CONFIG.GOALKEEPER_INTERCEPT_RANGE_SQ;

	}

	isTooFarFromGoalMouth() {

		this.getRearInterposeTarget( _target );

		return this.position.squaredDistanceTo( _target ) > CONFIG.GOALKEEPER_INTERCEPT_RANGE_SQ;

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
	getRearInterposeTarget( target ) {

		const pitch = this.pitch;
		const ball = this.team.ball;
		const goal = this.team.homeGoal;

		target.x = goal.position.x;
		target.y = 0;
		target.z = ball.position.z * ( goal.width / pitch.playingArea.height );

		return target;

	}

}

export default Goalkeeper;
