/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle, MathUtils, StateMachine, Quaternion, Vector3 } from 'yuka';

const _quaterion = new Quaternion();
const _displacement = new Vector3();
const _direction = new Vector3();
const _toPosition = new Vector3();

class Player extends Vehicle {

	constructor( role, team, pitch ) {

		super();

		this.role = role;

		this.team = team;
		this.pitch = pitch;

		this.homeRegionId = - 1;
		this.defaultRegionId = - 1;

		// Must be in the range [0,1]. Adjusts the amount of noise added to a kick.
		// The lower the value the worse the player gets.

		this.accuracy = 1;

		this.stateMachine = new StateMachine( this );

		this.target = new Vector3();

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

		return this.position.squaredDistanceTo( this.target ) < PLAYER_IN_TARGET_RANGE_SQ;

	}

	isBallWithinKeeperRange() {

		const ball = this.team.ball;

		return this.position.squaredDistanceTo( ball.position ) < KEEPER_IN_TARGET_RANGE_SQ;

	}

	isBallWithinKickingRange() {

		const ball = this.team.ball;

		return this.position.squaredDistanceTo( ball.position ) < PLAYER_KICKING_DISTANCE_SQ;

	}

	isBallWithinReceivingRange() {

		const ball = this.team.ball;

		return this.position.squaredDistanceTo( ball.position ) < PLAYER_RECEIVING_RANGE_SQ;

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

	isInHomeRegion() {

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

			if ( this.isPositionInFrontOfPlayer( opponent.position ) && this.position.squaredDistanceTo( opponent.position ) < PLAYER_COMFORT_ZONE_SQ ) {

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

const ROLE = {
	GOALKEEPER: 0,
	ATTACKER: 1,
	DEFENDER: 2
};

// the goalkeeper has to be this close to the ball to be able to interact with it
const KEEPER_IN_TARGET_RANGE = 0.5;

// when an opponents comes within this range the player will attempt to pass
// the ball. Players tend to pass more often, the higher the value
const PLAYER_COMFORT_ZONE = 2;

// the player has to be this close to the ball to be able to interact with it
const PLAYER_IN_TARGET_RANGE = 0.5;

// player has to be this close to the ball to be able to kick it. The higher
// the value this gets, the easier it gets to tackle.
const PLAYER_KICKING_DISTANCE = 0.3;

// how close the ball must be to a receiver before he starts chasing it
const PLAYER_RECEIVING_RANGE = 0.5;

// compute some constants in squared space
const KEEPER_IN_TARGET_RANGE_SQ = KEEPER_IN_TARGET_RANGE * KEEPER_IN_TARGET_RANGE;
const PLAYER_COMFORT_ZONE_SQ = PLAYER_COMFORT_ZONE * PLAYER_COMFORT_ZONE;
const PLAYER_IN_TARGET_RANGE_SQ = PLAYER_IN_TARGET_RANGE * PLAYER_IN_TARGET_RANGE;
const PLAYER_KICKING_DISTANCE_SQ = PLAYER_KICKING_DISTANCE * PLAYER_KICKING_DISTANCE;
const PLAYER_RECEIVING_RANGE_SQ = PLAYER_RECEIVING_RANGE * PLAYER_RECEIVING_RANGE;

export { Player, ROLE };
