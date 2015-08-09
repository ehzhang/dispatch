var twilio = Meteor.npmRequire('twilio');
var settings = JSON.parse(Assets.getText('config.json'));
var twilioClient = twilio(settings.twilio.accountSid, settings.twilio.authToken);
var phone = Meteor.npmRequire('node-phonenumber');

/*
 * Utility functions
 */

// TODO probably want client-side validation too (or use this to canonicalize
// and confirm). We could use this live as the user is typing in their number,
// and show the canonicalized version below.
var canonicalize = function(number) {
  var phoneUtil = phone.PhoneNumberUtil.getInstance();
  var DEFAULT_REGION = 'US';
  var phoneNumber = phoneUtil.parse(number, DEFAULT_REGION);
  var canonicalized = phoneUtil.format(phoneNumber, phone.PhoneNumberFormat.INTERNATIONAL);
  return canonicalized;
};

var sendResponse = function(response, to, message) {
  var resp = new twilio.TwimlResponse();
  resp.message(message);
  // we must set content-type, otherwise twilio interprets what happens as a
  // 502 (even if the server returns a 200)
  response.writeHead(200, { 'Content-Type': 'text/xml' });
  response.end(resp.toString());
};

var ackResponse = function(response) {
  response.writeHead(200, { 'Content-Type': 'text/xml' });
  response.end('');
};

var sendMessage = function(to, message) {
  twilioClient.sendMessage({
    to: to,
    from: settings.twilio.number,
    body: message,
  }, function(err, responseData) {
    // TODO figure out how to handle this
  });
};

/*
 * Parser
 */

var Handler = (function() {
  function Handler(regex, callback) {
    this.regex = regex;
    this.callback = callback;
  }

  return Handler;
})();

var Response = (function() {
  function Response(context, text, match) {
    this.context = context;
    this.text = text;
    this.match = match;
  }

  return Response;
})();

var Parser = (function() {
  function Parser() {
    this.handlers = [];
    this.fallbackFunction = null;
  }

  Parser.prototype.respond = function(regex, callback) {
    this.handlers.push(new Handler(regex, callback));
  };

  Parser.prototype.fallback = function(callback) {
    this.fallbackFunction = callback;
  };

  Parser.prototype.receive = function(context, message) {
    var matched = 0;
    for (var i = 0; i < this.handlers.length; i++) {
      var handler = this.handlers[i];
      var match = message.match(handler.regex);
      if (match !== null) {
        matched++;
        handler.callback(new Response(context, message, match));
      }
    }
    if (matched === 0 && this.fallback !== null) {
      this.fallbackFunction(new Response(context, message, null));
    }
  };

  return Parser;
})();

/*
 * Parsing and message handing
 */

var parser = new Parser();

// wrapper to make sure that a user is registered and validated
var validating = function(wrapped) {
  var validator = function(res) {
    var user = res.context.from;
    if (!Meteor.call('isApproved', user)) {
      // TODO check if user is not registered or not approved
      var msg = "Sorry, you are not registered or not approved by your team administrator.";
      sendResponse(res.context.response, res.context.from, msg);
    }
    wrapped(res);
  };
  return validator;
};

parser.respond(/^\s*ok\s*$/i, function(res) {
  var ret = Meteor.call('verify', res.context.from);
  var msg;
  if (ret === true) {
    msg = "Thank you for verifying your phone number.";
    sendResponse(res.context.response, res.context.from, msg);
  } else if (ret === null) {
    msg = "We couldn't find you in our database.";
    sendResponse(res.context.response, res.context.from, msg);
  } else {
    ackResponse(res.context.response);
  }
});

parser.respond(/^\s*start\s*$/i, validating(function(res) {
  Meteor.call('setStatusP', res.context.from, true);
  ackResponse(res.context.response);
}));

parser.respond(/^\s*stop\s*$/i, validating(function(res) {
  Meteor.call('setStatusP', res.context.from, false);
  ackResponse(res.context.response);
}));

parser.respond(/^\s*current\s*$/i, validating(function(res) {
  var ret = Meteor.call('currentP', res.context.from);
  if (ret) {
    sendResponse(res.context.response, res.context.from,
                 "Assigned to: " + ret);
  } else {
    sendResponse(res.context.response, res.context.from,
                 "You're not assigned to any tasks.")
  }
}));

parser.respond(/^\s*(\d{4})\s*$/, validating(function(res) {
  var taskId = res.match[1]; // last 4 digits of task code
  var ret = Meteor.call('startTaskP', res.context.from, taskId);
  if (ret === null) {
    sendResponse(res.context.response, res.context.from,
                 "You're already doing another task.");
  } else if (ret === false) {
    sendResponse(res.context.response, res.context.from,
                 "Task is full.")
  } else {
    sendResponse(res.context.response, res.context.from,
                 "Assigned to " + taskId + ": " + ret);
  }
}));

parser.respond(/^\s*switch\s*(\d{4})\s*$/i, validating(function(res) {
  var taskId = res.match[1]; // last 4 digits of task code
  Meteor.call('stopTaskP', res.context.from);
  var ret = Meteor.call('startTask', taskId);
  if (ret === null) {
    // this shouldn't happen...
    sendResponse(res.context.response, res.context.from,
                 "Internal error... try again?");
  } else if (ret === false) {
    sendResponse(res.context.response, res.context.from,
                 "Task is full.")
  } else {
    sendResponse(res.context.response, res.context.from,
                 "Assigned to " + taskId + ": " + ret);
  }
}));

parser.respond(/^\s*done\s*$/i, validating(function(res) {
  if (Meteor.call('stopTaskP', res.context.from)) {
    sendResponse(res.context.response, res.context.from,
                 "Ok, noted.");
  } else {
    sendResponse(res.context.response, res.context.from,
                 "You're not assigned to any tasks.");
  }
}));

parser.respond(/^\s*close\s*task\s*(\d{4})\s*$/i, validating(function(res) {
  var taskId = res.match[1]; // last 4 digits of task code
  var ret = Meteor.call('closeTaskP', res.context.from, taskId);
  if (ret) {
    sendResponse(res.context.response, res.context.from,
                 "Closed: " + ret);
  } else {
    sendResponse(res.context.response, res.context.from,
                 "Couldn't close " + taskId + ", either nonexistent or closed.");
  }
}));

parser.respond(/^\s*close\s*task\s*$/i, validating(function(res) {
  var taskId = res.match[1]; // last 4 digits of task code
  var ret = Meteor.call('closeTaskP', res.context.from);
  if (ret !== null && ret !== false) {
    sendResponse(res.context.response, res.context.from,
                 "Closed: " + ret);
  } else {
    sendResponse(res.context.response, res.context.from,
                 "No current task or already closed.");
  }
}));

parser.fallback(function(res) {
  // note: not validating
  var msg = "Sorry, I couldn't understand that command.";
  sendResponse(res.context.response, res.context.from, msg);
});

/*
 * Twilio controller
 */

// GLOBAL
handleTwilio = function() {
  // TODO verify that this message is actually coming from Twilio before doing
  // any processing!
  var body = this.request.body; // already parsed object
  var text = body.Body;
  var from = canonicalize(body.From);
  var context = {
    from: from,
    response: this.response,
  };
  parser.receive(context, text);
};
