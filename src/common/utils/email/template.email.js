
export const emailTemplate = ({
    code,
    username = "User",
    appName = "Saraha",
    title = "Verify Your Email"
} = {}) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>

<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color: #f4f7fb; padding: 40px 15px;">

        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td align="center"
                            style="background-color: #4f46e5; padding: 35px 20px;">

                            <h1 style="margin: 0; color: #ffffff; font-size: 30px;">
                                ${appName}
                            </h1>

                            <p style="margin: 12px 0 0; color: #e0e7ff; font-size: 14px;">
                                Secure • Simple • Reliable
                            </p>

                        </td>
                    </tr>

                    <!-- Email Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #374151;">

                            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
                                Verify Your Email Address
                            </h2>

                            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 15px;">
                                Hello ${username},
                            </p>

                            <p style="font-size: 15px; line-height: 1.8; color: #6b7280;">
                                Thank you for joining ${appName}! Please use the verification code below to confirm your email address.
                            </p>

                            <!-- OTP Code -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="margin: 30px 0;">

                                <tr>
                                    <td align="center"
                                        style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 25px 15px;">

                                        <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px;">
                                            YOUR 6-DIGIT VERIFICATION CODE
                                        </p>

                                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4f46e5; padding-left: 10px;">
                                            ${code}
                                        </div>

                                    </td>
                                </tr>

                            </table>

                            <p style="font-size: 14px; line-height: 1.8; color: #6b7280; text-align: center;">
                                This code will expire in <strong style="color: #111827;">2 minutes</strong>.
                            </p>

                            <p style="font-size: 14px; line-height: 1.8; color: #6b7280;">
                                For your security, never share this code with anyone. Our team will never ask you for your verification code.
                            </p>

                            <p style="font-size: 13px; line-height: 1.8; color: #9ca3af; margin-top: 25px;">
                                If you did not create an account with ${appName}, you can safely ignore this email.
                            </p>

                            <p style="font-size: 15px; line-height: 1.8; color: #374151; margin-top: 30px;">
                                Best regards,<br>
                                <strong>${appName} Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center"
                            style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">

                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
                            </p>

                            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                                This is an automated email. Please do not reply.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>`;
};
