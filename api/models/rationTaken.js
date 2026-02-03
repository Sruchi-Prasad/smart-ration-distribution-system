const mongoose = require('mongoose');
const rationTakenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
});

const RationTaken = mongoose.model("RationTaken", rationTakenSchema);

module.exports = RationTaken;