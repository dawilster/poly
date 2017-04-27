var MsTranslator = require('mstranslator');

module.exports = {
  reset: function(req, res) {

    //set all users to inactive
    User.update({active: true}, {active: false}).exec(function afterwards(err, updated){
      if (err) {
        return res.serverError(err);
      }

      Message.destroy({}).exec(function (err){
        if (err) {
          return res.serverError(err);
        }

        return res.ok();
      });
    });
  },
  welcome: function(req, res) {
    return res.json({
      welcome_message: "Welcome to Poly Chat :)"
    });
  },

  languages: function(req, res) {
    var client = new MsTranslator({
      api_key: process.env.MS_TRANSLATOR_API_KEY
    }, true);

    var languages = [];
    var languageMapping = {};

    client.getLanguagesForTranslate(function(err, languageCodes) {
      if (err) { return res.serverError(err); }

      var params = {locale: 'en', languageCodes: languageCodes};

      client.getLanguageNames(params, function (err, languageNames) {
        if (err) { return res.serverError(err); }

        //assign language names to lang codes
        for (var i = 0; i < languageCodes.length; i++) {
          languages[i] = { name: languageNames[i], code: languageCodes[i] };
          languageMapping[languageCodes[i]] = languageNames[i];
        }

        return res.json({
          languages: languages,
          languageMapping: languageMapping
        });
      });

    });
  },

  // Post a message in a public chat room
  message: function(req, res) {
    // Get the ID of the currently connected socket
    var userId = req.session.userId;
    // Use that ID to look up the user in the session
    // We need to do this because we can have more than one user
    // per session, since we're creating one user per socket
    User.findOne(userId).exec(function(err, user) {
      if (err) { return res.serverError(err); }
      if (user == undefined) { return res.send(404); }

      Room.message(req.param('roomId'), {
        msg: req.param('msg'),
        user: user
      });
    });
  },

  translate: function(req, res) {

    var client = new MsTranslator({
      api_key: process.env.MS_TRANSLATOR_API_KEY
    }, true);

    client.detect({ text: req.param('msg')}, function(err, detectedLang) {
      // Don't worry about access token, it will be auto-generated if needed.
      client.translate({
        text: req.param('msg'),
        to: req.param('lang')
      }, function(err, translatedText) {
        res.json({
          targetLang: req.param('lang'),
          translatedText: translatedText,
          originalText: req.param('msg'),
          detectedSourceLanguage: detectedLang
        });
      });
    });
  }

};
