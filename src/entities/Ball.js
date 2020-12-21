/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MovingEntity, Ray, Vector3 } from 'yuka';

const _acceleration = new Vector3();
const _brakingForce = new Vector3();
const _direction = new Vector3();
const _ut = new Vector3();
const _halfATSquared = new Vector3();

const _ray = new Ray();
const _intersectionPoint = new Vector3();

class Ball extends MovingEntity {

	constructor( pitch ) {

		super();

		this.owner = null;
		this.pitch = pitch;

		this.mass = 0.44; // 440g
		this.maxSpeed = 42; // 42 m/s ~ 150km/h

		this.friction = - 1; // This value decreases the velocity of the ball over time.

		// internals

		this._previousPosition = new Vector3();

	}

	update( delta ) {

		this._previousPosition.copy( this.position );

		_brakingForce.copy( this.velocity ).normalize().multiplyScalar( this.friction );

		_acceleration.copy( _brakingForce ).divideScalar( this.mass );

		this.velocity.add( _acceleration.multiplyScalar( delta ) );

		if ( this.getSpeedSquared() < 0.0001 ) {

			this.velocity.set( 0, 0, 0 );

		}

		super.update( delta );

		this._collisionDetection();

	}

	// advance( delta, position ) {

	// 	// using the equation s = uΔt + 1/2 * aΔt^2

	// 	_ut.copy( this.velocity ).multiplyScalar( delta );

	// 	_direction.copy( this.velocity ).normalize();

	// 	_halfATSquared.copy( _direction ).multiplyScalar( 0.5 * this.friction * delta * delta );

	// 	return position.copy( this.position ).add( _ut ).add( _halfATSquared );

	// }

	kick( force ) {

		// For simplicity we do no use a physical correct model here:
		//
		// 1. The ball is assumed to have a zero velocity immediately prior to a kick.
		// 2. The force and the resulting acceleration of a kick is applied in a single simulation step.
		//    Hence, the lenght of the acceleration represents the new speed (and consequently the velocity) of the ball.

		_acceleration.copy( force ).divideScalar( this.mass );

		this.velocity.copy( _acceleration );

		return this;

	}

	placeAt( position = new Vector3( 0, 0, 0 ) ) {

		this.position.copy( position );
		this.velocity.set( 0, 0, 0 );

		return this;

	}

	timeToCoverDistance( startPosition, endPosition, force ) {

		// Similar to kick(), we assume no accumulative velocities in this method. Meaning the following computation
		// represents the speed of the ball if the player was to make the pass.
		const speed = force / this.mass;

		// Calculate the velocity at the end position using the equation: v^2 = u^2 + 2as.

		const s = startPosition.distanceTo( endPosition ); // distance to cover

		const term = ( speed * speed ) + ( 2 * this.friction * s );

		// If (u^2 + 2as) is negative it means the ball cannot reach the end position.
		if ( term <= 0.0 ) {

			return - 1.0;

		}

		// It IS possible for the ball to reach its destination and we know its speed when it
		// gets there, so now it's easy to calculate the time using the equation.
		//
		// t = ( v-u ) / a
		//

		return ( Math.sqrt( term ) - speed ) / this.friction;

	}

	trap() {

		this.velocity.set( 0, 0, 0 );

		return this;

	}

	_collisionDetection() {

		const walls = this.pitch.walls;

		_ray.origin.copy( this._previousPosition );
		_ray.direction.subVectors( this.position, this._previousPosition ).normalize();

		const d = this._previousPosition.squaredDistanceTo( this.position );

		let closestDistance = Infinity;
		let closestWall = null;

		for ( let i = 0, l = walls.length; i < l; i ++ ) {

			const wall = walls[ i ];

			if ( _ray.intersectPlane( wall, _intersectionPoint ) !== null ) {

				const s = this._previousPosition.squaredDistanceTo( _intersectionPoint );

				if ( s <= d && s < closestDistance ) {

					closestDistance = s;
					closestWall = wall;

				}

			}

		}

		if ( closestWall !== null ) {

			this.position.copy( this._previousPosition );
			this.velocity.reflect( closestWall.normal );

		}

	}

}

export default Ball;
