Tasks = new Meteor.Collection("tasks");
Channels = new Meteor.Collection("channels");

Meteor.subscribe("userData");
Meteor.subscribe("allUsers");
