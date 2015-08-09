// ---------------------------------------
// Meteor Methods
// ---------------------------------------

var sendMessage = function(to, message) {
  // TODO duplicated code, fix later
  var twilio = Meteor.npmRequire('twilio');
  var settings = JSON.parse(Assets.getText('config.json'));
  var twilioClient = twilio(settings.twilio.accountSid, settings.twilio.authToken);
  twilioClient.sendMessage({
    to: to,
    from: settings.twilio.number,
    body: message,
  }, function(err, responseData) {
    // TODO figure out how to handle this
  });
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// higher order function to more easily call the things that take in
// a user id instead of a phone number
function phone(func) {
  return function(phoneNumber) {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    var user = Meteor.users.findOne({'profile.phone': phoneNumber});
    var id = user ? user._id : ''; // warn when this happens?

    args[0] = id;
    return func.apply(null, args);
  };
}

function isApproved(phoneNumber) {
  var user = Meteor.users.findOne({'profile.phone': phoneNumber});
  if (typeof user === 'undefined' || user === null) {
    return false;
  }
  var roles = user.roles;
  return roles.verified === true && roles.approved === true;
}

function verify(phoneNumber) {
  var user = Meteor.users.findOne({'profile.phone': phoneNumber});
  if (typeof user === 'undefined' || user === null) {
    return null;
  }
  if (user.roles.verified === true) {
    return false;
  }
  Meteor.users.update({'_id': user._id}, {$set: {'roles.verified': true}});
  return true;
}

function setStatus(userId, online) {
  Meteor.users.update({'_id': userId}, {$set: {'profile.online': online}});
}

var setStatusP = phone(setStatus);

function createTask(creatorId, userIds, channelIds, description, min, max) {
  function randomCode() {
    var s = '' + randomInt(0, 10000);
    while (s.length < 4) {
      s = '0' + s;
    }
    return s;
  }
  codes = Tasks.find({status: 'open'}).map(function (t) { return t.code; });
  var code = randomCode();
  while (codes.length < 10000 && codes.indexOf(code) !== -1) {
    code = randomCode();
  }
  var tid = Tasks.insert({
    description: description,
    code: code,
    min: min,
    max: max,
    created: new Date(),
    closed: null,
    createdBy: creatorId,
    closedBy: null,
    workers: [],
    notified: [],
    users: userIds,
    channels: channelIds,
    status: 'open',
  });
  Events.insert({
    userId: creatorId,
    taskId: tid,
    timestamp: new Date(),
    type: 'created',
  });
  return code;
}

var createTaskP = phone(createTask);

function current(userId) {
  var task = Tasks.findOne({workers: userId});
  if (task) {
    return task.description;
  } else {
    return null;
  }
}

var currentP = phone(current);

function startTask(userId, taskCode) {
  var user = Meteor.users.findOne({_id: userId});
  var task = Tasks.findOne({status: 'open', code: taskCode});
  var current = Tasks.findOne({workers: userId});
  if (!task || !user || current) {
    return null; // user is already working on something
  }
  if (task.workers.length >= task.max) {
    return false; // full
  }
  Tasks.update({_id: task._id}, {$push: {workers: userId}});
  Events.insert({
    userId: userId,
    taskId: task._id,
    timestamp: new Date(),
    type: 'joined',
  });
  return task.description;
}

var startTaskP = phone(startTask);

// taskCode optional
function stopTask(userId, taskCode) {
  var user = Meteor.users.findOne({_id: userId});
  var search = {workers: userId};
  if (taskCode) search.code = taskCode;
  var tasks = Tasks.find(search).fetch();
  if (!user || tasks.length === 0) {
    return false; // not in any tasks
  }
  Tasks.update(search, {$pull: {workers: userId}}, {multi: true});
  Events.insert({
    userId: userId,
    taskId: tasks[0]._id,
    timestamp: new Date(),
    type: 'left',
  });
  return true;
}

var stopTaskP = phone(stopTask);

function closeTask(userId, taskCode, ignoreUser) {
  var user = Meteor.users.findOne({_id: userId});
  if (!user && !ignoreUser) {
    return null;
  }
  var search = {status: 'open'};
  if (taskCode) {
    search.code = taskCode;
  } else {
    search.workers = userId;
  }
  var task = Tasks.findOne(search);
  if (!task) {
    return false; // none closable
  }
  var uid = user ? user._id : null;

  // XXX this is a bad way of doing this... the text message notification only
  // works on the server side because it uses Meteor.npmRequire
  if (Meteor.isServer) {
    var workers = task.workers;
    for (var i = 0; i < workers.length; i++) {
      var worker = workers[i];
      if (worker !== uid) {
        var target = Meteor.users.findOne({_id: worker});
        if (target) {
          sendMessage(target.profile.phone, "Task " + task.code + " (" + task.description + ") was closed.");
        }
      }
    }
  }

  Tasks.update({_id: task._id}, {$set: {status: 'closed', workers: [], closed: new Date(), closedBy: uid}});
  Events.insert({
    userId: uid,
    taskId: task._id,
    timestamp: new Date(),
    type: 'closed',
  });

  return task.code;
}

var closeTaskP = phone(closeTask);

function subscribe(userId, channelId) {
  var channel = Channels.findOne({_id: channelId});
  if (!channel) {
    return false;
  }
  Meteor.users.update({_id: userId}, {$addToSet: {'profile.channels': channel._id}});
  return true;
}

function unsubscribe(userId, channelId) {
  var channel = Channels.findOne({_id: channelId});
  if (!channel) {
    return false;
  }
  Meteor.users.update({_id: userId}, {$pull: {'profile.channels': channel._id}});
  return true;
}

function createChannel(userId, name, color) {
  var user = Meteor.users.findOne({_id: userId});

  if (!user){
    return null;
  }

  var channelId = Channels.insert({
    name: name,
    color: color
  });

  return channelId;
}

var createChannelP = phone(createChannel);

Meteor.methods({
  isApproved: isApproved,
  verify: verify,
  setStatus: setStatus,
  setStatusP: setStatusP,
  createTask: createTask,
  startTask: startTask,
  startTaskP: startTaskP,
  stopTask: stopTask,
  stopTaskP: stopTaskP,
  current: current,
  currentP: currentP,
  closeTask: closeTask,
  closeTaskP: closeTaskP,
  subscribe: subscribe,
  unsubscribe: unsubscribe,

  createChannel: createChannel,
  createChannelP: createChannelP
});
