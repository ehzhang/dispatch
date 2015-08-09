// -----------------------
// UI Helpers
// -----------------------

// Get a constant from the constants.js
UI.registerHelper('constant', function(variable){
  return window.CONSTANTS[variable];
});

// -----------------------
// Handlebars Helpers
// -----------------------

// Check if a user is a certain role
UI.registerHelper('userIs', function(role){
  return authorized[role]();
});

UI.registerHelper('facebookImageUrl', function(user){
  if (user && user.services && user.services.facebook){
    return 'https://graph.facebook.com/' +
      user.services.facebook.id +
      '/picture?type=large';
  } else {
    return '/assets/images/stardust.png';
  }
});