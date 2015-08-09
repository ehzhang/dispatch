SyncedCron.start();

// returns true if task a is higher priority than task b
// for the user
var higherPriority = function(user) {
  return function(a, b) {
    if (!b) return true;
    return false; // TODO do something smarter based on specificity for the user
  };
};

SyncedCron.add({
  name: 'Master scheduling algorithm',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 5 seconds');
  },
  job: function() {
    var tasks = Tasks.find({status: 'open'}).fetch();
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      if (task.workers.length >= task.max) continue; // no people needed
      var users = task.users;
      var channels = task.channels;
      var candidates;
      if (users.length > 0) {
        candidates = Meteor.users.find({_id: {$in: users}}).fetch();
      } else {
        candidates = Meteor.users.find({'profile.channels': {$in: channels}}).fetch();
      }
      for (var j = 0; j < candidates.length; j++) {
        var candidate = candidates[j];
        if (task.notified.indexOf(candidate._id) !== -1) continue; // already notified
        var current = Tasks.findOne({status: 'open', workers: candidate._id});
        if (higherPriority(candidate)(task, current)) {
          // notify the candidate
          // TODO actually notify instead of logging to console
          console.log('NOTIFYING ' + candidate._id + ' about ' + task.code);
          Tasks.update({_id: task._id}, {$push: {notified: candidate._id}});
        }
      }
    }
  }
});
