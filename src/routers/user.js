const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const auth = require("../middleware/auth")
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account")
const router = express.Router()


router.post("/users", async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (err) {
        res.status(400).send(err)
    }

    // user.save().then(() => {
    //     res.status(201).send(user) //201 is for created
    // }).catch((error) => {
    //     res.status(400).send(error) //first change status then send error(success status and error makes system unstable)
    // })
})

router.post("/users/login", async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send()
    }
})

router.post("/users/logout", auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }   
})

router.post("/users/logoutAll", auth, async (req,res) => {
    try {
        req.user.tokens = []

        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }   
})

router.get("/users/me", auth, async (req,res) => {
    res.send(req.user)

    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})

// router.get("/users/:id", async (req,res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)
// //We get 404 if we keep id format same but give an id which isn't present (same format means length and alphanumerics)
//         if(!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch(err) {
//         res.status(500).send()
//     }

//     // User.findById(_id).then((user) => {
//     //     if (!user) {
//     //     return res.status(404).send()
//     //     }
//     //     res.send(user)
//     //     }).catch((e) => {
//     //     res.status(500).send()
//     // })

// })

router.patch("/users/me", auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"]
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) {
        return res.status(400).send({error: "Invalid Updates!"})
    }

    try {
        //const user = await User.findById(req.params.id)


        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        
        //findByIdAndUpdate surpasses the middleware
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators:true })

        // if(!user) {
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch(err) {
            return res.status(400).send(err)
    }
})

router.delete("/users/me", auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     return res.status(404).send({error:"invalid id"})
        // }
        sendCancelEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (err) {
        res.status(500).send()
    }
})



const upload = multer({
    limits: {
        fileSize: 1000000 //1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image file."))   
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
    
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-Type", "image/png")
        res.send(user.avatar)
    } catch(err) {
        res.status(400).send()
    }
})


module.exports = router