class Config {
    constructor() {
        this.config = {
            logger: {},
            email: {},
        };
    }

    set(config) {
        this.config = {
            NODE_ENV: config.NODE_ENV,

            logger: {
                APP_NAME: config.APP_NAME,
                DISABLE_CONSOLE_LOG: config.DISABLE_CONSOLE_LOG,
                SHOW_COMPLETE_ERROR_IN_CONSOLE: config.SHOW_COMPLETE_ERROR_IN_CONSOLE,
            },

            database: {
                MONGODB_URL: config.MONGODB_URL,
            },

            email: {
                SENDGRID_API_KEY: config.SENDGRID_API_KEY,
                DEFAULT_SENDER: config.DEFAULT_SENDER,
            },
        };
    }

    get() {
        return this.config;
    }
}

const configInstance = new Config();

module.exports = configInstance;
