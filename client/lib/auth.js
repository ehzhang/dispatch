// Admin have all rights
window.authorized = {
  user: function(){
    return Meteor.userId() ? true : false;
  },
  admin: function(){
    return Meteor.user() && Meteor.user().admin;
  },
  mentor: function(){
    return Meteor.user() && Meteor.user().mentor;
  }
};
