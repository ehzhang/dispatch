Template.eventFeed.onCreated(function () {
  // Use this.subscribe inside onCreated callback
  this.subscribe("recentEvents");
});

Template.eventFeed.helpers({
  'events' : function(){
    return Events.find({

    }, {
      sort: {
        timestamp: -1
      },
      limit: 20
    });
  },

});

Template.eventFeedEvent.onRendered(function(){
  $(this.find('.event')).transition('scale in');
});

Template.eventFeedEvent.helpers({
  'eventUser': function(){
    return Meteor.users.findOne({
      _id: this.userId
    });
  },
  'eventTask': function(){
    return Tasks.findOne({
      _id: this.taskId
    });
  },
  'timeAgo': function(){
    var now = this.timestamp > ReactiveNow.get() ?
      this.timestamp : ReactiveNow.get();
    return moment(this.timestamp).from(now);
  }
});