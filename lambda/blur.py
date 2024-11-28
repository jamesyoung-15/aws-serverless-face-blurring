import boto3
from PIL import Image, ImageFilter, ImageDraw
import json
import os
from io import BytesIO

# get service resources
s3 = boto3.client("s3")
dynamodb = boto3.client('dynamodb')
rekognition = boto3.client("rekognition")

# get environment variables
bucket = os.environ['BUCKET_NAME']
table = os.environ['DYNAMODB_TABLE']

def lambda_handler(event, context):
    for message in event['Records']:
        process_message(message)
    print("Completed processing all messages")
       
       
def process_message(message):
    """ 
    This function processes the message from SQS.
    Args:
    - message: dict
    """
    try:
        # print(message['body'])
        s3_event = json.loads(message['body'])
        for item in s3_event['Records']:
            # print(item)
            # read sqs message
            key = item['s3']['object']['key']
            print(f"Bucket: {bucket}, Key: {key}")
            
            # get s3 object
            s3_response = s3.get_object(Bucket=bucket, Key=key)
            s3_object = s3_response['Body'].read()
            # open image
            image = Image.open(BytesIO(s3_object))
            db_key = key.split("/")[1].split(".")[0]

            # blur the face
            blur_face(image, key, db_key)


    except Exception as e:
        print("Error processing message")
        raise e
        

def blur_face(image, key, db_key):
    """
    This function calls Rekognition, blurs the face in the image, then updates the job status. 
    - image: PIL.Image object
    - key: s3 key which is file path (str)
    - db_key: dynamodb key which is the job ID (str)
    """
    # Setup canvas for blur
    image_width, image_height = image.size
    draw = ImageDraw.Draw(image)
    # Detect faces
    try:
        response = rekognition.detect_faces(Image={'S3Object': {'Bucket': bucket, 'Name': key}})
        for faceDetail in response['FaceDetails']:
            # get bounding box of the face
            box = faceDetail['BoundingBox']
            left = int(image_width * box['Left'])
            top = int(image_height * box['Top'])
            width = int(image_width * box['Width'])
            height = int(image_height * box['Height'])

            # print(f"Left: {left}, Top: {top}, Width: {width}, Height: {height}")

            # get confidence threshold
            confidence = float(faceDetail['Confidence'])
            # print(f"Confidence: {confidence}")
            threshold_response = dynamodb.get_item(TableName=table, Key={'jobId': {'S': db_key} })
            # print(threshold_response)
            confidence_threshold = int(threshold_response['Item']['confidenceThreshold']['N'])
            # if it does not exist, set to 50
            if confidence_threshold is None:
                confidence_threshold = 50
            # if confidence is less than threshold, skip (do not blur)
            if confidence < confidence_threshold:
                continue

            # blur the face
            face = image.crop((left, top, left + width, top + height))
            face = face.filter(ImageFilter.GaussianBlur(radius=50))
            image.paste(face, (left, top, left + width, top + height))

    except Exception as e:
        print("Error detecting faces")
        update_job_status(db_key, "FAILED")
        raise e

    # save the image
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    buffer.seek(0) # rewind pointer to start
    file_name = key.replace("original-uploads/", "blurred-uploads/")
    response_put = s3.put_object(Bucket=bucket, Key=file_name, Body=buffer, ContentType="image/jpeg")
    
    # update job status
    status = "COMPLETED" if response_put['ResponseMetadata']['HTTPStatusCode'] == 200 else "FAILED"
    update_job_status(db_key, status)

def update_job_status(db_key, status):
    """
    This function updates the job status in DynamoDB.
    - db_key: dynamodb key which is the job ID (str)
    - status: status to update (str)
    """
    response = dynamodb.update_item(
        TableName=table, 
        Key={
            'jobId': {'S': db_key}
        },
        UpdateExpression='SET #s = :val1',
        ExpressionAttributeNames={
            '#s': 'status'
        },
        ExpressionAttributeValues={
            ':val1': {'S': status}
        }
    )