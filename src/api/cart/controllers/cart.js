"use strict";

/**
 * cart controller
 */

const {createCoreController} = require("@strapi/strapi").factories;

module.exports = createCoreController("api::cart.cart", ({strapi}) => {
  return {
    async find(ctx) {
      const {email} = ctx.state.user;
      try {
        const data = await strapi.db.query("api::cart.cart").findMany({
          where: {userEmail: email},
        });
        return {data};
      } catch (error) {
        ctx.response.status = 500;
        return error;
      }
    },
    async create(ctx) {
      const {email} = ctx.state.user;
      const {productId, quantity} = ctx.request.body.data;
      try {
        const data = await strapi.db.query("api::cart.cart").findOne({
          where: {$and: [{userEmail: email}, {productId: productId}]},
        });

        if (data) {
          const er = await strapi.plugins["email"].service("email").send({
            to: "gnqnpn@gmail.com",
            from: "76e1f7001@smtp-brevo.com",
            subject: "Hello world",
            text: "Hello world",
            html: `<h4>Hello world</h4>`,
          });
          console.log(er);
          const dd = await strapi.db.query("api::cart.cart").update({
            where: {id: data.id},
            data: {
              ...ctx.request.body.data,
              quantity: Number(quantity) + Number(data?.quantity),
            },
          });
          return dd;
        } else {
          const er = await strapi.plugins["email"].service("email").send({
            to: "gnqnpn@gmail.com",
            from: "76e1f7001@smtp-brevo.com",
            subject: "Hello world",
            text: "Hello world",
            html: `<h4>Hello world</h4>`,
          });
          // strapi.plugins['email'].services.email.send({
          //   to: 'paulbocuse@strapi.io',
          //   from: 'joelrobuchon@strapi.io',
          //   cc: 'helenedarroze@strapi.io',
          //   bcc: 'ghislainearabian@strapi.io',
          //   replyTo: 'annesophiepic@strapi.io',
          //   subject: 'Use strapi email provider successfully',
          //   text: 'Hello world!',
          //   html: 'Hello world!',
          // });

          console.log(er);
          const res = await strapi.service("api::cart.cart").create({
            data: {
              ...ctx.request.body.data,
              userEmail: email,
            },
          });

          return res;
        }
      } catch (error) {
        ctx.response.status = 500;
        console.log(error, "create cart error");
        return error;
      }
    },
    async delete(ctx) {
      const {email} = ctx.state.user;
      const {id} = ctx.params;
      try {
        if (id === "fakeId") {
          const res = await strapi.db.query("api::cart.cart").deleteMany({
            where: {userEmail: email},
          });
          return res;
        }
        const res = await strapi.db.query("api::cart.cart").delete({
          where: {id},
        });
        return res;
      } catch (error) {
        ctx.response.status = 500;
        console.log({error});
        return error;
      }
    },
  };
});
