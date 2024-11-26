import json
import boto3
from botocore.exceptions import ClientError
import base64
import os
import uuid
from datetime import datetime, timedelta

def lambda_handler(event, context):
    # get service resources
    s3 = boto3.client("s3")
    dynamodb = boto3.resource('dynamodb')

    # image data
    bucket = os.environ['BUCKET_NAME']
    payload = json.loads(event['body'])
    image = payload['content']
    print(image)
    image_data = base64.b64decode(image + "===") # add padding to avoid incorrect padding error
    unique_str = str(uuid.uuid4().hex)
    key = f"{unique_str}.jpg"
    try:
        put_response = s3.put_object(
            Body = image_data,
            Bucket = bucket,
            Key = "original-uploads/"+key,
            ContentType='image/jpeg',
            ContentEncoding='base64'
            )
    except ClientError as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error uploading image'})
        }

    # create job tracking in dynamodb
    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])
    expiration_time = int((datetime.now() + timedelta(minutes=5)).timestamp()) # ttl 5 minutes
    table.put_item(
        Item={
            'jobId': unique_str,
            'status': 'PENDING',
            'expireAt': expiration_time
        }
    )
    
    # response message
    response_message = "Image uploaded successfully!"
    
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST'
        },
        'body': json.dumps({
            'message': response_message,
            'JobID': unique_str
        })
    }