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

      const dbody = ctx.request.body;
      const files = ctx.request.files;

      const parsedData = JSON.parse(dbody.data.trim());
      const {orders, amount, currency, email, phone} = parsedData;
      const {email: loggedInEmail} = ctx.state.user ? ctx.state.user : {email: null};

      try {
        // const customer = await stripe.customers.create({
        //   email: email,
        // });
        // const ephemeralKey = await stripe.ephemeralKeys.create({customer: customer.id}, {apiVersion: "2024-04-10"});
        // const intent = await stripe.paymentIntents.create({
        //   amount: parseFloat(amount) * 100,
        //   currency: currency ? currency.toLowerCase() : "usd",
        //   customer: customer.id,
        //   automatic_payment_methods: {
        //     enabled: true,
        //   },
        //   metadata: {orders: JSON.stringify(orders), email: email},
        // });
        console.log(email, "---the orders--", loggedInEmail, "====", orders);

        const theOrders = await strapi.service("api::order.order").create({
          data: {
            products: orders.map((d) => d.productId),
            orderList: orders.map((d) => ({productName: d.productName, quantity: d.quantity})),
            email: email,
            status: "Pending",
            phone,
          },
          files: {
            proofOfPayment: files["files.media"],
          },
        });
        // console.log(theOrders, "--theorders--");
        if (theOrders) {
          if (loggedInEmail) {
            const df = await strapi.db.query("api::cart.cart").deleteMany({
              where: {userEmail: email},
            });

            // console.log(df, "deletcart");
          }

          return {success: true, data: theOrders};
        }
      } catch (error) {
        console.log(error, "--from create---");
      }
    },

    async find(ctx) {
      const {email} = ctx.state.user;
      const {type} = ctx.params;

      try {
        if (type === "All") {
          const data = await strapi.db.query("api::order.order").findMany({
            where: {email: email},
            populate: ["products"],
          });
          return {data};
        } else {
          const data = await strapi.db.query("api::order.order").findMany({
            where: {$and: [{email: email}, {status: type}]},
            populate: ["products"],
          });

          // console.log(data, type);
          return {data};
        }
      } catch (error) {
        console.log(error, "---error----");
        ctx.response.status = 500;
        return error;
      }
    },

    async webhook(ctx, next) {
      // @ts-ignore
      try {
        const unparsed = ctx.request.body?.[Symbol.for("unparsedBody")];
        const sig = ctx.request.headers["stripe-signature"];

        let event;
        try {
          event = stripe.webhooks.constructEvent(unparsed, sig, endpointSecret);
        } catch (err) {
          console.log(err, "--inner webhook error---");
          return err;
        }

        // Handle the event
        switch (event.type) {
          case "payment_intent.succeeded":
            const paymentIntentSucceeded = event.data.object;
            const orderList = await Promise.all(
              JSON.parse(paymentIntentSucceeded.metadata.orders).map(async (order) => {
                const cart = await strapi.service("api::cart.cart").findOne(order.cartId);

                return {
                  productId: cart.productId,
                  quantity: cart.quantity,
                };
              })
            );
            const res = await strapi.service("api::order.order").create({
              data: {
                orders: orderList,
                email: paymentIntentSucceeded.metadata.email,
                stripeCustomerId: paymentIntentSucceeded?.customer,
                isPaid: true,
              },
            });

            if (res) {
              const deleteCart = await strapi.db.query("api::cart.cart").deleteMany({
                where: {userEmail: paymentIntentSucceeded.metadata.email},
              });
              console.log(res, "The Orders Has Been Created");
              return deleteCart;
            }

            // Then define and call a function to handle the event payment_intent.succeeded
            break;
          // ... handle other event types
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        console.log("Order Created");
        ctx.send({
          message: "order created",
          success: true,
        });
      } catch (error) {
        console.log(error, "---from webhook----");
      }
    },
  };
});
