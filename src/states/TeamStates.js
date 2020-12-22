/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { State } from 'yuka';
import { TEAM_STATES } from '../core/Constants.js';

class AttackingState extends State {

	enter( team ) {

		team.setupTeamPositions();
		team.updateSteeringTargetOfPlayers();

	}

	execute( team ) {

		if ( team.inControl() === false ) {

			team.stateMachine.changeTo( TEAM_STATES.DEFENDING );

		}

		team.computeBestSupportingPosition();

	}

	exit( team ) {

		team.lostControl();

	}

}

class DefendingState extends State {

	enter( team ) {

		team.setupTeamPositions();
		team.updateSteeringTargetOfPlayers();

	}

	execute( team ) {

		if ( team.inControl() ) {

			team.stateMachine.changeTo( TEAM_STATES.ATTACKING );

		}

	}

}

class PrepareForKickOffState extends State {

	enter( team ) {

		team.receivingPlayer = null;
		team.playerClosestToBall = null;
		team.controllingPlayer = null;
		team.supportingPlayer = null;

		team.returnAllFieldPlayersToHome( true );

	}

	execute( team ) {

		if ( team.areAllPlayersAtHome() && team.opposingTeam.areAllPlayersAtHome() ) {

			team.stateMachine.changeTo( TEAM_STATES.DEFENDING );

		}

	}

	exit( team ) {

		team.pitch.isPlaying = true;

	}

}

export { AttackingState, DefendingState, PrepareForKickOffState };
