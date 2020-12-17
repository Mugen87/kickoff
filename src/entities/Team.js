/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, StateMachine } from 'yuka';

class Team extends GameEntity {

	constructor( ball, pitch, homeGoal, opposingGoal ) {

		super();

		this.ball = ball;
		this.pitch = pitch;
		this.homeGoal = homeGoal;
		this.opposingGoal = opposingGoal;

		this.opposingTeam = null;

		this.receivingPlayer = null;
		this.playerClosestToBall = null;
		this.controllingPlayer = null;
		this.supportingPlayer = null;

		this.stateMachine = new StateMachine( this );

	}

	update() {

		this._computePlayerClosestToBall();

		this.stateMachine.update();

	}

	inControl() {

		return this.controllingPlayer !== null;

	}

	areAllPlayersAtHome() {

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const player = this.children[ i ];

			if ( player.isInHomeRegion() === false ) {

				return false;

			}

		}

		return true;

	}

	isOpponentWithinRadius( player, radius ) {

		const opponents = this.opposingTeam.children;
		const squaredRadius = radius * radius;

		for ( let i = 0, l = opponents.length; i < l; i ++ ) {

			const opponent = opponents[ i ];

			const distance = opponent.position.squaredDistanceTo( player.position );

			if ( distance <= squaredRadius ) return true;

		}

		return false;

	}

	lostControl() {

		this.controllingPlayer = null;
		this.receivingPlayer = null;
		this.supportingPlayer = null;

	}

	setControl( player ) {

		this.controllingPlayer = player;

		this.opposingTeam.lostControl();

	}

	//

	_computePlayerClosestToBall() {

		const ball = this.ball;
		const players = this.children;

		let closestDistance = Infinity;

		for ( let i = 0, l = players.length; i < l; i ++ ) {

			const player = players[ i ];

			const distance = player.position.squaredDistanceTo( ball.position );

			if ( distance < closestDistance ) {

				closestDistance = distance;

				this.playerClosestToBall = player;

			}

		}

	}

}

export default Team;
