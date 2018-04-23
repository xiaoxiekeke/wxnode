'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var ChapterSchema = new mongoose.Schema({
  title:String,
  subTitle:String,
  weather:String,
  content:[String],
  price:Number,
  storyDate:String,
  eventId:[String],
  eventFinish:[String],
  mysteryId:[String],
  addressId:String,
  addressIdAdd:String,
  addressIdRemove:String,
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

ChapterSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Chapter', ChapterSchema)
