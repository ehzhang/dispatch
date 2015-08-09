// ---------------------------------------
// Meteor Methods
// ---------------------------------------

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
    func.apply(null, args);
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

function createTask(creatorId, description) {
  Tasks.insert({
    title: '',
    description: description,
    created: new Date(),
    closed: null,
    createdBy: creatorId,
    closedBy: null,
    workers: [],
    notified: [],
    status: 'open',
  });
}

var createTaskP = phone(createTask);

Meteor.methods({
  isApproved: isApproved,
  verify: verify,
  setStatus: setStatus,
  setStatusP: setStatusP,
});
