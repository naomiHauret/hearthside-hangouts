import 'dotenv/config'
export default {
    expo: {
        extra: {
            magicKey: process.env.MAGIC_KEY,
            polybaseDb: process.env.POLYBASE_DEFAULT_NAMESPACE,
            web3StorageKey: process.env.WEB3STORAGE_KEY,
            googleBooksKey: process.env.GOOGLEBOOKS_KEY,
            livepeerKey: process.env.LIVEPEER_KEY,
            huddle01Key: process.env.HUDDLE01_APIKEY,
            huddle01ProjectId: process.env.HUDDLE01_PROJECTID
        }
    }
}