"use strict";

// @ts-ignore
const stripe = require("stripe")(process.env.SRIPE_KEY);

/**
 * order controller
 */

const {createCoreController} = require("@strapi/strapi").factories;
const endpointSecret = "whsec_6058e57d0903711810ebd5c5984349858770c676bcaa23063949b5eedb658153";

module.exports = createCoreController("api::order.order", ({strapi}) => {
  return {
    async create(ctx) {
      // @ts-ignore
      const {orders} = ctx.request.body;

      const {email} = ctx.state.user;
      try {
        const productsList = await Promise.all(
          orders.map(async (order) => {
            const product = await strapi.service("api::product.product").findOne(order.productId);

            return {
              price_data: {
                currency: "GBP",
                product_data: {
                  name: product.name,
                },
                unit_amount: Math.round(product.price * 100),
              },
              quantity: order.quantity,
            };
          })
        );
        const customer = await stripe.customers.create();
        const ephemeralKey = await stripe.ephemeralKeys.create({customer: customer.id}, {apiVersion: "2024-04-10"});
        const intent = await stripe.paymentIntents.create({
          amount: 2000,
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
        });

        const theOrders = await strapi
          .service("api::order.order")
          .create({data: {orders, email, stripeCustomerId: customer.id}});
        return {
          paymentIntent: intent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: customer.id,
          order: theOrders,
        };
      } catch (error) {
        console.log(error);
      }
    },

    async webhook(ctx, next) {
      // @ts-ignore
      try {
        const sig = ctx.request.headers["stripe-signature"];

        let event;

        try {
          event = stripe.webhooks.constructEvent(ctx.request.body, sig, endpointSecret);
        } catch (err) {
          ctx.response.status(400).send(`Webhook Error: ${err.message}`);
          return;
        }

        // Handle the event
        switch (event.type) {
          case "payment_intent.succeeded":
            const paymentIntentSucceeded = event.data.object;
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
          // ... handle other event types
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        ctx.send({
          message: "order created",
          success: true,
        });
      } catch (error) {
        console.log(error);
      }
    },
  };
});
