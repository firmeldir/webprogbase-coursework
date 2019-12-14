const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
    name: {type: String, required: true},

    description: {type: String, required: true},

    price: {type: Number, required: true, default: 0},

    lectures: [{type: String}]
});

const Subject = mongoose.model('subject', SubjectSchema);

module.exports = Subject;
