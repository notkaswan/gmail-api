const {google} = require('googleapis');


module.exports = async function sendMail(auth, message) {
    const gmail = google.gmail({version: 'v1', auth})
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From'],
    })

    //getting all the details to send the mail.
    const subject = res.data.payload.headers.find((header) => header.name === 'Subject').value
    const from = res.data.payload.headers.find((header) => header.name === 'From').value
    const replyTo = from.match(/<(.*)>/)[1]
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
    const replyBody = `Hi, this is an automated mail and i will reach out as soon as possible.`
    const rawMsg = [
        `from: me`,
        `to: ${replyTo}`,
        `subject: ${replySubject}`,
        `In-Reply-To: ${message.id}`,
        `References: ${message.id}`,
        '',
        replyBody
    ].join('\n');
    const encodedMail = Buffer.from(rawMsg).toString("base64").replace(/\+/g, '-').replace(/\//g, '_')
    //send mail.
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        requestBody: {
            raw: encodedMail,
            message_id: message.id,
        },
    });
}