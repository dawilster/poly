module.exports = {
  create: function(req, res) {
    var params = req.params.all();

    // attach requesting user
    params['user'] = req.session.userId;

    Message.create(params).exec(function(err, message) {
      if (err) { return res.serverError(err); }

      User.findOne(params['user']).exec(function(err, user) {
        //can populate association on create so we need to inject them here
        message['user'] = { id: user.id, name: user.name };

        Message.publishCreate(message);

        res.status(201);
        res.json(message);
      });
    });
  },
  find: function(req, res) {
    var lang = req.param('lang');

    Message.find({original: true}).sort('createdAt ASC').populate('user').exec((err, messages) => {
      if(lang) {
        // translate messages and return
        var translations = messages.map((message) => {
          return TranslatorService.translateMessage(message, req.param('lang'));
        });

        Promise.all(translations).then((data) => {
          Message.find({translatedLanguage: req.param('lang')}).sort('createdAt ASC').populate('user').exec(function(err, messages) {
            return res.json(messages);
          });
        });
      } else {
        return res.json(messages);
      }
    });
  }
};
