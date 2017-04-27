/**
 * Message
 *
 * @module      :: Model
 * @description :: The main ledger of messages
 *
 */

module.exports = {
  autosubscribe: ['destroy', 'update', 'create'],
  attributes: {
    body: {
      type: 'string'
    },
    originalBody: {
      type: 'string'
    },
    sourceLanguage: {
       type: 'string'
    },
    translatedLanguage: {
      type: 'string'
    },
    parentId: {
      type: 'string'
    },
    original: {
      type: 'boolean',
      defaultsTo: function() {
        return true;
      }
    },
    user: {
      model: 'user',
      required: true
    }
  },
};
