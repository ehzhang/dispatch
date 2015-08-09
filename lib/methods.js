// ---------------------------------------
// Meteor Methods
// ---------------------------------------

Meteor.methods({
  isApproved: isApproved,
  verify: verify,
});

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

// higher order function to more easily call the things that take in
// a user id instead of a phone number
function phone(func) {
  return function(phoneNumber) {
    var rest = arguments.slice(1);
    var user = Meteor.users.findOne({phone: phoneNumber});
    var id = user ? user._id : '';

    rest.unshift(id);
    func.apply(rest);
  };
}

function createTask(creatorId, description) {
  Tasks.insert({
    title: '',
    description: description,
    created: new Date(),
    closed: null,
    createdBy: creatorId,
    closedBy: null,
    workers: [],
    status: 'open',
  });
}

var createTaskP = phone(createTask);
