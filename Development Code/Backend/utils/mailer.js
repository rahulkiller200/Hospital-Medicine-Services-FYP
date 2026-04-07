const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Change to your SMTP provider if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOrderStatusEmail = async (email, patientName, medicineName, status) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Medical Order Update: ${status}`,
    html: `
      <h2>Hello ${patientName},</h2>
      <p>We are writing to inform you that your request for <strong>${medicineName}</strong> has been <strong>${status}</strong> by the pharmacy.</p>
      <p>${status === 'Approved' ? 'You can now proceed to the pharmacy to pick up your medicine.' : 'Please contact the pharmacy for more details regarding the rejection.'}</p>
      <br/>
      <p>Thank you for using Hospital & Medicine Services Kathmandu.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order status email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.sendOrderPlacedEmail = async (email, username, medicineName, quantity) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Placed Successfully',
    html: `<h2>Hello ${username},</h2><p>Your order for <strong>${quantity}x ${medicineName}</strong> has been successfully placed.</p><p>We will notify you once the pharmacy approves it!</p><br/><p>Thank you for using Hospital & Medicine Services Kathmandu.</p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order placement email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email. (Check .env credentials):", error.message);
  }
};
