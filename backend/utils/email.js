import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //  DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: "Nestworth Support <support@nestworth.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //  Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
