const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    type: { type: String, required: true },
    initAt: { type: String, required: true },
    endAt: { type: String, required: true },
    reminder: { type: String, required: false },
    note:{type:String, required:false},
    color:{type:String, required:false},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required: true},
}
)

module.exports= mongoose.model('Event',eventSchema);