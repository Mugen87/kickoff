/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { State, Vector3 } from 'yuka';
import { MESSAGE, GOALKEEPER_STATES, CONFIG } from '../core/Constants.js';

const _target = new Vector3();
const _displacement = new Vector3();

class GlobalState extends State {

	onMessage( goalkeeper, telegram ) {

		switch ( telegram.message ) {

			case MESSAGE.GO_HOME:

				goalkeeper.setDefaultHomeRegion();

				goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.RETURN_HOME );

				return true;

			case MESSAGE.RECEIVE_BALL:

				goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.INTERCEPT_BALL );

				return true;

		}

		return false;

	}

}

//

class ReturnHomeState extends State {

	enter( goalkeeper ) {

		const region = goalkeeper.getHomeRegion();
		goalkeeper.steeringTarget.copy( region.center );

		const arriveBehavior = goalkeeper.steering.behaviors[ 0 ];
		arriveBehavior.target = goalkeeper.steeringTarget;
		arriveBehavior.active = true;

	}

	execute( goalkeeper ) {

		if ( goalkeeper.isInHomeRegion() || goalkeeper.team.inControl() === false ) {

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.TEND_GOAL );

		}

	}

	exit( goalkeeper ) {

		const arriveBehavior = goalkeeper.steering.behaviors[ 0 ];
		arriveBehavior.target = null;
		arriveBehavior.active = false;

	}

}

class TendGoalState extends State {

	enter( goalkeeper ) {

		const arriveBehavior = goalkeeper.steering.behaviors[ 0 ];
		arriveBehavior.target = goalkeeper.steeringTarget;
		arriveBehavior.active = true;

	}

	execute( goalkeeper ) {

		const ball = goalkeeper.team.ball;

		goalkeeper.getRearInterposeTarget( _target );

		_displacement.subVectors( ball.position, _target ).normalize().multiplyScalar( CONFIG.GOALKEEPER_TENDING_DISTANCE );

		goalkeeper.steeringTarget.copy( _target ).add( _displacement );

		//

		if ( goalkeeper.isBallWithinKeeperRange() ) {

			ball.trap();

			goalkeeper.pitch.isGoalKeeperInBallPossession = true;

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.PUT_BALL_BACK_IN_PLAY );

			return;

		}

		if ( goalkeeper.isTooFarFromGoalMouth() && goalkeeper.team.inControl() ) {

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.RETURN_HOME );

			return;

		}

		if ( goalkeeper.isBallWithinRangeForIntercept() && goalkeeper.team.isInControl() === false ) {

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.INTERCEPT_BALL );

			return;

		}

	}

	exit( goalkeeper ) {

		const arriveBehavior = goalkeeper.steering.behaviors[ 0 ];
		arriveBehavior.target = null;
		arriveBehavior.active = false;

	}

}

class InterceptBallState extends State {

	enter( goalkeeper ) {

		const pursuitBehavior = goalkeeper.steering.behaviors[ 1 ];
		pursuitBehavior.evader = goalkeeper.team.ball;
		pursuitBehavior.active = true;

	}

	execute( goalkeeper ) {

		if ( goalkeeper.isTooFarFromGoalMouth() && goalkeeper.isClosestPlayerOnPitchToBall() === false ) {

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.RETURN_HOME );

			return;

		}

		if ( goalkeeper.isBallWithinKeeperRange() ) {

			const ball = goalkeeper.team.ball;
			ball.trap();

			goalkeeper.pitch.isGoalKeeperInBallPossession = true;

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.PUT_BALL_BACK_IN_PLAY );

			return;

		}

	}

	exit( goalkeeper ) {

		const pursuitBehavior = goalkeeper.steering.behaviors[ 1 ];
		pursuitBehavior.evader = null;
		pursuitBehavior.active = false;

	}

}

class PutBallBackInPlayState extends State {

	enter( goalkeeper ) {

		goalkeeper.team.setControl( goalkeeper );

		goalkeeper.team.returnAllFieldPlayersToHome();
		goalkeeper.team.opposingTeam.returnAllFieldPlayersToHome();

	}

	execute( goalkeeper ) {

		const pass = {
			receiver: null,
			target: new Vector3()
		};

		const team = goalkeeper.team;

		if ( team.findPass( goalkeeper, CONFIG.PLAYER_MAX_PASSING_FORCE, CONFIG.GOALKEEPER_MIN_PASS_DISTANCE, pass ) !== null ) {

			const ball = team.ball;

			const force = new Vector3();
			force.subVectors( pass.target, ball.position ).normalize().multiplyScalar( CONFIG.PLAYER_MAX_PASSING_FORCE );

			ball.kick( force );

			goalkeeper.pitch.isGoalKeeperInBallPossession = false;

			team.sendMessage( pass.receiver, MESSAGE.RECEIVE_BALL, 0, { target: pass.target } ); // TODO: Call sendMessage on game entity (currently not possible because of missing manager reference)

			goalkeeper.stateMachine.changeTo( GOALKEEPER_STATES.TEND_GOAL );

			return;

		}

		goalkeeper.velocity.set( 0, 0, 0 );

	}

}

export { GlobalState, ReturnHomeState, TendGoalState, InterceptBallState, PutBallBackInPlayState };

