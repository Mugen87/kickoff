/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MovingEntity, Ray, Vector3 } from 'yuka';
import { MESSAGE, TEAM } from '../core/Constants';

const _acceleration = new Vector3();
const _brakingForce = new Vector3();
const _ray = new Ray();
const _intersectionPoint = new Vector3();

class Ball extends MovingEntity {

	constructor( pitch ) {

		super();

		this.boundingRadius = 0.1;

		this.pitch = pitch;

		this.mass = 0.44; // 440g
		this.maxSpeed = 42; // 42 m/s ~ 150km/h

		this.friction = - 0.8; // This value decreases the velocity of the ball over time.

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

		if ( this._isScored() === false ) {

			this._collisionDetection();

		}

	}

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

	_isScored() {

		const teamBlue = this.pitch.teamBlue;
		const teamRed = this.pitch.teamRed;

		const goalBlue = teamBlue.homeGoal;
		const goalRed = teamRed.homeGoal;

		if ( goalRed.leftPost === null ) goalRed.computePosts();
		if ( goalBlue.leftPost === null ) goalBlue.computePosts();

		let team = null;

		if ( checkLineIntersection( this._previousPosition.x, this._previousPosition.z, this.position.x, this.position.z, goalRed.leftPost.x, goalRed.leftPost.z, goalRed.rightPost.x, goalRed.rightPost.z ) ) {

			team = TEAM.BLUE;

		}

		if ( checkLineIntersection( this._previousPosition.x, this._previousPosition.z, this.position.x, this.position.z, goalBlue.leftPost.x, goalBlue.leftPost.z, goalBlue.rightPost.x, goalBlue.rightPost.z ) ) {

			team = TEAM.RED;

		}

		if ( team !== null ) {

			this.placeAt( new Vector3( 0, 0, 0 ) );

			this.sendMessage( teamBlue, MESSAGE.GOAL_SCORED, 0, { team: team } );
			this.sendMessage( teamRed, MESSAGE.GOAL_SCORED, 0, { team: team } );
			this.sendMessage( this.pitch, MESSAGE.GOAL_SCORED );

			return true;

		}

		return false;

	}

}

function checkLineIntersection( line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY ) {

	let a, b;

	const denominator = ( ( line2EndY - line2StartY ) * ( line1EndX - line1StartX ) ) - ( ( line2EndX - line2StartX ) * ( line1EndY - line1StartY ) );

	if ( denominator === 0 ) {

		return false;

	}

	a = line1StartY - line2StartY;
	b = line1StartX - line2StartX;
	const numerator1 = ( ( line2EndX - line2StartX ) * a ) - ( ( line2EndY - line2StartY ) * b );
	const numerator2 = ( ( line1EndX - line1StartX ) * a ) - ( ( line1EndY - line1StartY ) * b );
	a = numerator1 / denominator;
	b = numerator2 / denominator;

	if ( ( a > 0 && a < 1 ) && ( b > 0 && b < 1 ) ) {

		return true;

	}

	return false;

}

export default Ball;
