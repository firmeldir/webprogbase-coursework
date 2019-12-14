const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    name: {type: String, required: true},

    taskText: {type: String, required: true},
    additionText: {type: String},
    maxScore: {type: Number, required: true, default: 0},

    taskFile: {type: String},
   
    subject: {type: mongoose.mongo.ObjectId, ref: 'subjects'},

    pushedAt: {type: Date , required: true, default: Date.now}
});

const Task = mongoose.model('task', TaskSchema);

module.exports = Task;






