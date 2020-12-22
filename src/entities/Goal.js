/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, Vector3 } from 'yuka';
import { TEAM } from '../core/Constants';

class Goal extends GameEntity {

	constructor( width = 0, height = 0, color ) {

		super();

		this.width = width;
		this.height = height;
		this.color = color;

		this.goals = 0;

		this.leftPost = null;
		this.rightPost = null;

	}

	getDirection( direction ) {

		if ( this.color === TEAM.RED ) {

			direction.set( - 1, 0, 0 );

		} else {

			direction.set( 1, 0, 0 );

		}

		return direction;

	}

	computePosts() {

		this.leftPost = new Vector3();
		this.rightPost = new Vector3();

		const halfSize = this.width / 2;

		if ( this.color === TEAM.RED ) {

			this.leftPost.x = this.position.x;
			this.leftPost.z = this.position.z + halfSize;

			this.rightPost.x = this.position.x;
			this.rightPost.z = this.position.z - halfSize;

		} else {

			this.leftPost.x = this.position.x;
			this.leftPost.z = this.position.z - halfSize;

			this.rightPost.x = this.position.x;
			this.rightPost.z = this.position.z + halfSize;

		}

	}

}

export default Goal;
