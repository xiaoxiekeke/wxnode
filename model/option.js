'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var OptionSchema = new mongoose.Schema({
  addressId:{
    type:ObjectId,
    ref:'Address'
  },
  chapterId:String,
  unlockAddressId:String,
  addAddressId:String,
  removeAddressId:String,
  medal:Number,
  name:String,
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

OptionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Option', OptionSchema)
