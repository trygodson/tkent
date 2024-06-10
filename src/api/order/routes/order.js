"use strict";
const express = require("express");
/**
 * order router
 */

const {createCoreRouter} = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::order.order");
module.exports = {
  routes: [
    {
      method: "POST",
      path: "/order/webhook",
      handler: "order.webhook",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/order/create",
      handler: "order.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/order/find/:type",
      handler: "order.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/order/findOne",
      handler: "order.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/order/delete",
      handler: "order.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
