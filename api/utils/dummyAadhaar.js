router.post("/send-otp", async (req, res) => {
  const { aadhaar, email } = req.body;

  // Check Aadhaar + email in DB
  const user = await User.findOne({ aadhaarNumber: aadhaar, email });
  if (!user) {
    return res.status(404).json({ success: false, message: "Aadhaar/email not found" });
  }

  const otp = generateOTP();
  req.session.otp = otp;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "yourgmail@gmail.com", pass: "your-app-password" }
  });

  await transporter.sendMail({
    from: "yourgmail@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`
  });

  console.log(`Dummy OTP for ${email}: ${otp}`);
  res.json({ success: true, message: "OTP sent to registered email" });
});
