/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MathUtils } from 'yuka';

class Region {

	constructor( center, width, height, id = 0 ) {

		this.center = center;

		this.width = width;
		this.height = height;

		this.id = id;

		this.left = center.x - ( width / 2 );
		this.right = center.x + ( width / 2 );
		this.top = center.z + ( height / 2 );
		this.bottom = center.z - ( height / 2 );

	}

	getRandomPosition( position ) {

		position.x = MathUtils.randFloat( this.left, this.right );
		position.y = 0;
		position.z = MathUtils.randFloat( this.bottom, this.top );

		return position;

	}

	isInside( position, isHalfSize = false ) {

		let marginX, marginY;

		if ( isHalfSize === true ) {

			marginX = this.width * 0.25;
			marginY = this.height * 0.25;

			return ( ( position.x > ( this.left + marginX ) ) &&
				 ( position.x < ( this.right - marginX ) ) &&
				 ( position.z > ( this.bottom + marginY ) ) &&
				 ( position.z < ( this.top - marginY ) ) );

		} else {

			return ( ( position.x > this.left ) &&
				 ( position.x < this.right ) &&
				 ( position.z > this.bottom ) &&
				 ( position.z < this.top ) );

		}

	}

}

export default Region;
