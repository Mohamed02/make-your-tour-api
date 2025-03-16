import nodemailer from 'nodemailer';

export const sendEmail = async (options) =>{
    // 1 . Create a transporter

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            service:'Gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                password: process.env.EMAIL_PASSWORD
            }
        })
    // 2.  Define Email Service
    const mailOptions = {
        from: '<email id>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    // 3. Send the Email

    console.log('before  sending amil');
    await transporter.sendMail(mailOptions);
    console.log('mail sent successfully');
}