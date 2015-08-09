// Collections

var Schemas = {};

/**
 * Task
 */
Tasks = new Mongo.Collection('tasks');

Schemas.Task = new SimpleSchema({
  description: {
    type: String,
    label: 'Description'
  },

  code: {
    type: String, // 4 digit number, TODO validate this
    label: 'Code'
  },

  created: {
    type: Date,
    label: 'Time Created'
  },

  closed: {
    type: Date,
    label: 'Time Closed',
    optional: true
  },

  createdBy: {
    type: String,
    label: 'Creator Id'
  },

  closedBy: {
    type: String,
    label: 'Closer Id',
    optional: true
  },

  min: {
    type: Number,
    label: 'Minimum number of workers',
  },

  max: {
    type: Number,
    label: 'Maximum number of workers',
  },

  workers: {
    type: [String],
    label: 'Works on Task'
  },

  notified: {
    type: [String],
    label: 'Notified about Task'
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
  },

  color: {
    type: String,
    label: "Channel Color"
  },
});

Channels.attachSchema(Schemas.Channel);

/**
 * Users:
 * {
 *    profile: {
 *      name: STRING,
 *      phone: STRING,
 *      channels: [String]
 *      online: Boolean
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
