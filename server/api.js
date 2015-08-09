var base = '/api/';

var api = [
  {
    endpoint: 'twilio',
    post: handleTwilio,
    get: function() {
      this.response.end('GET not supported');
    }
  },
  {
    endpoint: 'hackbot',
    post: handleHackbotPost,
    get: handleHackbotGet
  },
  {
    endpoint: 'pebble/:id',
    get: handlePebbleGet
  },
  {
    endpoint: 'pebblestatus/:id',
    get: handlePebbleStatusGet,
    post: handlePebblePost,
  }
];

// Build the API
api.forEach(function(endpoint){
  var route = Router.route(base + endpoint.endpoint, {where: 'server'});
  if (endpoint.get) {
    route.get(endpoint.get);
  }
  if (endpoint.post) {
    route.post(endpoint.post);
  }
});
