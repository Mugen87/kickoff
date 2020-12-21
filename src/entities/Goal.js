/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from 'yuka';
import { TEAM } from '../core/Constants';

class Goal extends GameEntity {

	constructor( width = 0, height = 0, color ) {

		super();

		this.width = width;
		this.height = height;
		this.color = color;

	}

	getDirection( direction ) {

		if ( this.color === TEAM.RED ) {

			direction.set( - 1, 0, 0 );

		} else {

			direction.set( 1, 0, 0 );

		}

		return direction;

	}

}

export default Goal;
