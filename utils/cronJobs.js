const cron = require("node-cron");
const nodeMailer = require("nodemailer");

cron.schedule("*/30 * * * *", async () => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "Keep It Going <keepitgoingstory@gmail.com>",
      to: "shobhitchoudhary745@gmail.com",
      subject: "optionssubject",
      text: "Webhook is working",
    });
  } catch (error) {}
});
