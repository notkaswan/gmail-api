const {google} = require('googleapis');

const LABEL_NAME = 'AUTO-REPLIED'

// function to create new label.
module.exports = async function createNewLabel(auth) {
    const gmail = google.gmail({version: 'v1', auth})
    try{
        const res = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: LABEL_NAME,
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show',
            },
        })
        return res.data.id
    } catch(err) {
        if(err.code === 409) { // check if label is already created.
            const res = await gmail.users.labels.list({
                userId: 'me',
            })
            const label = res.data.labels.find((label) => label.name === LABEL_NAME)
            return label.id
        } else   {
            throw err
        }
    }
}