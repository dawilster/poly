//basically the ability to remember a persons username with cookies
//so subsequent logins won't prompt for username
var allLanguages = [];
var _firstLaunch = true;
var currentUser = null;
var languageMapping = {};

$(function(){

  $('.languages-select').on('change', function() {
    $('#current-language').val(this.value);

    io.socket.post('/user/set_language', { lang_code: this.value}, function() {});
    loadMessageHistory();
  });

  //sending a message
  $('form').submit(function(){
    submitMessage($('#m').val());

    //reset form
    $('#m').val('');

    return false;
  });

  $(document).on('mouseenter', '.message-body', function() {
    $(this).find('.see-original').text('Hover a word to learn more');

    $(this).find('.rate-btn').removeClass('hide');
    $(this).find('.translated-text').addClass('hide');
    $(this).find('.original-text').removeClass('hide');
  });

  $(document).on('mouseleave', '.message-body', function() {
    $(this).find('.see-original').text('Hover for original');

    $(this).find('.rate-btn').addClass('hide');
    $(this).find('.original-text').addClass('hide');
    $(this).find('.translated-text').removeClass('hide');
  });

});

io.socket.on('connect', function socketConnected() {
  //check cookies if exists login with ID otherwise ask for username
  var access_token = getCookie('access_token');



  fetchLanguages(function() {
    //cookie exists
    if(access_token === undefined) {
      promptUsername(function usernameEntered(name) {
        signUp(name);
      });
    } else {
      loginUser(access_token);
    }
  });

});

io.socket.on('user', function messageReceived(message) {
  switch (message.verb) {
    // Handle user creation
    case 'created':
      renderUserJoinedMessage(message);
      break;
    case 'destroyed':
      renderLeftRoomMessage(message);
      break

    default:
      break;
  }
});

io.socket.on('message', function messageReceived(message) {
  switch (message.verb) {
    // Handle user creation
    case 'created':
      renderMessage(message.data)
      break;
    default:
      break;
  }
});

io.socket.on('room', function messageReceived(message) {
  switch (message.verb) {
    case 'messaged':
      switch(message.data.type) {
        case 'stat':
          updateLanguageStats(message.data.stats);
          break;
        case 'joined':
          updateUserCount(message.data);
          break;
        default:
          renderMessage(message.data)
          break;
      }
      break;
    default:
      break;
  }
});

function loadMessageHistory() {
  $('.chat-messages').empty();

  $('.messages.loading-indicator').removeClass('hide');

  var lang = $('#current-language').val();

  console.log('fetch messages: /message?lang=' + lang);

  io.socket.get('/message', { lang: lang }, function(data) {
    renderMessages(data);
  });
}

function loginUser(access_token) {
  io.socket.get('/user/login', {access_token: access_token}, function(data) {
    currentUser = data;

    $('#username').val(data.name);

    autoDetectLanguage();
  });
}

function signUp(name) {
  io.socket.get("/user/signup", { name: name }, function(data) {
    currentUser = data;

    var expires = "; expires=Fri, 31 Dec 2999 23:59:59 GMT";

    document.cookie = "access_token=" + data.accessToken + expires;

    autoDetectLanguage();
  });
}

function updateLanguageStats(stats) {
  $('.live-stats').empty();

  Object.keys(stats.languages).forEach(function (lang) {
    var count = stats.languages[lang];
    var noun  = count > 1 ? 'speakers' : 'speaker';

    $('.live-stats').append('<li>'+ count + ' '+ languageMapping[lang] +' ' + noun + '</li>');
  });
}

function fetchLanguages(callBack) {
  //fetch supported languages
  io.socket.get('/chat/languages', {}, function(data) {
    languageMapping = data.languageMapping;

    var rendered = Mustache.render($('#language-select').html(),
      { languages: data.languages }
    );

    $('.languages-select').html(rendered);

    callBack();
  });
}

function autoDetectLanguage() {
  var code = window.navigator.userLanguage || window.navigator.language;

  var option = $(".languages-select option[data-code='" + code +"']");

  if(option.length === 0) {
    console.log('Language code '+ code +' was not found. Defaulting to English');
    $('.languages-select').val('en').change();
  } else {
    $('.languages-select').val(code).change();
  }
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
