'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var UserSchema = new mongoose.Schema({
  openid:String,
  amount:Number,
  gender:Number,
  avatarUrl:String,
  wxacodeUrl:String,
  hasbanned:Boolean,
  medal:Number,
  optionScore:Number,
  nickName: String,
  activeAddress:String,
  address:[String],
  chapter:[String],
  explored:[String],
  mystery:[String],
  event:[String],
  eventFinish:[String],
  messages:[String],
  unLockResult:[String],
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
