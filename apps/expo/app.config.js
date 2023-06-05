import 'dotenv/config'
export default {
    expo: {
        extra: {
            magicKey: process.env.MAGIC_KEY,
            polybaseDb: process.env.POLYBASE_DEFAULT_NAMESPACE,
        }
    }
}