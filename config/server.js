module.exports = ({env}) => ({
  proxy: true,
  host: "0.0.0.0",
  port: process.env.PORT,
  // url: env("MY_HEROKU_URL"),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
});
