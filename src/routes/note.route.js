module.exports = (app) => {
    const notes = require('../controllers/note.controller.js');


    app.get('/api/findAllNotes', notes.findAllNotes);

    app.post('/api/createNote', notes.createNote);

    app.post('/api/updateNote', notes.updateNote);

    app.post('/api/findOneNote', notes.findOneNote);

    app.post('/api/deleteNote', notes.deleteNote);
};
