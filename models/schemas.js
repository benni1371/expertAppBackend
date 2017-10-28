var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var commentSchema = new Schema({
    content  : String,
    date  : Date,
    author : String,
    location: { type: [Number], index: '2dsphere'}
});

module.exports.commentSchema = mongoose.model('Comment', commentSchema);

var exceptionSchema   = new Schema({
    name: String,
    pictureurl: String,
    description: String,
    date  : Date,
    author : String,
    comments  : [commentSchema],
    //GeoJSON for spatial data
    location: { type: [Number], index: '2dsphere'}
});

module.exports.exceptionSchema = mongoose.model('Exception', exceptionSchema);