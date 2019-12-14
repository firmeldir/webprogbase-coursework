const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
    subjects: [{type: mongoose.mongo.ObjectId, ref: 'subjects'}],
    headline: {type: String, required: true},
    linkedin: {type: String, required: true},
    facebook: {type: String, required: true},
    reddit: {type: String, required: true},
    twitter: {type: String, required: true}
});

const Teacher = mongoose.model('teacher', TeacherSchema);

module.exports = Teacher;
