# AWS Serverless Image Face Blurring

Serverless event-driven application that blurs faces in an image using AWS services (Rekognition, S3, SQS, Lambda, DynamoDB, API Gateway) and deployed with Terraform. Personal project to learn Terraform, Github actions, and practice using some AWS services.

Application website: [https://faceblur.jyylab.com](https://faceblur.jyylab.com).

## Demo

![Website Blurring Demo](./media/face-blur-demo.gif)

Website: [https://faceblur.jyylab.com](https://faceblur.jyylab.com)

## Tech Stack

### AWS Infrastructure

![Diagram](./media/Diagram.drawio.png)

### Languages/Frameworks/Libraries

- Front-End
  - HTML
  - Bulma Framework + CSS
  - Javascript
    - CompressJS (for compressing images client-side)
- Lambda
  - Python (Pillow + Boto3)
- IaC
  - Terraform

#### Front-End

Front-End uses basic HTML and Javascript styles with Bulma CSS framework. Users upload image which will be encoded in base64 and sent to API Gateway via a POST request. Since API Gateway has 10 MB payload limit, I used CompressJS to compress images client-side so that users can upload larger images (max I tried was 35 MB image that compressed down to 5 MB). Once user sends it, the website will poll for the job status and if the job is completed it will return the image with a pre-signed URL from S3.

#### Upload Image Process

Once API Gateway receives the payload, it is processed with Lambda via proxy integration. The Lambda reads the encoded base64, converts it back to an image, then stores it in S3. A job with a jobID is created in DynamoDB to track its progress.

#### Blur Image Process

Once an image is uploaded to S3, it creates an event for SQS and will put it in a queue. A Lambda functions polls for the queue, and will read the message which contains the image key (filename and path). The Lambda function calls Rekognition detect face API which returns any human faces detected and their bounding box coordinates. Using the coordinates, I used Python Pillow's `GaussianBlur` function to blur the region and store it back into the S3 bucket. The job is then updated in DynamoDB and marked as complete.

#### Retrieve Image Process

Users poll for the image job status via the API and Lambda every few seconds. The Lambda function returns the job status and will also return a S3 pres-signed URL to view the image if the job is complete.

## Self-Hosted Project

For a simpler self-hostable open-source implementation, see my old project [here](https://github.com/jamesyoung-15/serverless-face-blurring), where I used OpenFaaS in place of Lambda, MinIO instead of S3, and MTCNN instead of Rekognition. This implementation does not use event driven architecture as above.
