/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle, MathUtils, StateMachine, Quaternion, Vector3 } from 'yuka';
import { CONFIG, ROLE } from '../core/Constants.js';

const _quaterion = new Quaternion();
const _displacement = new Vector3();
const _direction = new Vector3();
const _toPosition = new Vector3();

class Player extends Vehicle {

	constructor( role, team, pitch, homeRegionId ) {

		super();

		this.role = role;

		this.team = team;
		this.pitch = pitch;

		this.homeRegionId = homeRegionId;
		this.defaultRegionId = homeRegionId;

		// Must be in the range [0,1]. Adjusts the amount of noise added to a kick.
		// The lower the value the worse the player gets.

		this.accuracy = 1;

		this.stateMachine = new StateMachine( this );

		this.steeringTarget = new Vector3();

		this.manager = team.manager;

	}

	update( delta ) {

		this.stateMachine.update();

		super.update( delta );

	}

	handleMessage( telegram ) {

		return this.stateMachine.handleMessage( telegram );

	}

	addNoise( target ) {

		const displacement = ( Math.PI - Math.PI * this.accuracy ) * MathUtils.randFloat( - 1, 1 );

		_quaterion.fromEuler( 0, displacement, 0 );

		_displacement.subVectors( target, this.position ).applyRotation( _quaterion );

		return target.addVectors( _displacement, this.position );

	}

	getDistanceToHomeGoal() {

		const goal = this.team.homeGoal;

		return this.position.distanceTo( goal.position );

	}

	getDistanceToOpposingGoal() {

		const goal = this.team.opposingGoal;

		return this.position.distanceTo( goal.position );

	}

	isAheadOfAttacker() {

		const team = this.team;

		if ( team.inControl() ) {

			return this.getDistanceToOpposingGoal() < team.controllingPlayer.getDistanceToOpposingGoal();

		} else {

			return false;

		}

	}

	isAtTarget() {

		return this.position.squaredDistanceTo( this.steeringTarget ) < CONFIG.PLAYER_IN_TARGET_RANGE_SQ;

	}

	isBallWithinKeeperRange() {

		const ball = this.team.ball;

		return this.position.squaredDistanceTo( ball.position ) < CONFIG.GOALKEEPER_IN_TARGET_RANGE_SQ;

	}

	isBallWithinKickingRange() {

		const ball = this.team.ball;

		return this.position.squaredDistanceTo( ball.position ) < CONFIG.PLAYER_KICKING_DISTANCE_SQ;

	}

	isBallWithinReceivingRange() {

		const ball = this.team.ball;

		return this.position.squaredDistanceTo( ball.position ) < CONFIG.PLAYER_RECEIVING_RANGE_SQ;

	}

	isClosestTeamMemberToBall() {

		return this === this.team.playerClosestToBall;

	}

	isClosestPlayerOnPitchToBall() {

		if ( this.isClosestTeamMemberToBall() ) {

			const ball = this.team.ball;
			const opponentClosestToBall = this.team.opposingTeam.playerClosestToBall;

			return ( this.position.squaredDistanceTo( ball.position ) < opponentClosestToBall.position.squaredDistanceTo( ball.position ) );

		} else {

			return false;

		}

	}

	isControllingPlayer() {

		return ( this === this.team.controllingPlayer );

	}

	isPositionInFrontOfPlayer( position ) {

		this.getDirection( _direction );

		_toPosition.subVectors( position, this.position );

		return _direction.dot( _toPosition ) >= 0;

	}

	inHomeRegion() {

		const homeRegion = this.getHomeRegion();

		// the home region check if more restrictive for field players

		return homeRegion.isInside( this.position, ( this.role !== ROLE.GOALKEEPER ) );

	}

	isInHotRegion() {

		return this.getDistanceToOpposingGoal() < ( this.pitch.playingArea.width / 3 );

	}

	isThreatened() {

		const opponents = this.team.opposingTeam.children;

		for ( let i = 0, l = opponents.length; i < l; i ++ ) {

			const opponent = opponents[ i ];

			if ( this.isPositionInFrontOfPlayer( opponent.position ) && this.position.squaredDistanceTo( opponent.position ) < CONFIG.PLAYER_COMFORT_ZONE_SQ ) {

				return true;

			}

		}

		return false;

	}

	getHomeRegion() {

		return this.pitch.getRegionById( this.homeRegionId );

	}

	setDefaultHomeRegion() {

		this.homeRegionId = this.defaultRegionId;

	}

}

export default Player;
