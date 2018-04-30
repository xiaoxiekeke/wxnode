'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var AddressSchema = new mongoose.Schema({
  left:Number,
  name:String,
  isActive:Boolean,
  top:Number,
  dialogTypes:Number,
  backgroundImage:String,
  price:Number,
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

AddressSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Address', AddressSchema)
