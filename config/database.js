const path = require("path");
const parse = require("pg-connection-string").parse;

module.exports = ({env}) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  // const connections = {
  //   // mysql: {
  //   //   connection: {
  //   //     connectionString: env("DATABASE_URL"),
  //   //     host: env("DATABASE_HOST", "localhost"),
  //   //     port: env.int("DATABASE_PORT", 3306),
  //   //     database: env("DATABASE_NAME", "strapi"),
  //   //     user: env("DATABASE_USERNAME", "strapi"),
  //   //     password: env("DATABASE_PASSWORD", "strapi"),

  //   //     ssl: {
  //   //       // key: env('DATABASE_SSL_KEY', undefined),
  //   //       // capath: env('DATABASE_SSL_CAPATH', undefined),
  //   //       // cipher: env('DATABASE_SSL_CIPHER', undefined),
  //   //       rejectUnauthorized: false,
  //   //     },
  //   //   },
  //   //   pool: {min: env.int("DATABASE_POOL_MIN", 2), max: env.int("DATABASE_POOL_MAX", 10)},
  //   // },
  //   postgres: {
  //     connection: {
  //       client: "postgres",
  //       connection: {
  //         host: config.host,
  //         port: config.port,
  //         database: config.database,
  //         user: config.user,
  //         password: config.password,
  //         ssl: {
  //           rejectUnauthorized: false,
  //         },
  //       },
  //       debug: false,
  //       pool: {min: env.int("DATABASE_POOL_MIN", 2), max: env.int("DATABASE_POOL_MAX", 10)},
  //     },
  //   },
  //   // sqlite: {
  //   //   connection: {
  //   //     filename: path.join(__dirname, "..", env("DATABASE_FILENAME", ".tmp/data.db")),
  //   //   },
  //   //   useNullAsDefault: true,
  //   // },
  // };

  const {host, port, database, user, password} = parse(env("DATABASE_URL"));
  return {
    connection: {
      client: "postgres",
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: {rejectUnauthorized: false},
      },
      debug: false,
    },
  };
  // return {
  //   connection: {
  //     client,
  //     ...connections[client],
  //     acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
  //   },
  // };
};
