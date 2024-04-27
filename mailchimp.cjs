
const dotenv = require('dotenv')
dotenv.config()
const mailchimpClient = require("@mailchimp/mailchimp_transactional")(
    process.env.MANDRILL_API_KEY
);

module.exports = mailchimpClient;
