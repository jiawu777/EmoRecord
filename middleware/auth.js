const crypto = require('crypto')
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
    channelId: process.env.CHANNEL_ID
}

module.exports = {
    authenticator: (req, res, next) => {
        let signInKey = '';
        try {
            // produce reference header
            signInKey = crypto.createHmac('sha256', config.channelSecret).
                update(Buffer.from(JSON.stringify(req.body)), 'utf8').digest('base64');
        } catch (error) {
            // error handle
            console.log(error)
        }

        // compare if reference header is the same as line official header, if not, return error
        if (signInKey !== req.header('x-Line-Signature')) {
            return res.send(error);
        } else {
            return next()
        }
    },

}