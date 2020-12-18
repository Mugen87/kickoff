/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Regulator } from 'yuka';
import { Player } from './Player.js';

class FieldPlayer extends Player {

	constructor( role, team, pitch ) {

		super( role, team, pitch );

		this._kickRegulator = new Regulator( PLAYER_KICK_FREQUENCY );

	}

	isReadyForNextKick() {

		return this._kickLimiter.ready();

	}

}

// the number of times a player can kick the ball per second
const PLAYER_KICK_FREQUENCY = 1;

export default FieldPlayer;
