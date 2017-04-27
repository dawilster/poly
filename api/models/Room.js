/**
 * Room
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  // Subscribers only get to hear about update and destroy events,
  // and about users joining or leaving the room.
  // This lets us keep our count of users in the room accurate, without
  // sending chat message for a room to anyone but people who actually
  // want to get them.  To get chat messages for a room, you subscribe
  // to the 'message' context explicitly.
  autosubscribe: ['destroy', 'update', 'add:users', 'remove:users'],
  attributes: {
    name: {
       type: 'string',
       primaryKey: true
    },
		users: {
			collection: 'user',
			via: 'rooms'
		}

  },
};
