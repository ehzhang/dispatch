Template.channels.onCreated(function(){
  this.color = new ReactiveVar();
  this.colors = [
      "#1abc9c",
      "#2ecc71",
      "#3498db",
      "#9b59b6",
      "#34495e",
      "#16a085",
      "#27ae60",
      "#2980b9",
      "#8e44ad",
      "#2c3e50",
      "#f1c40f",
      "#e67e22",
      "#e74c3c",
      "#d35400"
    ];
});

Template.channels.helpers({
  'channels': function(){
    return Channels.find({}, {sort: {name: 1}});
  },
  'channelUsers': function(){
    var channelId = this._id;
    return Meteor.users.find({
      'profile.channels': {
        $in: [channelId]
      }
    });
  },
  'isSubscribed': function(){
    var channelId = this._id;
    if (Meteor.user().profile.channls){
      return Meteor.user().profile.channels.indexOf(channelId) > -1;
    }

    return false;
  }
});

Template.channels.events({
  'keyup #name': function(e, t){
    e.target.value = e.target.value.replace(/\s/g, "");
  },
  'click #submit': function(e, t){
    e.preventDefault();
    var name = $('#name').val();
    var color = t.colors[Math.floor(Math.random() * t.colors.length)];
    Meteor.call('createChannel', Meteor.userId(), name, color, function(){

      $('#name').val("");

      sweetAlert("Woo!", "Your channel has been created.", "success");

    });
  },
  'click .subscribe': function(e, t){
    var channelId = this._id;
    Meteor.call('subscribe', Meteor.userId(), channelId);
  },
  'click .unsubscribe': function(e, t){
    var channelId = this._id;
    Meteor.call('unsubscribe', Meteor.userId(), channelId);
  }
});