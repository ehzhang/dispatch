// Collections

var Schemas = {};

/**
 * Task
 */
Tasks = new Mongo.Collection('tasks');

Schemas.Task = new SimpleSchema({
  title: {
    type: String,
    label: 'Title'
  },

  description: {
    type: String,
    label: 'Description'
  },

  created: {
    type: Date,
    label: 'Time Created'
  },

  closed: {
    type: Date,
    label: 'Time Closed'
  },

  createdBy: {
    type: String,
    label: 'Creator Id'
  },

  closedBy: {
    type: String,
    label: 'Closer Id'
  },

  workers: {
    type: [String],
    label: 'Works on Task'
  },

  status: {
    type: String,
    allowedValues: ['open', 'closed'],
  }

});

Tasks.attachSchema(Schemas.Task);

/**
 * Events
 */

Events = new Mongo.Collection('events');

Schemas.Event = new SimpleSchema({
  userId: {
    type: String,
    label: "User Id"
  },
  taskId: {
    type: String,
    label: "Task Id"
  },
  timestamp: {
    type: Date,
    label: "Time of Event"
  },
  type: {
    type: String,
    label: "Type of Event",
    allowedValues: ['created', 'joined', 'left', 'closed']
  }
});

Events.attachSchema(Schemas.Event);

/**
 * Channels
 */

Channels = new Mongo.Collection('channels');

Schemas.Channel = new SimpleSchema({
  name: {
    type: String,
    label: "Channel Name"
  }
});

Channels.attachSchema(Schemas.Channel);

/**
 * Users:
 * {
 *    profile: {
 *      name: STRING,
 *      phone: STRING,
 *      channels: [String]
 *    },
 *    roles: {
 *      admin: Boolean,
 *      verified: Boolean, // phone number verified
 *      approved: Boolean, // approved by admin
 *    }
 * }
 */

// ----------------------------------------
// Collection Permissions
// ----------------------------------------

// Meteor.users.allow({
//   // Update users, only if Admin
//   // update: function(userId, doc){
//   //   var user = _getUser(userId);
//   //   return user.profile.admin;
//   // }
// });
