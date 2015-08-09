// ---------------------------------------
// Meteor Methods
// ---------------------------------------

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
  Tasks.insert({
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
    console.log(userId);
    console.log(task);
    console.log(user);
    console.log(current);
    return null; // user is already working on something
  }
  if (task.workers.length >= task.max) {
    return false; // full
  }
  Tasks.update({_id: task._id}, {$push: {workers: userId}});
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
  return true;
}

var stopTaskP = phone(stopTask);

function closeTask(userId, taskCode) {
  var user = Meteor.users.findOne({_id: userId});
  if (!user) {
    return null;
  }
  var search = {status: 'open'};
  if (taskCode) {
    search.code = taskCode;
  } else {
    search.workers = userId;
  }
  var tasks = Tasks.findOne(search);
  if (!tasks) {
    return false; // none closable
  }
  // TODO send out a notification to all current workers before closing
  Tasks.update({_id: tasks._id}, {$set: {status: 'closed', workers: [], closed: new Date(), closedBy: user._id}});
  return tasks.code;
}

var closeTaskP = phone(closeTask);

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
});
