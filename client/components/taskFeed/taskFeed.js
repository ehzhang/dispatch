Template.taskFeed.onCreated(function(){
  this.subscribe('openTasks');
});

Template.taskFeed.helpers({
  'openTasks': function(){
    return Tasks.find({
      status: 'open'
    }, {sort: {created: -1}});
  }
});

Template.openTask.helpers({
  'isOnTask': function(){
    return this.workers.indexOf(Meteor.userId()) > - 1;
  },
  'notAlreadyTasked': function(){
    return !Tasks.findOne({
      status: 'open',
      workers: {
        $in: [Meteor.userId()]
      }
    });
  },
  'taskCreator': function(){
    var user = Meteor.users.findOne({_id: this.createdBy});
    if (user && user.profile.name){
      return user.profile.name;
    }
    return 'A Robot';
  },
  'taskWorkers': function(){
    return this.workers.map(function(userId){
      return Meteor.users.findOne({_id: userId});
    });
  },
  'taskChannels': function(){
    return this.channels.map(function(id){
      return Channels.findOne({_id: id});
    });
  },
  'usersNeeded': function(){
    return this.max - this.workers.length;
  }
});

Template.openTask.events({
  'click .join.button': function(){
    var code = this.code;
    Meteor.call('startTask', Meteor.userId(), code);
  },
  'click .unjoin.button': function(){
    Meteor.call('stopTask', Meteor.userId());
  }
});

Template.taskFeedFacebookUserAvatar.helpers({
  'facebookImageUrl': function(){
    if (this.services && this.services.facebook){
      return 'https://graph.facebook.com/' +
        this.services.facebook.id +
        '/picture?type=large';
    } else {
      return '/assets/images/stardust.png';
    }
  },
});