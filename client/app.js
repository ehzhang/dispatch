Tasks = new Meteor.Collection("tasks");
Channels = new Meteor.Collection("channels");
Events = new Meteor.Collection("eventsh");

Meteor.subscribe("userData");
Meteor.subscribe("allUsers");
