# AWS Serverless Image Face Blurring

Serverless event-driven application that blurs faces in an image using AWS services (Rekognition, S3, SQS, etc.).

## Tech Stack

### AWS Infrastructure

- Cloudfront + S3: Front-End Hosting
- API Gateway + Lambda + S3: Store User Uploaded Image (triggers Rekognition)
- Lambda + Rekognition: Detect Faces
- Lambda + S3: Applies blur to faces on image, stores blurred image on S3
- S3 + Lambda + API Gateway: Return image back to user

### Languages/Frameworks/Libraries

- Front-End
  - HTML
  - Bulma CSS Framework
  - CSS
  - Javascript
- Lambda
  - NodeJS
