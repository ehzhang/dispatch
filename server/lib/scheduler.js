SyncedCron.start();

SyncedCron.add({
  name: 'Master scheduling algorithm',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 5 seconds');
  },
  job: function() {
    console.log('hai ' + new Date());
  }
});
