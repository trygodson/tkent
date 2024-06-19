"use strict";
module.exports = {
  async afterUpdate(event) {
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
            Your Orders Has Been ${status} Check The App to View Update
          </p>

          <div style="display: flex; justify-content: center">
            <div style="padding: 1px 30px; background-color: ${
              status !== "Approved" ? "rgb(13, 95, 201)" : "008000"
            }; border-radius: 15px">
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
                ${item?.price}
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

    const {result} = event;
    // console.log(result, "from after update lifecycles");
    try {
      await strapi.plugins["email"].service("email").send({
        to: result?.email,
        from: `${process.env.SMTP_USER}`,
        subject: "Tk Enterprise Orders",
        text: "Current Order Update",
        html: emailTemplate(
          result?.orderList.map((d) => ({productName: d.productName, quantity: d.quantity, price: d.price})),
          result?.status,
          result?.orderList.reduce((total, item) => total + Number(item.price) * item?.quantity, 0)
        ),
      });
    } catch (err) {
      console.log(err);
    }
  },
};
