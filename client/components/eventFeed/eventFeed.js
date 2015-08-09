Template.eventFeed.onCreated(function () {
  // Use this.subscribe inside onCreated callback
  this.subscribe("recentEvents");
});

Template.eventFeed.helpers({
  events : function(){
    return [];
  }
});