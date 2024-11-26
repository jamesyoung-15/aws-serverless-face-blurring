import boto3
from PIL import Image, ImageFilter
import json
import os


def lambda_handler(event, context):
    # get service resources
    s3 = boto3.client("s3")
    dynamodb = boto3.resource('dynamodb')

    bucket = os.environ['BUCKET_NAME']
    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])



    response_message = "Job Completed."

    return {
        'statusCode': 200,
        'body': json.dumps({'message': response_message})
    }
