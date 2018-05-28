'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var TimelineSchema = new mongoose.Schema({
  medal:Number,
  inviterId:{
    type:ObjectId,
    ref:'User'
  },
  inviteesId:{
    type:ObjectId,
    ref:'User'
  },
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

TimelineSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Timeline', TimelineSchema)
