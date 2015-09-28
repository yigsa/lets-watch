let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let nodeify = require('bluebird-nodeify')

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  friends: [String], // A list of the user's friends
  currentlyWatching: String // Title of the video the user is currently watching
})

userSchema.methods.generateHash = async function(password) {
  return await bcrypt.promise.hash(password, 8)
}

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.promise.compare(password, this.password)
}

// before saving user to the database
userSchema.pre('save', function (callback) {
  nodeify(async() => {
    if(!this.isModified('password')) {
      return callback()
    }
    this.password = await this.generateHash(this.password)
  }(), callback)
})

module.exports = mongoose.model('User', userSchema)