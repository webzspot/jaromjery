const { PrismaClient } = require("@prisma/client");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// POST route to save email
app.post("/save-email", async (req, res) => {
    try {
        const data = req.body;
        const addingEmail = await prisma.emailAutomationData.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
            },
        });
        res.json({
            message: "Your details have been securely stored for Email Automation.",
            data: addingEmail,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to save email." });
    }
});

// GET route to fetch all stored emails
app.get("/save-email", async (req, res) => {
    try {
        const storedData = await prisma.emailAutomationData.findMany();
        res.json({
            message: "Here is your data stored for Email Automation.",
            data: storedData,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stored emails." });
    }
});

// DELETE route to delete a specific email entry
app.delete("/save-email/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedData = await prisma.emailAutomationData.delete({
            where: {
                id: id,
            },
        });
        res.json({
            message: "Your email automation data has been successfully deleted.",
            data: deletedData,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete email." });
    }
});

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // Update as needed for other providers
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS, // Use environment variables
    },
});

// Function to send emails to all saved recipients
const sendEmail = async () => {
    try {
      const recipients = await prisma.emailAutomationData.findMany();
      for (const recipient of recipients) {
        const currentYear = new Date().getFullYear();
        const info = await transporter.sendMail({
          from: `"Webzspot Technologies" <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject: "Grow Your Business with Webzspot Technologies",
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #fffff; padding: 5px;">
                <div style="max-width: 800px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #4CAF50;">Hello ${recipient.name},</h2>
                  <p style="color: #333; font-size: 16px;">We hope you are doing well!</p>
                  <p style="color: #333; font-size: 16px;">At <strong>Webzspot Technologies</strong>, we specialize in helping businesses grow and thrive in the digital world. Here’s what we offer:</p>
                  
                  <ul style="list-style-type: none; padding: 0;">
                    <li style="font-size: 16px; color: #333; margin-bottom: 10px;">💻 <strong>Website Development</strong> - We build beautiful and responsive websites for your business.</li>
                    <li style="font-size: 16px; color: #333; margin-bottom: 10px;">📈 <strong>Digital Marketing</strong> - Increase your online presence and grow your audience.</li>
                    <li style="font-size: 16px; color: #333; margin-bottom: 10px;">📊 <strong>CRM Solutions</strong> - Manage and enhance your customer relationships.</li>
                    <li style="font-size: 16px; color: #333; margin-bottom: 10px;">🛒 <strong>E-commerce Solutions</strong> - Set up your online store and start selling worldwide.</li>
                    <li style="font-size: 16px; color: #333; margin-bottom: 10px;">🔧 <strong>Custom Web Applications</strong> - Custom web applications designed to fit your unique requirements.</li>
                    <li style="font-size: 16px; color: #333; margin-bottom: 10px;">⚙️ <strong>Automation Tools</strong> - Automate tasks and save time with our solutions.</li>
                  </ul>
  
                  <p style="color: #333; font-size: 16px;">If you are interested in learning more about how we can help you, feel free to reach out to us. We’re here to help your business grow!</p>
  
                  <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                  
                  <p style="color: #333; font-size: 14px;">For more information,</p>
                  <p style="color: #333; font-size: 14px;">Contact Us:</p>
                  <ul style="list-style-type: none; padding: 0;">
                    <li style="font-size: 14px; color: #333;">📧 <strong>Email:</strong> <a href="mailto:info@webzspot.com" style="color: #4CAF50;">info@webzspot.com</a></li>
                    <li style="font-size: 14px; color: #333;">📱 <strong>Phone:</strong> 9150182615</li>
                    <li style="font-size: 14px; color: #333;">🌐 <strong>Website:</strong> <a href="https://www.webzspot.com" target="_blank" style="color: #4CAF50;">www.webzspot.com</a></li>
                  </ul>
                  <p style="color: #999; font-size: 12px; text-align: center;">© ${currentYear} Webzspot Technologies. All rights reserved.</p>
                </div>
              </body>
            </html>
          `,
        });
        // Uncomment the next line for debugging purposes
        // console.log(`Email sent to ${recipient.email}: ${info.messageId}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  
const sendNotification = async (time) => {
    try {
        //   console.log(`Sending notification to jaromjery112@gmail.com for the ${time} job...`);
        const info = await transporter.sendMail({
            from: `"Jarom Notification" <${process.env.EMAIL_USER}>`,
            to: "jaromjery112@gmail.com",
            subject: `${time} Job Completed`,
            text: `The ${time} email automation job has successfully run.`,
        });
        //   console.log(`Notification sent to jaromjery112@gmail.com: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending notification email:", error);
    }
};

cron.schedule("0 10 * * *", async () => {
    // console.log("Sending emails at 10 AM IST...");
    await sendEmail();
    await sendNotification("10 AM");
}, {
    scheduled: true,
    timezone: "Asia/Kolkata", // Set timezone to IST
});

// Schedule email for 5 PM IST
cron.schedule("0 17 * * *", async () => {
    // console.log("Sending emails at 5 PM IST...");
    await sendEmail();
    await sendNotification("5 PM");
}, {
    scheduled: true,
    timezone: "Asia/Kolkata", // Set timezone to IST
});





//  sendEmail();
// sendNotification("5 PM");
// const indiantime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
// const americaTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
// console.log("Current time in America/New_York:", americaTime);
// console.log("Current time in indian:", indiantime);
// cron.schedule("* * * * *", async () => {
//     console.log("Cron job is running every minute!");
// });
// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
