import logo from "./extentions/icon.png";

const config = {
  // auth: {
  //   logo,
  // },
  // head: {
  //   favicon: logo,
  // },
  // menu: {
  //   logo,
  // },
  translations: {
    en: {
      "app.components.LeftMenu.navbrand.title": "Tk Enterprise",
      "Auth.form.welcome.title": "Welcome to Tk Enterprise",
      "Auth.form.welcome.subtitle": "Login To Yur Account",
    },
  },
  tutorials: false,
  notifications: {
    release: false,
  },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
