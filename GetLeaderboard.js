const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: "us-east-1" }); // Replace with your region
const BUCKET_NAME = "2024-xmas-mystery"; // Your bucket name
const FILE_KEY = "leaderboard.json"; // Your file key

exports.handler = async () => {
    try {
        console.log(`Fetching ${FILE_KEY} from bucket ${BUCKET_NAME}`);

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILE_KEY,
        });
        const data = await s3.send(command);

        // Helper function to convert stream to string
        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
                stream.on("error", reject);
            });

        const body = await streamToString(data.Body);
        const leaderboard = JSON.parse(body);

        console.log("Leaderboard fetched successfully:", leaderboard);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow CORS
                "Content-Type": "application/json",
            },
            body: JSON.stringify(leaderboard),
        };
    } catch (error) {
        console.error("Error retrieving leaderboard:", error.message);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Error retrieving leaderboard", error: error.message }),
        };
    }
};