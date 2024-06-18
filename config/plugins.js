module.exports = ({env}) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        // key: env("MAILGUN_API_KEY", "68c2b42263f25ba9bd98be6d30419829-6fafb9bf-1bd267d0"), // Required
        // domain: env("MAILGUN_DOMAIN", "sandboxc76ce4ae19d74343b7e40fa9d03dd592.mailgun.org"), // Required
        // url: env('MAILGUN_URL', 'https://api.mailgun.net'), //

        // host: "smtp-relay.brevo.com",
        // port: 587,
        // secure: false,

        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: env("SMTP_EMAIL", "ikeshhh@gmail.com"),
          pass: env("SMTP_PASSWORD", "ltvjxyzzyzfnwnrb"),
          // pass: "96mrKvxncDYsaQI0",
        },
      },
      settings: {
        defaultFrom: "ikeshhh@gmail.com",
        defaultReplyTo: "ikeshhh@gmail.com",
      },
    },

    // config: {
    //   provider: "nodemailer",
    //   providerOptions: {
    //     host: "localhost",
    //     port: 1025,
    //     ignoreTLS: true,
    //   },
    //   settings: {
    //     defaultFrom: "ikeshhh@gmail.com",
    //     defaultReplyTo: "ikeshhh@gmail.com",
    //   },
    // },
  },
});
