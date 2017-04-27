/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */


module.exports = {
  autosubscribe: ['destroy', 'update'],
  attributes: {
    accessToken: {
       type: 'string',
       defaultsTo: function() {
         return ModelService.generateUUID();
       }
    },
    name: 'string',
    active: {
      type: 'boolean',
      defaultsTo: function() {
        return false;
      }
    },
    languages: {
      type: 'array',
      defaultsTo: function() {
        return [];
      }
    },
    rooms: {
      collection: 'room',
      via: 'users',
      dominant: true
    },
    // Override toJSON instance method
    toJSON: function(auth) {
      var obj = this.toObject();

      if(auth != true) {
        delete obj.accessToken;
      }

      return obj;
    }
  },
  broadcaseCount: function() {
    User.active(function(err, count) {
      //update user count
      Room.message('random', {
        type: 'joined',
        count: count,
      });

      User.stats(function(err, stats) {
        Room.message('random', {
          type: 'stat',
          stats: stats,
        });
      });

    });
  },
  active: function(cb) {
    User.count({ active: true }).exec(function(err, count) {
      if (err) return cb(err);

      return cb(null, count);
    });
  },
  stats: function(cb) {
    User.find({ active: true }).exec(function(err, users) {
      if (err) return cb(err);

      var stats = { languages: {} };

      users.map(function(user) {
        user.languages.map(function(lang) {
          stats['languages'][lang] = ++stats['languages'][lang] || 1
        });
      });

      return cb(null, stats);
    });
  }
};
