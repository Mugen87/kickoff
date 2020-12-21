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
export const TEAM_STATES = {
	ATTACKING: 'ATTACKING',
	DEFENDING: 'DEFENDING',
	PREPARE_FOR_KICKOFF: 'PREPARE_FOR_KICKOFF'
};
export const CONFIG = {
	GOALKEEPER_IN_TARGET_RANGE: 0.5, // the goalkeeper has to be this close to the ball to be able to interact with it
	GOALKEEPER_INTERCEPT_RANGE: 3, // when the ball becomes within this distance of the goalkeeper he changes state to intercept the ball
	GOALKEEPER_MIN_PASS_DISTANCE: 3, // // the minimum distance a player must be from the goalkeeper before it will pass the ball
	GOALKEEPER_TENDING_DISTANCE: 2, // this is the distance the keeper puts between the back of the net and the ball when using the interpose steering behavior
	PLAYER_COMFORT_ZONE: 2, // when an opponents comes within this range the player will attempt to pass the ball. Players tend to pass more often, the higher the value
	PLAYER_IN_TARGET_RANGE: 0.5, // the player has to be this close to the ball to be able to interact with it
	PLAYER_KICK_FREQUENCY: 1, // the number of times a player can kick the ball per second
	PLAYER_KICKING_DISTANCE: 0.3, // player has to be this close to the ball to be able to kick it. The higher the value this gets, the easier it gets to tackle.
	PLAYER_MAX_PASSING_FORCE: 2.5, // the force used for passing
	PLAYER_MAX_SHOOTING_FORCE: 4, // the force used for shooting at the goal
	PLAYER_NUM_ATTEMPTS_TO_FIND_VALID_STRIKE: 5, // the number of times the player attempts to find a valid shot
	PLAYER_RECEIVING_RANGE: 0.5, // how close the ball must be to a receiver before he starts chasing it
	PLAYER_PASS_INTERCEPT_SCALE: 0.3, // this value decreases the range of possible pass targets a player can reach "in time"
	PLAYER_PASS_REQUEST_FAILURE: 0.1, // the likelihood that a pass request won't be noticed
	SUPPORT_SPOT_CALCULATOR_SLICE_X: 12, // x dimension of spot
	SUPPORT_SPOT_CALCULATOR_SLICE_Y: 5, // y dimension of spot
	SUPPORT_SPOT_CALCULATOR_SCORE_CAN_PASS: 2, // score when pass is possible
	SUPPORT_SPOT_CALCULATOR_SCORE_CAN_SCORE: 1, // score when a goal is possible
	SUPPORT_SPOT_CALCULATOR_SCORE_DISTANCE: 2, // score for pass distance
	SUPPORT_SPOT_CALCULATOR_OPT_DISTANCE: 5, // optimal distance for a pass
	SUPPORT_SPOT_CALCULATOR_UPDATE_FREQUENCY: 1 // updates per second
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
