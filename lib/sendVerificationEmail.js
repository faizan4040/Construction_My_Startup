import { sendMail } from "./sendMail.js"
import { emailVerificationLink, getEmailIconAttachments } from "./emailVerificationLink.js"

export const sendVerificationEmail = async (user, verifyLink) => {
    const attachments = await getEmailIconAttachments()

    return sendMail(
        "Verify your email - QuickMason",
        user.email,
        emailVerificationLink(verifyLink, user.name),
        attachments
    )
}