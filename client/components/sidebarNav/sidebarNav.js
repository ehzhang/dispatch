Template.sidebarNav.events({
  'click #logout': function(e){
    Meteor.logout();
  }
});

Template.sidebarNav.helpers({
  'name': function(){
    return Meteor.user() && Meteor.user().profile.name ?
      Meteor.user().profile.name.split(' ')[0] : 'Profile';
  }
});