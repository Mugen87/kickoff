/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from 'yuka';

class Goal extends GameEntity {

	constructor( width = 0, height = 0 ) {

		super();

		this.width = width;
		this.height = height;

	}

}

export default Goal;
