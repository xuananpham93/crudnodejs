const moment = require('moment');
const Note = require('../models/note.model');
const utils = require('../helpers/utils');
// const constants = require('../helpers/constants');

exports.findAllNotes = async (req, res) => {
    console.log(1);
    let notes = await Note.find()
        .then((notes) => {
            console.log(2);
            return notes;
        })
        .catch(err => {
            utils.send_error_500(res, err);
        });

    utils.calc_test();
    console.log(3);
    utils.sendData(res, notes, 'Success');
};

exports.createNote = (req, res) => {
    var note = new Note();

    note.task = req.body.task;

    note.save((err) => {
        if (!err) {
            utils.sendData(res, note, 'Success');
        } else {
            utils.sendData(res, [], err.message, 1);
        }
    });
};

exports.updateNote = (req, res) => {
    Note.findByIdAndUpdate(req.body._id, {
        task: req.body.task,
        updateAt: moment().unix()
    }, { new: true })
        .then(note => {
            if (!note) {
                utils.sendData(res, [], 'Not found', 0);
            } else {
                utils.sendData(res, note, 'Success', 0);
            }
        }).catch(err => {
            utils.send_error_500(res, err);
        });
};

exports.findOneNote = (req, res) => {
    Note.findById(req.body._id)
        .then(note => {
            if (!note) {
                utils.sendData(res, [], 'Not found', 0);
            } else {
                utils.sendData(res, note, 'Success', 0);
            }
            res.send(note);
        }).catch(err => {
            utils.send_error_500(res, err);
        });
};

exports.deleteNote = (req, res) => {
    Note.findByIdAndRemove(req.body._id)
        .then(note => {
            if (!note) {
                utils.sendData(res, [], 'Not found', 0);
            } else {
                utils.sendData(res, [], 'Success', 0);
            }
        }).catch(err => {
            utils.send_error_500(res, err);
        });
};