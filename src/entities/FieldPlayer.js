/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { ArriveBehavior, PursuitBehavior, Regulator, SeekBehavior } from 'yuka';
import { CONFIG, FIELDPLAYER_STATES } from '../core/Constants.js';
import { ChaseBallState, DribbleState, GlobalState, KickBallState, ReceiveBallState, ReturnHomeState, SupportAttackerState, WaitState } from '../states/FieldplayerStates.js';
import Player from './Player.js';

class FieldPlayer extends Player {

	constructor( role, team, pitch, homeRegionId ) {

		super( role, team, pitch, homeRegionId );

		this._kickRegulator = new Regulator( CONFIG.PLAYER_KICK_FREQUENCY );

		this.stateMachine.globalState = new GlobalState();

		this.stateMachine.add( FIELDPLAYER_STATES.CHASE_BALL, new ChaseBallState() );
		this.stateMachine.add( FIELDPLAYER_STATES.DRIBBLE, new DribbleState() );
		this.stateMachine.add( FIELDPLAYER_STATES.KICK_BALL, new KickBallState() );
		this.stateMachine.add( FIELDPLAYER_STATES.RECEIVE_BALL, new ReceiveBallState() );
		this.stateMachine.add( FIELDPLAYER_STATES.RETURN_HOME, new ReturnHomeState() );
		this.stateMachine.add( FIELDPLAYER_STATES.SUPPORT_ATTACKER, new SupportAttackerState() );
		this.stateMachine.add( FIELDPLAYER_STATES.WAIT, new WaitState() );

		const seekBehavior = new SeekBehavior();
		seekBehavior.active = false;
		this.steering.add( seekBehavior );

		const arriveBehavior = new ArriveBehavior();
		arriveBehavior.active = false;
		this.steering.add( arriveBehavior );

		const pursuitBehavior = new PursuitBehavior();
		pursuitBehavior.active = false;
		this.steering.add( pursuitBehavior );

	}

	update( delta ) {

		super.update( delta );

		if ( this.stateMachine.in( FIELDPLAYER_STATES.CHASE_BALL ) || this.stateMachine.in( FIELDPLAYER_STATES.DRIBBLE ) ) {

			this.rotateTo( this.team.ball.position, delta );

		}

	}

	isReadyForNextKick() {

		return this._kickRegulator.ready();

	}

}

export default FieldPlayer;
