/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, StateMachine } from 'yuka';
import { MESSAGE, TEAM, ROLE } from '../core/Constants.js';
import FieldPlayer from './FieldPlayer.js';
import Goalkeeper from './Goalkeeper.js';

class Team extends GameEntity {

	constructor( color, ball, pitch, homeGoal, opposingGoal ) {

		super();

		this.color = color;
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

		this._createPlayers();

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

	returnAllFieldPlayersToHome( withGoalKeeper = false ) {

		const players = this.children;

		for ( let i = 0, l = players.length; i < l; i ++ ) {

			const player = players[ i ];

			if ( withGoalKeeper === true ) {

				this.sendMessage( player, MESSAGE.GO_HOME );

			} else {

				if ( player.role !== ROLE.GOALKEEPER ) {

					this.sendMessage( player, MESSAGE.GO_HOME );

				}

			}

		}

	}

	setControl( player ) {

		this.controllingPlayer = player;

		this.opposingTeam.lostControl();

	}

	setupTeamPositions() {

		let regions;
		const players = this.children;

		if ( this.color === TEAM.RED ) {

			regions = redDefendingRegions;

		} else {

			regions = blueDefendingRegions;

		}

		for ( let i = 0, l = players.length; i < l; i ++ ) {

			const player = players[ i ];
			const regionId = regions[ i ];

			player.homeRegionId = regionId;

			const region = this.pitch.getRegionById( regionId );
			player.position.copy( region.center );

		}

	}

	//

	_createPlayers() {

		let rotation = Math.PI * 0.5;
		let regions;

		if ( this.color === TEAM.RED ) {

			regions = redDefendingRegions;
			rotation *= - 1;

		} else {

			regions = blueDefendingRegions;

		}

		const goalkeeper = new Goalkeeper( this, this.pitch, regions[ 0 ] );
		goalkeeper.rotation.fromEuler( 0, rotation, 0 );
		this.add( goalkeeper );

		const fieldplayer1 = new FieldPlayer( ROLE.ATTACKER, this, this.pitch, regions[ 1 ] );
		fieldplayer1.rotation.fromEuler( 0, rotation, 0 );
		this.add( fieldplayer1 );

		const fieldplayer2 = new FieldPlayer( ROLE.ATTACKER, this, this.pitch, regions[ 2 ] );
		fieldplayer2.rotation.fromEuler( 0, rotation, 0 );
		this.add( fieldplayer2 );

		const fieldplayer3 = new FieldPlayer( ROLE.DEFENDER, this, this.pitch, regions[ 3 ] );
		fieldplayer3.rotation.fromEuler( 0, rotation, 0 );
		this.add( fieldplayer3 );

		const fieldplayer4 = new FieldPlayer( ROLE.DEFENDER, this, this.pitch, regions[ 4 ] );
		fieldplayer4.rotation.fromEuler( 0, rotation, 0 );
		this.add( fieldplayer4 );

	}

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

// these define the home regions for this state of each of the players
// const blueAttackingRegions = [ 1, 12, 14, 6, 4 ];
// const redAttackingRegions = [ 16, 3, 5, 9, 13 ];

const blueDefendingRegions = [ 1, 6, 8, 3, 5 ];
const redDefendingRegions = [ 16, 9, 11, 12, 14 ];

export default Team;
