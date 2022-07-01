const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
})

const Task = mongoose.model("Task", taskSchema )

module.exports = Task


// const my_task = new Task({
//     description: "Watch CSK vs KKR",
//     // completed: false
// })

// my_task.save().then(() => {
//     console.log(my_task)
// }).catch((error) => {
//     console.log(error)
// })