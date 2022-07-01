const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes("password")) {
                throw new Error("Password can't be password")
            }
        } 
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value<0) {
                throw new Error("Age must be a positive number")
            }
        }
    },
    //To save the tokens when user logs in so that logging out from one device doesn't log him out of all devices
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar // to reduce response time

    return userObject
}

//The function defined using methods can be used on instances (instance methods)
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//The function defined using statics can be called directly on model (model methods)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Here we can't use arrow function as it uses this binding over here
//Runs before a user is saved
userSchema.pre('save', async function (next) {
    const user = this //this is the document that is being saved
    
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Runs before a user is removed
userSchema.pre("remove", async function (next) {
    await Task.deleteMany({ owner: this._id })
    next()
})


const User = mongoose.model("User", userSchema )

module.exports = User

// const me = new User({
//     name: "Debesh Ray    ",
//     password: "qwerty123",
//     email: "DebeshRay66@gmail.com"
// })

// me.save().then(() => {
//     console.log(me)
//    }).catch((error) => {
//     console.log('Error!', error)
// })