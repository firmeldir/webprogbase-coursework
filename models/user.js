const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    login: {type: String, required: true},
    passwordHash: {type: String, required: true},

    fullname: {type: String, required: true},
    avaUrl: {type: String},
    role: {type: Number, required: true, default: 0},

    teacherData: {type: mongoose.mongo.ObjectId, ref: 'teachers'},
   
    registeredAt: {type: Date, default: Date.now},
    isDisabled: {type: Boolean, required: true, default: false}
});

const User = mongoose.model('user', UserSchema);

//    taskList: [{type: mongoose.mongo.ObjectId, ref: 'tasks'}],

module.exports = User;





