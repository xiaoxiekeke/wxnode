'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var UserSchema = new mongoose.Schema({
  amount:Number,
  avatar:String,
  hasbanned:Boolean,
  medal:Number,
  optionScore:Number,
  nickname: String,
  activeAddress:String,
  address:[String],
  chapter:[String],
  mystery:[String],
  event:[String],
  messages:[String],
  unLockResult:[String],
  // clockin:Number,
  // lastclockTime:{
  //   type:Date,
  //   default:Date.now()
  // },
  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    }
  }
})

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('User', UserSchema)
