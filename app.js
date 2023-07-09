const express = require('express')
const app = express();
const PORT = 3000;
const path = require('path')
const fs = require('fs').promises
const {authenticate} = require('@google-cloud/local-auth')
const {google} = require('googleapis');
const sendMail = require('./sendMail');
const createNewLabel = require('./createNewLabel');


const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://mail.google.com/'
]

app.get('/', async (req, res) => {
    const auth = await authenticate({
        keyfilePath: path.join( __dirname, 'credentials.json'),
        scopes: SCOPES,
    })
    console.log("authenticated...");



    async function getMessages(auth) {
        const gmail = google.gmail({version: 'v1', auth})
        const res = await gmail.users.threads.list({
            userId: 'me',
            q: 'newer_than:1h category:primary -in:chats -from:me -has:userlabels ',
        })
        return res.data.threads || []
    }


    
    // addLabel function used to add label to the thread which
    async function addLabel(auth, message, labelId) {
        const gmail = google.gmail({version: 'v1', auth})
        await gmail.users.threads.modify({
            userId: 'me',
            id: message.id,
            requestBody: {
                addLabelIds: [labelId],
                removeLabelIds: ['INBOX'],
            },
        })
    }


    async function main() {
        const labelId = await createNewLabel(auth)
        console.log(`Label created...`)

        setInterval(async () => {
            const messages = await getMessages(auth)
            console.log(`No. of mails ${messages.length}...`)

            for(const message of messages) {
                await sendMail(auth, message)
                console.log(`replied to mail...`)

                await addLabel(auth, message, labelId)
                console.log(`added label to mail...`)
            }
        }, Math.floor(Math.random()*(120-45+1)+45)*100)
    }
    main().catch(console.error)

})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})