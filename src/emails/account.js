const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "nray2615@gmail.com",
        subject: "Welcome",
        text: `Hello ${name}, Thanks for using my Task Management services.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to:email,
        from: "nray2615@gmail.com",
        subject: "We'll miss you!!!",
        text: `Goodbye ${name} Could you please spare a minute and let us know what problem you faced...`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}