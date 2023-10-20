const mongoose = require("mongoose");

const eventSchema= mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required: true},
    reminder:{type:String, required:true},
    type:{type:String, required:true},
})

module.exports= mongoose.model('Reminder',eventSchema);