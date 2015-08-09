Tasks = new Meteor.Collection("tasks");
Channels = new Meteor.Collection("channels");
Events = new Meteor.Collection("events");

Meteor.subscribe("userData");
Meteor.subscribe("allUsers");