Router.onBeforeAction(function() {
  if (!Meteor.userId()) {
    this.render('splash');
  } else {
    this.next();
  }
});

Router.route('/', function(){
  this.layout('sidebarLayout');
  this.render('home');
});

Router.route('/profile', function(){
  this.layout('bannerLayout');
  this.render('profile');
});