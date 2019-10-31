"use strict";
const nodemailer = require("nodemailer");

let emailingReport = (email_recipients, email_body, data, attachment_extension) => {
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "version01.com",
      port: 465,
      secure: true,
      auth: {
        user: "notifications@version01.com",
        pass: "YnZvD41ERVx_"
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Bullseye Notifications" <notifications@version01.com>',
      to: email_recipients,
      subject: "Bullseye Production report",
      html: email_body,
      attachments: [
        {
          filename: "report." + attachment_extension,
          content: Buffer.from(data, "utf-8")
        }
      ]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...    
  }
  main().catch(console.error);
};

module.exports = emailingReport;
