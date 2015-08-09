// Admin have all rights
window.authorized = {
  user: function(){
    return Meteor.userId() ? true : false;
  },
  admin: function(){
    return Meteor.user() && Meteor.user().roles.admin;
  },
  mentor: function(){
    return Meteor.user() && Meteor.user().roles.mentor;
  }
};
