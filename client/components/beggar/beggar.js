Template.beggar.helpers({
  'needsPhone': function(){
    return Meteor.user() &&
      !Meteor.user().profile.phone &&
      Meteor.user().roles &&
      !Meteor.user().roles.verified;
  },
  'unverified': function(){
    return Meteor.user() &&
      Meteor.user().profile.phone &&
      Meteor.user().roles &&
      Meteor.user().roles.verified;
  },
});

Template.beggar.events({
  'click .submit.button': function(e, t){
    var num = $('#beggar .phone-number').val();
    Meteor.call('setPhone', Meteor.userId(), num);
  },
  'click .resend.verification.button': function(e, t){
    Meteor.call('setPhone', Meteor.userId(), Meteor.user().profile.phone);
  }
});