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
      try {
        const res = await strapi.service("api::cart.cart").create({
          data: {
            ...ctx.request.body.data,
            userEmail: email,
          },
        });
        return res;
      } catch (error) {
        ctx.response.status = 500;
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
