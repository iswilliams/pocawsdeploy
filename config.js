module.exports = config = {
    aws_sdk : {
        ip: process.env.HOST_AWS || '192.168.0.145',
        port : process.env.PORT_AWS || '4566',
        region: process.env.REGION_AWS || 'REGION',
        account: process.env.ACCOUNT_ID || '000000000000',
        accessKeyId: process.env.ACCESS_KEY_ID || 'na',
        secretAccessKey: process.env.ACCESS_KEY_SECRET || 'na'
    },
    database : {
        host: process.env.HOST_DB || '192.168.0.145',
        user: process.env.USER_DB || 'root',
        password: process.env.PASSWORD_DB || 'password',
        database: process.env.NAME_DB || 'db'
    }
}