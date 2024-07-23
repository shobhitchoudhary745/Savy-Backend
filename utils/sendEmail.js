const dotenv = require("dotenv");
dotenv.config({ path: "../config/config.env" });
const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
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
      from: "Sayv <shobhitchoudhary745@gmail.com>",
      to: options.email,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
