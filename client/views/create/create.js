// Create View code
Template.create.onCreated(function(){
  // Needs to know all users
  this.subscribe('allUsers');

  this.taskPeople = new ReactiveVar(1);
  this.taskSelectedChannels = new ReactiveVar({});
  this.taskSelectedUsers = new ReactiveVar({});
  this.taskDescription = new ReactiveVar("");

  this.taskStates = [
    {
      name: 'number',
      confirmText: 'Continue',
    },
    {
      name: 'people',
      confirmText: 'Done Selecting'
    },
    {
      name: 'task',
      confirmText: 'Make it so!'
    }
  ];
  this.step = new ReactiveVar(0);

  this.selected = new ReactiveVar('');

  this.filterChannel = new ReactiveVar('');
});

Template.create.helpers({
  'totalUsers' : function(){
    return Meteor.users.find({}).count();
  },
  'taskPeople': function(){
    return Template.instance().taskPeople.get();
  },
  'confirmText': function(){
    var t = Template.instance();
    return t.taskStates[t.step.get()].confirmText;
  },
  'selected': function(item){
    return Template.instance().selected.get() === item ? 'active' : false;
  },
  'isSelectedChannel': function(){
    var channelId = this._id;
    return Template.instance().taskSelectedChannels.get()[channelId];
  },
  'isSelectedUser': function(){
    var userId = this._id;
    return Template.instance().taskSelectedUsers.get()[userId];
  },
  'isFilterChannel': function(){
    var channelId = this._id;
    return Template.instance().filterChannel.get() === channelId;
  },
  'allChannels': function(){
    return [
      {color: '#3498db', name: 'dev', _id: '1'},
      {color: '#9b59b6', name: 'support', _id: '3'},
      {color: '#e67e22', name: 'logs', _id: '5'},
      {color: '#2c3e50', name: 'volunteers', _id: '9'},
    ];
  },
  'selectedChannels': function(){
    var selectedChannels = Template.instance().taskSelectedChannels;
    return Object
      .keys(selectedChannels)
      .map(function(key){
        return selectedChannels[key];
      });
  },
  'selectedUsers': function(){
    var selectedUsers = Template.instance().taskSelectedUsers;
    return Object
      .keys(selectedUsers)
      .map(function(key){
        return selectedUsers[key];
      });
  },
  'channelUsers': function(){
    var channel = this;
    // var users = Users.find({$in: [channel._id]});
    var users = Meteor.users.find({}).fetch();
    return users;
  }

});

Template.create.events({

  // Create number
  'click #inc': function(e, t){
    t.taskPeople.set(
      t.taskPeople.get() < Meteor.users.find({}).count() ?
        t.taskPeople.get() + 1 : t.taskPeople.get()
    );
    t.find('#num-people').value = t.taskPeople.get();
  },
  'click #dec': function(e, t){
    t.taskPeople.set(
      t.taskPeople.get() > 1 ?
        t.taskPeople.get() - 1 : t.taskPeople.get()
    );
    t.find('#num-people').value = t.taskPeople.get();
  },
  'keyup #num-people': function(e, t){
    var val = parseInt(e.target.value.replace(/\D/g,''));
    val = val > 0 ? val : 1;
    t.taskPeople.set(val);
    t.find('#num-people').value = t.taskPeople.get();
  },

  // Advance the state
  'click #next-step': function(e, t){

    var nextStep = t.step.get() + 1;

    if (nextStep >= t.taskStates.length){
      return;
    }

    var step = t.taskStates[nextStep];

    $('#' + step.name).transition('scale in');

    t.step.set(nextStep);
  },

  'click #select-channel': function(e, t){
    t.selected.set('channel');
  },
  'click #select-people': function(e, t){
    t.selected.set('people');
  },
  'click #select-anyone': function(e, t){
    t.selected.set('anyone');
  },

  'click #choose-channel .segment': function(e, t){
    var channelId = this._id;
    var selected = t.taskSelectedChannels.get();
    selected[channelId] = !selected[channelId];
    t.taskSelectedChannels.set(selected);
  },

  'click #choose-people .channel .segment': function(e, t){
    var channelId = this._id;
    t.filterChannel.set(channelId);
  },

  'click #choose-people .choose-person': function(e, t){
    var userId = this._id;
    var selected = t.taskSelectedUsers.get();
    selected[userId] = !selected[userId];
    t.taskSelectedUsers.set(selected);
  }

});