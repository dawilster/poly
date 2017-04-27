function renderMessage(message) {
  var lang = $('#current-language').val();

  if(message.user.id === currentUser.id) {
    var rendered = Mustache.render($('#chat-message-yourself').html(), message);

    $('.chat-messages').append(rendered);

    updateScroll();

    $('.chat-messages').linkify({
      target: "_blank"
    });
  } else {
    translateText(message.body, lang).done(function(res) {
      var rendered = Mustache.render($('#chat-message').html(), {
        shortName: message.user.name.substr(0, 1),
        body: res,
        originalLanguage: languageMapping[res.detectedSourceLanguage],
        translate: (lang != res.detectedSourceLanguage)
      });

      $('.chat-messages').append(rendered);

      $('.chat-messages').linkify({
        target: "_blank"
      });
    });
  }
}

function renderMessages(messages) {
  var lang = $('#current-language').val();

  messages.forEach(function(message) {
    if(message.user.id === currentUser.id) {
      var params = { body: message.originalBody }

      var rendered = Mustache.render($('#chat-message-yourself').html(), params);

      $('.chat-messages').append(rendered);
    } else {
      var rendered = Mustache.render($('#chat-message').html(), {
        shortName: message.user.name.substr(0, 1),
        body: {translatedText: message.body, originalText: message.originalBody},
        originalLanguage: languageMapping[message.sourceLanguage],
        translate: (lang != message.sourceLanguage)
      });

      $('.chat-messages').append(rendered);
    }

    $('.chat-messages').linkify({
      target: "_blank"
    });
  });

  $('.messages.loading-indicator').addClass('hide');

  updateScroll();
}

// Render User has joined message
function renderUserJoinedMessage(message) {
  var template = Mustache.render($('#joined-message').html(), {
    shortName: message.data.name.substr(0, 1),
    name: message.data.name
  });

  $('.chat-messages').append(template);
}

function renderLeftRoomMessage(message){
  var template = Mustache.render($('#left-message').html(), message.previous);

  $('.chat-messages').append(template);
}

function renderWelcomeMessage(username, force) {
  var lang = $('#current-language').val();

  if($('#received-welcome').val() === 'false' || force) {
    return $.ajax({
      url: "chat/welcome",
      data: { username: $('#username').val()}
    }).done(function(res) {
      translateText(res.welcome_message, $('#current-language').val()).done(function(res) {
        var template = Mustache.render($('#welcome-message').html(), {
          username: username,
          translatedText: res.translatedText,
          originalText: res.originalText,
          translate: (lang != res.detectedSourceLanguage)
        });

        $('.chat-messages').append(template);
        $('#received-welcome').val('true');
      });
    });

  }
}

function updateUserCount(data) {
  $('#random-active').text(data.count);
}

function submitMessage(message) {
  io.socket.post('/message', { body: message, sourceLanguage: $('#current-language').val() }, function(err, data) {
    if(err) { return console.log(err); }
  });
}

//used to update chat window scroll when new messages are added
function updateScroll(){
    var element = document.getElementById("messages-scrollable");
    element.scrollTop = element.scrollHeight;
}

function promptUsername(callBack) {
  var username = prompt("Please enter your name", "");

  if (username == null) {
    promptUsername(callBack);
  } else {
    $('#username').val(username);

    callBack(username);
  }
}
