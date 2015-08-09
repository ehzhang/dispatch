Template.sidebarNav.events({
  'click #logout': function(e){
    Meteor.logout();
  }
});