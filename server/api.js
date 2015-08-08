var base = '/api/';

var api = [
{
  endpoint: 'restful',
  get: function(){
    this.response.end('get request\n');
  },
  post: function(){
    this.response.end('post request\n');
  }
}
];

// Build the API
api.forEach(function(endpoint){
  Router
    .route(base + endpoint.endpoint, {where: 'server'})
    .get(endpoint.get)
    .post(endpoint.post);
});