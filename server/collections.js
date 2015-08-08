// Collections

/**
 *
 * Task
 *  {
 *     userId: STRING,
 *     title: STRING,
 *     description: STRING,
 *     timestamp: Number (Milliseconds),
 *     status: STRING [OPEN, CLOSED],
 *     expiresAt: Number (Milliseconds),
 *     claimTime: Number (Milliseconds)
 *     completeTime: Number (Milliseconds)
 *     comments: STRING
 *  }
 *
 */
Tasks = new Meteor.Collection('task');

/**
 * Settings contain all of the information that can be edited on the client side.
 *
 * There is and should only be a single document.
 * {
 * }
 */
Settings = new Meteor.Collection('settings');

/**
 * Users:
 * {
 *    profile: {
 *      name: STRING
 *      email: STRING
 *      phone: STRING
 *      company: STRING
 *      mentor: BOOLEAN
 *      admin: BOOLEAN
 *      skills: [STRING]
 *    }
 * }
 */

// ----------------------------------------
// Collection Permissions
// ----------------------------------------

Meteor.users.allow({
  // Update users, only if Admin
  update: function(userId, doc){
    var user = _getUser(userId);
    return user.profile.admin;
  }
});