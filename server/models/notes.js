const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    title:{type:String, required:false},
    content:{type:String, required:false},
    reminder:{type:String, required:false},
    isImportant:{type:Boolean, required:false},
    initAt:{type:String, required:false},
    endAt:{type:String, required:false},
    userId:{type:String, required:true},
    color:{type:String, required:false},
    categoryId:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required: false},
    postponed:{type:Boolean, required:false}
}, {
    timestamps: true  // Habilita la creación de los campos 'createdAt' y 'updatedAt'
  })

module.exports = mongoose.model('Note', noteSchema);