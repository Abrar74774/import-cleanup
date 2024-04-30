import emailConfigs from '../config/emailConfigs.js';
import mailchimpClient from '../mailchimp.cjs'
export default function sendFiles(emailAddress = process.env.DEFAULT_RECEIVER_EMAIL, sourceFileName = "addresses", validatedFileList, unvalidatedfileList) {
    if (!emailAddress) {
        console.error('function sendFiles require an email address')
        throw Error('Email address not found')
    }
    sourceFileName = sourceFileName.split(".").slice(0, -1).join('.')
    const message = {
        ...emailConfigs,
        to: [{
            email: emailAddress,
            type: 'to'
        }],
        attachments: validatedFileList.map( (file, i) => ({
            type: 'text/csv',
            name: `${sourceFileName}-validated-${i + 1}of${validatedFileList.length}.csv`,
            content: Buffer.from(file).toString('base64')
        })).concat(unvalidatedfileList.map( (file, i) => ({
            type: 'text/csv',
            name: `${sourceFileName}-unvalidated-${i + 1}of${unvalidatedfileList.length}.csv`,
            content: Buffer.from(file).toString('base64')
        })))
    };

    return mailchimpClient.messages.send({ message: message })
}