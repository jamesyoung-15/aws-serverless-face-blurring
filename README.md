# AWS Serverless Image Face Blurring

Serverless event-driven application that blurs faces in an image using AWS services (Rekognition, S3, SQS, Lambda, DynamoDB).

Website: [https://faceblur.jyylab.com](https://faceblur.jyylab.com)

For a simpler self-hostable open-source implementation, see my old project [here](https://github.com/jamesyoung-15/serverless-face-blurring), where I used OpenFaaS in place of Lambda, MinIO instead of S3, and MTCNN instead of Rekognition.

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
    - CompressJS
- Lambda
  - Python (Pillow + Boto3)
- IaC
  - Terraform

#### Upload Image Process

- API Gateway + Lambda + S3 + DynamoDB: Store user uploaded image, create job tracker
- SQS + Lambda + Rekognition: Create message queue, trigger Rekognition to detect faces on upload
- Rekognition + Lambda + S3: Detect face pixel locations, apply blur to faces on image, stores blurred image on S3, update job tracker

#### Retrieve Image Process

- API Gateway + Lambda + DynamoDB + S3: Periodically check job progress, returns image back to user when completed, returns error otherwise

#### Front-End

- Using Cloudflare for DNS and also includes CDN and TLS with static website stored on S3
- User chooses image to upload, image is compressed before sending, triggers PUT request through API
- After upload, website will poll every few seconds for job update until completed, then show new image to user available to download
