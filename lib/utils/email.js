const sgMail = require("@sendgrid/mail");

// CUSTOM IMPORTS
const utilConfig = require("../Config");

sgMail.setApiKey(utilConfig.get().email.SENDGRID_API_KEY);

module.exports.sendMail = ({ from = utilConfig.get().email.DEFAULT_SENDER, to, subject, text, html }) => {
    const msg = {
        from,
        to,
        subject,
        text,
        html,
    };

    return sgMail
        .send(msg)
        .then((response) => {
            return [true, response];
        })
        .catch((error) => {
            return [false, error];
        });
};
