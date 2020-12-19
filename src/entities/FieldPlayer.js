/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Regulator } from 'yuka';
import { CONFIG } from '../core/Constants.js';
import Player from './Player.js';

class FieldPlayer extends Player {

	constructor( role, team, pitch, homeRegionId ) {

		super( role, team, pitch, homeRegionId );

		this._kickRegulator = new Regulator( CONFIG.PLAYER_KICK_FREQUENCY );

	}

	isReadyForNextKick() {

		return this._kickLimiter.ready();

	}

}

export default FieldPlayer;
