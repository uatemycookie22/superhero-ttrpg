import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "us-east-1" });

export async function sendMagicLinkEmail(email: string, url: string) {
  // In development, just log the magic link
  if (process.env.NODE_ENV === "development") {
    console.log("\n========== MAGIC LINK ==========");
    console.log(`To: ${email}`);
    console.log(`URL: ${url}`);
    console.log("================================\n");
    return;
  }

  await ses.send(new SendEmailCommand({
    Source: "noreply@callingallheroes.net",
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Sign in to Calling All Heroes" },
      Body: {
        Html: {
          Data: `
            <h1>Sign in to Calling All Heroes</h1>
            <p>Click the link below to sign in:</p>
            <a href="${url}">Sign in</a>
            <p>This link expires in 5 minutes.</p>
          `,
        },
      },
    },
  }));
}
