import express from "express";
import dotenv from "dotenv";
import sendEmail from "saifstack-email";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running."
    });
});

app.post("/send-email", async (req, res) => {
    const { email, subject, otp } = req.body;

    try {
        await sendEmail({
            api: "ce2f3f8c69f444b5",
            domainName: "CS Root",
            email,
            subject,
            otp
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to send email."
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});