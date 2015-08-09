Router.onBeforeAction(function() {

  if (!Meteor.userId()) {
    this.render('splash');
  }

  else {
    this.next();
  }

});

Router.route('/', function(){
  this.layout('sidebarLayout');
  this.render('home');
});

Router.route('/create', function(){
  this.layout('sidebarLayout');
  this.render('create');
});

Router.route('/channels', function(){
  this.layout('sidebarLayout');
  this.render('channels');
});