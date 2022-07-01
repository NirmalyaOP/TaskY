const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = express.Router()

router.post("/tasks", auth, async (req,res) => {
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch(err) {
        res.status(400).send(err)
    }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})



//GET /tasks?completed=true(or)false
//GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt_desc(or)asc
router.get("/tasks", auth, async (req,res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = (req.query.completed === "true")
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split("_")
        sort[parts[0]] = (parts[1] === "asc") ? 1 : -1
    }

    try {
        //const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: "tasks",
            match, 
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch(err) {
        res.status(500).send()
    }
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})

router.get("/tasks/:id", auth, async (req,res) => {
    const _id = req.params.id

    try {
        //const task = await Task.findById(_id)

        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch(err) {
        res.status(500).send()
    }

    // Task.findById(_id).then((task) => {
    //     if(!task) { //As getting nothing is treated as success by mongoose so we have conditional
    //         return res.status(404).send()
    //     }        
    //     res.send(task)
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})



router.patch("/tasks/:id", auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowed = [ "description", "completed" ]
    const isValid = updates.every((update) => allowed.includes(update))

    if(!isValid) {
        return res.status(400).send({error: "Invalid update field"})
    }

    try {
        // const task = await Task.findById(req.params.id)
        
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        
        updates.forEach((update) => {task[update] = req.body[update]})
        await task.save()

        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(err) {
        res.status(400).send()
    }
})



router.delete("/tasks/:id", auth, async (req, res) => {
    try {

        const task = await Task.findOneAndDelete({ _id:req.params.id, owner:req.user._id })

        //const task = await Task.findByIdAndDelete(req.params.id)
        if(!task) {
            res.status(404).send({error: "Invalid id"})
        }
        res.send(task)
    } catch(err) {
        res.status(500).send()
    }
})


module.exports = router