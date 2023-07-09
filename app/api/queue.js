import { config } from "dotenv";
config();
import Queue from "bee-queue";
import logger from "../utils/logger.js";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import cron from "node-cron";

const OAuth2Client = google.auth.OAuth2;

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/auth/google/secrets"
);

let Jobs = [];

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const emailQueue = new Queue("emailQueue");

emailQueue.process(async (job) => {
  const { refreshToken, email } = job.data;

  Jobs.push({ refreshToken, email });

});

emailQueue.on("failed", (job, err) => {
  console.error("Email sending failed:");
  console.error(err);
});


function getRandomInterval() {
  return Math.floor(Math.random() * 76) + 45;
}

const startCornJob = () => {
  cron.schedule(`*/${getRandomInterval()} * * * * *`, async () => {
    console.log("Cron job running...");


    for (const job of Jobs) {
      const { refreshToken, email } = job;
      const REFRESH_TOKEN = refreshToken;


      try {
        console.log("started......");
        logger.info("started ........................");
        const START_DATE = "2023/07/07";

        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
        const { token } = await oAuth2Client.getAccessToken();
        oAuth2Client.setCredentials({ access_token: token });

        const emails = await getUnreadEmails(START_DATE);

        if (emails != null && emails.length > 0) {
          console.log(emails);
          logger.info(emails);

          await sendEmailArray(emails, REFRESH_TOKEN, email);
        } else {
          return;
        }
      } catch (error) {
        console.error("Error:", error);
        logger.info("error");
      }
    }
  });

  const sendEmailArray = async (mailList, REFRESH_TOKEN, email) => {
    try {
      const { token } = await oAuth2Client.getAccessToken();
      const accessToken = token;
  
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: email,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
  
      mailList.forEach(async (email) => {
        const mailOptions = {
          from: "Ashis Kumar Maity <maity.ashis651@gmail.com>",
          to: email.senderAddress,
          subject: "Hello This is Ashis",
          text: "Hello! Greeting from Ashis Kumar Maity",
          html: "<h1>Hello! Greeting from Ashis Kumar Maity</h1>",
        };
  
        const result = await transport.sendMail(mailOptions);
        console.log("Email sent:", result.messageId);
        logger.info(`Email sent ${result.messageId}`);
        removeLabelFromThread(email.threadId);
      });
    } catch (error) {
      console.error("Error sending emails:", error);
      throw error;
    }
  };
  
  const removeLabelFromThread = async (threadId) => {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  
    await gmail.users.threads.modify({
      userId: "me",
      id: threadId,
      requestBody: {
        removeLabelIds: ["UNREAD"]
      },
    });
  
    console.log("Label removed from thread:", threadId);
  };
  
  const getTheMail = async (senderAddress, receiverAddresss) => {
    const regex = /<([^>]+)>/;
    if (senderAddress.includes(process.env.USER_MAIL)) {
      if (receiverAddresss.includes("<")) {
        let match = receiverAddresss.match(regex);
        const mail = match ? match[1] : "";
        return mail;
      } else {
        return receiverAddresss;
      }
    } else {
      if (senderAddress.includes("<")) {
        let match = senderAddress.match(regex);
        const mail = match ? match[1] : "";
        return mail;
      } else {
        return senderAddress;
      }
    }
  };
  
  const getSenderMailFromThreadId = async (threadIds) => {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  
    const emails = await Promise.all(
      threadIds.map(async (threadId) => {
        const response = await gmail.users.threads.get({
          userId: "me",
          id: threadId,
        });
  
        const thread = response.data;
        const message = thread.messages[0];
        const headers = message.payload.headers;
        const senderHeader = headers.find((header) => header.name === "From");
        const senderAddress = senderHeader ? senderHeader.value : "";
        const receiverHeader = headers.find((header) => header.name === "To");
        const receiverAddresss = receiverHeader ? receiverHeader.value : "";
  
        const mail = await getTheMail(senderAddress, receiverAddresss);
  
        return {
          threadId,
          senderAddress: mail,
        };
      })
    );
  
    return emails;
  };
  
  const getUnreadEmails = async (startDate) => {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const response = await gmail.users.threads.list({
      userId: "me",
      labelIds: "UNREAD",
      q: `after:${startDate}`, // Exclude emails with the label "BOT"
      format: "full",
    });
  
    const messages = response.data.threads;
  
    let threadsIds = [];
    if (messages != null && messages.length > 0) {
      messages.forEach((thread) => {
        threadsIds.push(thread.id);
      });
  
      let result = await getSenderMailFromThreadId(threadsIds);
      console.log(result);
      logger.info(result);
  
      return result;
    }
  
    return null;
  };
  



};

export { emailQueue, startCornJob };
