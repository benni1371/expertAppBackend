var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
  username: {
        type: String,
        unique: true,
        required: true,
        unique: true
    },
  hash_password: {
        type: String,
        required: true
    },
    pictureurl: String
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model('User', UserSchema);