"use strict";

const emailTemplate = (orders, status, total) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;1,400;1,500;1,600&display=swap"
      rel="stylesheet"
    />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet" />
    <script src="https://kit.fontawesome.com/8070d3b382.js" crossorigin="anonymous"></script>
    <title>Document</title>
  </head>
  <body style="font-family: Arial, sans-serif, sans-serif; max-width: 560px; margin: 0 auto; color: #090909">
    <section style="padding: 30px 30px; background-color: white; width: 100%; text-align: center">
      <p style="color: black; font-size: 17px; font-weight: 500; text-align: center">
        Your Orders Has Been Sent Suucessfully, You will Get An Update when The Status of the Product Changes
      </p>

      <div style="display: flex; justify-content: center">
        <div style="padding: 1px 30px; border: 2px solid rgb(13, 95, 201); border-radius: 12px">
          <p style="color: white; font-size: 17px; font-weight: 500; text-align: center">${status ?? ""}</p>
        </div>
      </div>
      ${orders.map(
        (item) =>
          `
        <div style="display: flex; align-items: center">
        <div style="margin-right: 40px">
          <p style="text-align: left; margin-bottom: 13px; margin-top: 20px; text-align: center">Product Name</p>
          <p
            style="
              text-align: left;
              font-size: 18px;
              line-height: 1.7;
              font-weight: 600;
              margin-bottom: 13px;
              margin-top: 20px;
            "
          >
            ${item?.productName}
          </p>
        </div>
        <div style="margin-right: 20px">
          <p style="text-align: left; margin-bottom: 13px; margin-top: 20px; text-align: center">Quantity</p>

          <p
            style="
              text-align: left;
              font-size: 18px;
              line-height: 1.7;
              font-weight: 600;
              margin-bottom: 13px;
              margin-top: 20px;
            "
          >
            ${item?.quantity}
          </p>
        </div>

        <div style="margin-left: 10px">
          <p style="text-align: left; margin-bottom: 13px; margin-top: 20px; text-align: center">Price</p>

          <p
            style="
              text-align: left;
              font-size: 18px;
              line-height: 1.7;
              font-weight: 600;
              margin-bottom: 13px;
              margin-top: 20px;
            "
          >
            $${item?.price}
          </p>
        </div>
      </div>
        `
      )}
      <div style="display: flex; margin-top: 20px">
        <p
          style="
            font-size: 18px;

            font-weight: 400;
            margin-bottom: 13px;

            text-align: center;
            margin-right: 20px;
          "
        >
          Total
        </p>
        <p
          style="
            font-size: 18px;

            font-weight: 600;
            margin-bottom: 13px;

            text-align: center;
            margin-right: 20px;
          "
        >
          $${total ?? ""}
        </p>
      </div>
    </section>
  </body>
</html>



`;

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
        // console.log(email, "---the orders--", loggedInEmail, "====", orders);

        const theOrders = await strapi.service("api::order.order").create({
          data: {
            products: orders.map((d) => d.productId),
            orderList: orders.map((d) => ({productName: d.productName, quantity: d.quantity, price: d?.price})),
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
          await strapi.db.query("api::cart.cart").deleteMany({
            where: {userEmail: email},
          });

          await strapi.plugins["email"].service("email").send({
            to: email,
            from: `${process.env.SMTP_USER}`,
            subject: "Tk Enterprise Orders",
            text: "Order Successfully Placed",
            html: emailTemplate(
              orders.map((d) => ({productName: d.productName, quantity: d.quantity, price: d.price})),
              theOrders?.status,
              amount
            ),
          });

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
