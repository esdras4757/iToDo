const mongoose= require('mongoose');

const taskSchema = new mongoose.Schema({
    title:{required:true,type:String},
    isCompleted:{required:false,type:Boolean},
    isImportant:{required:false,type:Boolean},
    isPendind:{required:false,type:Boolean},
    isInProgress:{required:false,type:Boolean},
    description:{required:false,type:String},
    reminder:{required:false,type:String},
    initAt:{required:false,type:String},
    endAt:{required:false,type:String},
    fileId:{required:false,type:String},
    note:{required: false,type:String},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required: true},
    categoryId:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required: false},
    originalFileName:{required:false,type:String},
    priority:{required:false,type:String},
    stylePriority:{required:false,type:String},
    color:{type:String, required:false},
    myDay:{type:String, required:false},
})

module.exports = mongoose.model('Task',taskSchema);