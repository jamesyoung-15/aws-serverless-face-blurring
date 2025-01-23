# Quick Extra Documentation

## Post Request Format

Upload through API url + `/upload`.

Example POST:

``` json
headers{
    'Content-Type': 'application/json'
},

body {
    "content": "imageBase64",
    "confidenceThreshold": 50
}
```

## Response Request Format

Get JobID and blurred face image base64 with API url + `/jobs/{jobID}`

200 Response example:

``` json

body{
    "content": "imageBase64",
    "jobID": "asdfasdf",
    "status": "COMPLETED",
}
```

## Troubles I Remember Encountering

Lots, but didn't record them so forgot many. Quick list:

1. Large images/files to Base64

- Problems:
  - API Gateway has 10 MB limit
  - Uncompressed files over 8 MB had inconsistent performance, sometimes Lambda couldn't decode and parse the received base64 string
  - Large files also could cause timeouts for Lambda and Rekognition if Lambda memory and timeout not increased
- Resolution:
  - Used compressjs for client-side compression before sending
  - Checked user's image upload size before sending to server
- Take-away:
  - Base64 not suitable for larger files
  - Larger files use chunking or send as binary

2. Base64 Padding

- Problem: Some files couldn't be decoded
- Solution: Add "===" padding to base64
- Take-away: Add padding to base64 even if not necessary to ensure safety

3. Job Tracking

- Problem: Previously didn't have job tracking, user would just wait without knowing if the image was even uploaded successfully
- Solution: Store jobID and status in DynamoDB, update status in each Lambda function, have user poll every few seconds to see job status for more responsive feel

4. Extensibility

- Problem: Found myself copy and pasting same components (headers, footers), means it is less extensible in the future
- Solution: Rewrite with React
- Take-away: Better planning in the beginning
