# 2024-xmas-mystery
2024 XMAS Mystery - Deployment Instructions

This project is an interactive web-based mystery game where users solve clues, input a passcode, and interact with a leaderboard. Successful participants see a congratulatory message, and the leaderboard is updated to reflect their achievement.

**Architecture Overview**

The architecture includes:  
- Frontend: A static website hosted on AWS S3.  
-	Backend: Two AWS Lambda functions handle leaderboard operations (fetching and updating data).  
-	API Gateway: Provides REST endpoints for communication between the frontend and backend.  
-	S3 Bucket: Stores the leaderboard data in a JSON file.  

---

**Deployment Steps**

1. Prerequisites

Ensure you have the following:  
-	AWS CLI installed and configured with your credentials.  
- Node.js installed for packaging Lambda functions.  
- Permissions to create and manage:  
  - S3 Buckets
  - Lambda Functions
  - API Gateway

---

2. S3 Setup

**a. Create an S3 Bucket**  
  1.	Log in to the AWS Management Console.
  2.	Navigate to S3 and create a new bucket:
    	- Name: `2024-xmas-mystery` (or your preferred name) | You will need this bucket name to match in the lambdas code  
    	- Region: Pick a preferred AWS region.  
    	- Enable Static Website Hosting:
      		- Set the index document to index.html.
       	- Ensure public access is enabled for this bucket so it can accessed on public internet  

**b. Upload Frontend Files**  
  1.	Upload the following files:  
    	- congratulations.html
    	- index.html
    	- All associated images (clue1.png, clue2.png, etc.).
    	
  2.	Set the uploaded files to be publicly accessible.
     
**c. Test Static Website**  
  1.	Note the bucket object endpoint for the index.html (e.g., `https://2024-xmas-mystery.s3.us-east-1.amazonaws.com/index.html`). | the first portion will be based on your bucket name you set
  2.	Open the endpoint in a browser to ensure the site loads. 

---
3. Lambda Functions

**a. GetLeaderboard Function**  
  1.	Navigate to AWS Lambda and create a new function:  
    	- 	Name: `GetLeaderboard`
     	- 	Runtime: `Node.js 18.x`
  2.	Paste the code from the GetLeaderboard.js file | don't forget to change the bucket  name in the code  
  3.	Add an environment variable:  
     	- 	BUCKET_NAME: `your-bucket-name`  

**b. UpdateLeaderboard Function**   
  1.	Create another Lambda function:
    	- 	Name: `UpdateLeaderboard`
     	- 	Runtime: `Node.js 18.x`
  2.	Paste the code from UpdateLeaderboard.js file | don't forget to change the bucket  name in the code  
  3.	Add an environment variable:  
     	- 	BUCKET_NAME: `your-bucket-name`| (dont forget to use your bucket name and replace in the arn for the bucket in json below  
  4.	Attach the following IAM policy (json) to allow read & write access to the S3 bucket:  
```javascript
	{
	    "Effect": "Allow",
	    "Action": ["s3:GetObject", "s3:PutObject"],
	    "Resource": "arn:aws:s3:::your-bucket-name/leaderboard.json"
	}
```

---
4. API Gateway


**a. Create API**
  1.	Navigate to API Gateway and create a **REST API**.
  2.	Add two endpoints: 
    	- 	**GET /get-leaderboard**
     		- Integrate this endpoint with the GetLeaderboard Lambda function.  
     	- 	**POST /update-leaderboard**
      		- Integrate this endpoint with the UpdateLeaderboard Lambda function.  

**b. Enable CORS**
  1.	Enable CORS for both endpoints to allow requests from the S3 frontend.

**c. Deploy the API**
  1.	Deploy the API to a new stage (e.g., prod).
  2.	Note the API Base URL (e.g., https://<api-id>.execute-api.us-east-1.amazonaws.com/prod).

**d. Update Frontend API Endpoints**

- 	In index.html, update the API endpoints:

`const GET_API_ENDPOINT = '<API_BASE_URL>/get-leaderboard';`  
`const POST_API_ENDPOINT = '<API_BASE_URL>/update-leaderboard';`

---
5. Testing
	1.	Open the website using the S3 static hosting endpoint.
	2.	Verify the following functionalities:
    	- 	Clue toggling works as expected.
     	- 	Inputting the correct passcode displays the congratulatory message.
     	- 	The leaderboard updates correctly.
 	3.	Submit a correct and incorrect password to check both Lambda functions for successful execution.  


**Credits**
This project was designed and implemented by danmansan.


> WHEN IN DOUBT ASK CHATGPT OR YOUR FAVORITE GEN AI TO HELP GIVE YOU MORE INSTRUCTIONS ON TO FIX ERRORS.  
 MOST OF THIS PROJECT WAS CREATED & DEBUGGED WITH CHATGPT
