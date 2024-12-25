import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "2024-xmas-mystery";
const FILE_KEY = "leaderboard.json";

export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event));

        const requestBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { name, passcode, timestamp } = requestBody;

        // Validate input
        if (!name || !passcode || !timestamp) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Missing required fields." }),
            };
        }

        // Server-side passcode validation
        const VALID_PASSCODE = "3724";
        if (passcode !== VALID_PASSCODE) {
            return {
                statusCode: 403,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Invalid passcode.", valid: false }),
            };
        }

        // Fetch the existing leaderboard from S3
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILE_KEY,
        });
        const data = await s3.send(command);

        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
                stream.on("error", reject);
            });

        const leaderboardBody = await streamToString(data.Body);
        const leaderboard = JSON.parse(leaderboardBody);

        // Add the new entry
        leaderboard.push({ name, timestamp });
        leaderboard.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const updatedLeaderboard = leaderboard.slice(0, 5);

        // Save the updated leaderboard back to S3
        const putCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILE_KEY,
            Body: JSON.stringify(updatedLeaderboard),
            ContentType: "application/json",
        });
        await s3.send(putCommand);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Leaderboard updated successfully", valid: true }),
        };
    } catch (error) {
        console.error("Error updating leaderboard:", error.message);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};