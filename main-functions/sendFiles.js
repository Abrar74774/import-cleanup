import mailchimpClient from '../mailchimp.cjs'
export default function sendFiles(emailAddress = process.env.DEFAULT_RECEIVER_EMAIL, sourceFileName = "addresses", fileList) {
    if (!emailAddress) {
        console.error('function sendFiles require an email address')
        throw Error('Email address not found')
    }
    sourceFileName = sourceFileName.split(".").slice(0, -1).join('.')
    const message = {
        text: 'File attached, for testing.',
        subject: 'Address validation results',
        from_email: 'ziot@zenduit.com',
        from_name: 'ZIoT',
        to: [{
            email: emailAddress,
            type: 'to'
        }],
        attachments: fileList.map( (file, i) => ({
            type: 'text/csv',
            name: `${sourceFileName}-validated-${i + 1}of${fileList.length}.csv`,
            content: Buffer.from(file).toString('base64')
        }))
    };

    return mailchimpClient.messages.send({ message: message })
}