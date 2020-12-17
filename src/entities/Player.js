/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MovingEntity, MathUtils, Quaternion, Vector3 } from 'yuka';

const _quaterion = new Quaternion();
const _displacement = new Vector3();

class Player extends MovingEntity {

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

	}

	addNoise( target ) {

		const displacement = ( Math.PI - Math.PI * this.accuracy ) * MathUtils.randFloat( - 1, 1 );

		_quaterion.fromEuler( 0, displacement, 0 );

		_displacement.subVectors( target, this.position ).applyRotation( _quaterion );

		return target.addVectors( _displacement, this.position );

	}

	isClosestTeamMemberToBall() {

		return this === this.team.playerClosestToBall;

	}

	isControllingPlayer() {

		return this === this.team.controllingPlayer;

	}

	isInHomeRegion() {

		const homeRegion = this.getHomeRegion();

		// the home region check if more restrictive for field players

		return homeRegion.isInside( this.position, ( this.role !== ROLE.GOAL_KEEPER ) );

	}

	getHomeRegion() {

		return this.pitch.getRegionById( this.homeRegionId );

	}

	setDefaultHomeRegion() {

		this.homeRegionId = this.defaultRegionId;

	}

}

const ROLE = {
	GOAL_KEEPER: 0,
	ATTACKER: 1,
	DEFENDER: 2
};

export { Player, ROLE };
