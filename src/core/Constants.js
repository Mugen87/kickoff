export const MESSAGE = {
	GO_HOME: 'GO_HOME',
	PASS_TO_ME: 'PASS_TO_ME',
	RECEIVE_BALL: 'RECEIVE_BALL',
	SUPPORT_ATTACKER: 'SUPPORT_ATTACKER'
};
export const GOALKEEPER_STATES = {
	RETURN_HOME: 'RETURN_HOME',
	TEND_GOAL: 'TEND_GOAL',
	PUT_BALL_BACK_IN_PLAY: 'PUT_BALL_BACK_IN_PLAY',
	INTERCEPT_BALL: 'INTERCEPT_BALL'
};
export const FIELDPLAYER_STATES = {
	CHASE_BALL: 'CHASE_BALL',
	DRIBBLE: 'DRIBBLE',
	KICK_BALL: 'KICK_BALL',
	RECEIVE_BALL: 'RECEIVE_BALL',
	RETURN_HOME: 'RETURN_HOME',
	SUPPORT_ATTACKER: 'SUPPORT_ATTACKER',
	WAIT: 'WAIT'
};
export const CONFIG = {
	GOALKEEPER_IN_TARGET_RANGE: 0.5, // the goalkeeper has to be this close to the ball to be able to interact with it
	GOALKEEPER_INTERCEPT_RANGE: 3, // when the ball becomes within this distance of the goalkeeper he changes state to intercept the ball
	GOALKEEPER_TENDING_DISTANCE: 2, // this is the distance the keeper puts between the back of the net and the ball when using the interpose steering behavior
	PLAYER_COMFORT_ZONE: 2, // when an opponents comes within this range the player will attempt to pass the ball. Players tend to pass more often, the higher the value
	PLAYER_KICK_FREQUENCY: 1, // the number of times a player can kick the ball per second
	PLAYER_IN_TARGET_RANGE: 0.5, // the player has to be this close to the ball to be able to interact with it
	PLAYER_KICKING_DISTANCE: 0.3, // player has to be this close to the ball to be able to kick it. The higher the value this gets, the easier it gets to tackle.
	PLAYER_RECEIVING_RANGE: 0.5 // how close the ball must be to a receiver before he starts chasing it
};

export const TEAM = {
	RED: 0,
	BLUE: 1
};

export const ROLE = {
	GOALKEEPER: 0,
	ATTACKER: 1,
	DEFENDER: 2
};

CONFIG.GOALKEEPER_INTERCEPT_RANGE_SQ = CONFIG.GOALKEEPER_INTERCEPT_RANGE * CONFIG.GOALKEEPER_INTERCEPT_RANGE;
CONFIG.GOALKEEPER_IN_TARGET_RANGE_SQ = CONFIG.GOALKEEPER_IN_TARGET_RANGE * CONFIG.GOALKEEPER_IN_TARGET_RANGE;
CONFIG.PLAYER_COMFORT_ZONE_SQ = CONFIG.PLAYER_COMFORT_ZONE * CONFIG.PLAYER_COMFORT_ZONE;
CONFIG.PLAYER_IN_TARGET_RANGE_SQ = CONFIG.PLAYER_IN_TARGET_RANGE * CONFIG.PLAYER_IN_TARGET_RANGE;
CONFIG.PLAYER_KICKING_DISTANCE_SQ = CONFIG.PLAYER_KICKING_DISTANCE * CONFIG.PLAYER_KICKING_DISTANCE;
CONFIG.PLAYER_RECEIVING_RANGE_SQ = CONFIG.PLAYER_RECEIVING_RANGE * CONFIG.PLAYER_RECEIVING_RANGE;
