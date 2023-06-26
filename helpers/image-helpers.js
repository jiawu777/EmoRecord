const axios = require('axios')
const { ImgurClient } = require('imgur')

// line client 設定
const lineConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
    channelId: process.env.CHANNEL_ID
}

// imgur client 設定
const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

module.exports = {
    // download image from line
    downloadImage: async function (url) {
        return axios.get(url, {
            headers: {
                'Authorization': `Bearer ${lineConfig.channelAccessToken}`
            },
            // 記憶體只可讀取不可寫入
            responseType: 'arraybuffer'
        }).then((response) => response.data)
    },

    // upload base64Data imgur
    uploadImgur: async function (imgbase64) {

        const response = await client.upload({
            image: imgbase64,
            type: 'base64',
            album: process.env.IMGUR_ALBUM_ID
        });
        return response.data.link;
    }

}




