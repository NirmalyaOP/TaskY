const express = require("express")
require("./db/mongoose") //We only need to establish the connection with the database, for that mongoose.js should just run
const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log("Server is up on port " + port)
})


// const multer = require("multer")
// const upload = multer({
//     dest: "images",
//     limits: {
//         fileSize: 1000000 //1 MB
//     },
//     fileFilter(req, file, cb) {
//         //match is used for matching regular expression $ used for end \. search for . and the entire regex should be within //
//         if(!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error("Please upload a Word Document"))
//         }

//         cb(undefined, true)

//         // 3 ways by which we can call the cb
//         // cb(new Error("File must be pdf")) //give error
//         // cb(undefined, true)   //no error accept the file
//         // cb(undefined, false)  //no error but reject the file
//     }
// })


// app.post("/upload", upload.single("upload"), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })



// const Task = require("./models/task")
// const main = async () => {
//     const task = await Task.findById("623ec6a63787a976ec700e08")
//     await task.populate('owner').execPopulate()
//     console.log(task.owner)
// }

// main()

// const User = require("./models/user")
// const main = async () => {
//     const user = await User.findById("623ec5b057b72927b8f0cfe1")
//     await user.populate("tasks").execPopulate()
//     console.log(user.tasks)
// }

// main()