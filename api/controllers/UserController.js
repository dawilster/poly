module.exports = {
  set_language: function(req, res) {
    var userId = req.session.userId;

    User.findOne(userId).exec(function(err, user) {
      if (err) { return res.serverError(err); }
      if (user == undefined) { return res.send(404); }

      user.languages = [];
      user.languages.push(req.param('lang_code'));

      user.save(function(err) {
        if (err) { return res.serverError(err); }

        User.stats(function(err, stats) {
          if (err) { return res.serverError(err); }

          Room.message('random', { type: 'stat', stats: stats });
        });
      });
    });
  },
  login: function(req, res) {
    Room.findOrCreate({ name: 'random'}).exec(function(err, room) {
      User.findOne({accessToken: req.param('access_token')}).exec(function(err, user) {
        if (err) { return res.serverError(err); }
        if (user == undefined) { return res.send(404); }

        // Set session userId will add a userId session to browser
        req.session.userId = user.id

        User.subscribe(req, user, 'message');

        // Subscribe this socket to the random chat room
        Room.subscribe(req, room, 'message');

        // Get updates about users being created
        User.watch(req);

        Message.watch(req);

        // Get updates about rooms being created
        Room.watch(req);

        user.active = true;

        user.save(function(err) {
          if (err) { return res.serverError(err); }

          User.broadcaseCount();

          user['accessToken'] = user.accessToken;

          res.json(user.toJSON(true));
        });

      });
    });
  },
  signup: function(req, res) {
    //Create 'random' channel
    Room.findOrCreate({ name: 'random'}).exec(function(err, room) {
      User.create({
        name: req.param('name'),
        active: true,
      }).exec(function(err, user) {
        if (err) { return res.serverError(err); }

        // Save this user in the session, indexed by their socket ID.
        // This way we can look the user up by socket ID later.
        req.session.userId = user.id

        // Subscribe the connected socket to custom messages regarding the user.
        // While any socket subscribed to the user will receive messages about the
        // user changing their name or being destroyed, ONLY this particular socket
        // will receive "message" events.  This allows us to send private messages
        // between users.
        User.subscribe(req, user, 'message');

        // Subscribe this socket to the random chat room
        Room.subscribe(req, room, 'message');

        Message.watch(req);

        // Get updates about users being created
        User.watch(req);

        // Get updates about rooms being created
        Room.watch(req);

        // Publish this user creation event to every socket watching the User model via User.watch()
        User.publishCreate(user, req);

        // Updates the user count
        User.broadcaseCount();

        user['accessToken'] = user.accessToken;

        res.json(user.toJSON(true));
      });
    });

  }

};
