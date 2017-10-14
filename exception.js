var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var exceptionSchema   = new Schema({
    name: String,
    description: String,
});

module.exports = mongoose.model('Exception', exceptionSchema);
