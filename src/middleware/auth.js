const jwt = require("jsonwebtoken")
const User = require("../models/user")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id, "tokens.token": token})//As we are using '.' operator, hence we need to enclose the whole property inside double quotes

        if(!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch(e) {
        res.status(401).send({ error: "Please give authorization" })
    }
}

module.exports = auth