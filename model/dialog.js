'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var DialogSchema = new mongoose.Schema({
  content:String,
  desc:String,
  dialogType:Number,
  afterSelect:Boolean,
  addressId:{
    type: ObjectId,
    ref: 'Address'
  },
  roleId:{
    type: ObjectId,
    ref: 'Role'
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

DialogSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Dialog', DialogSchema)
