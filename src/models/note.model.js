const mongoose = require('mongoose');
const moment = require('moment');

const NoteSchema = mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    status: Number,
    createAt: { type: Number, default: moment().unix() },
    updateAt: { type: Number, default: moment().unix() },
});

module.exports = mongoose.model('Note', NoteSchema);
