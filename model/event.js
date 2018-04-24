'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId


var EventSchema = new mongoose.Schema({
  title:String,
  content:[String],
  desc:String,
  price:Number,
  // toChapterId:String,
  // mId:String,
  toChapterId:{
    type: ObjectId,
    ref: 'Chapter'
  },
  mId:{
    type: ObjectId,
    ref: 'Mystery'
  },
  remarks:String,
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

EventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Event', EventSchema)
