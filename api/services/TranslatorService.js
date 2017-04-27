var MsTranslator = require('mstranslator');

module.exports = {
  translateMessage(original, targetLang) {
    return new Promise((resolve, reject) => {
      Message.findOne({parentId: original.id,
       translatedLanguage: targetLang}).exec((err, message) => {
         if(message == undefined) {
           this.translateText(original.body, targetLang, function(translatedText, detectedLang) {
             var newMessage = {
               user: original.user,
               createdAt: original.createdAt,
               updatedAt: original.updatedAt,
               original: false,
               translatedLanguage: targetLang,
               sourceLanguage: detectedLang,
               body: translatedText,
               originalBody: original.body,
               parentId: original.id,
             };

             Message.create(newMessage).exec(function(err, message) {
               resolve(message);
             });
           });
         } else {
           resolve();
         }
       });
    });
  },
  translateText(body, targetLang, cb) {
    var client = new MsTranslator({
      api_key: process.env.MS_TRANSLATOR_API_KEY
    }, true);

    client.detect({ text: body}, function(err, detectedLang) {
      client.translate({
        text: body,
        to: targetLang
      }, function(err, translatedText) {
        return cb(translatedText, detectedLang);
      });
    });
  },
}
