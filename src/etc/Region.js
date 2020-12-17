/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MathUtils } from 'yuka';

class Region {

	constructor( x, y, width, height, id = 0 ) {

		this.x = x;
		this.y = y;

		this.width = width;
		this.height = height;

		this.id = id;

		this._left = x - ( width / 2 );
		this._right = x + ( width / 2 );
		this._top = y + ( height / 2 );
		this._bottom = y - ( height / 2 );

	}

	getRandomPosition( position ) {

		position.x = MathUtils.randFloat( this._left, this._right );
		position.y = 0;
		position.z = MathUtils.randFloat( this._bottom, this._top );

		return position;

	}

	isInside( position, isHalfSize = false ) {

		let marginX, marginY;

		if ( isHalfSize === true ) {

			marginX = this.width * 0.25;
			marginY = this.height * 0.25;

			return ( ( position.x > ( this._left + marginX ) ) &&
				 ( position.x < ( this._right - marginX ) ) &&
				 ( position.z > ( this._bottom + marginY ) ) &&
				 ( position.z < ( this._top - marginY ) ) );

		} else {

			return ( ( position.x > this._left ) &&
				 ( position.x < this._right ) &&
				 ( position.z > this._bottom ) &&
				 ( position.z < this._top ) );

		}

	}

}

export default Region;