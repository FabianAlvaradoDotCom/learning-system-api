const { parseAsync } = require("json2csv");
const nodemailer = require("nodemailer");

const convertToCSVandEmail = async (email_recipients, email_body, passed_data, attachment_extension) => {

  const data = [...passed_data];
  const fields = ["sensor_name", "output_data", "reading_date"];
  const opts = { fields };

  parseAsync(data, opts)
    .then(csv => {

      async function main() {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "version01.com",
          port: 465,
          secure: true,
          auth: {
            user: "report_delivery@version01.com",
            pass: "YnZvD41ERVx_"
          }
        });
    
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Bullseye Report Delivery" <report_delivery@version01.com>',
          to: email_recipients,
          subject: "Bullseye Production report",
          html: email_body,
          attachments: [
            {
              filename: "report." + attachment_extension,
              content: Buffer.from(csv, "utf-8")
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

    })
    .catch(err => console.error(err));
};

module.exports = convertToCSVandEmail;






