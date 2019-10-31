const nodemailer = require("nodemailer");

let emailingReport = (email_recipients, email_body, data) => {
  const transporter = nodemailer.createTransport({
    host: "version01.com",
    port: "465",
    auth: {
      user: "notifications@version01.com",
      pass: "YnZvD41ERVx_"
    }
  });

  let mail_options = {
    from: '"Bullseye Notifications" <notifications@version01.com>',
    to: email_recipients,
    subject: "Bullseye Production report",
    html: email_body,
    attachments: [
      {   
        filename: 'tabla.csv',
        content: Buffer.from(data,'utf-8')
      }
    ]
  };

  transporter.sendMail(mail_options, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent" + info.response);
    }
  });
};

module.exports = emailingReport;
