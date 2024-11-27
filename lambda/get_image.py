import boto3
import json
import os
import base64

def lambda_handler(event, context):

    # get service resources
    s3 = boto3.client("s3")
    dynamodb = boto3.client('dynamodb')

    # get environment variables
    bucket = os.environ['BUCKET_NAME']
    table = os.environ['DYNAMODB_TABLE']

    # check job status from get request
    print(event)
    db_key = event['pathParameters']['jobId']
    get_response = dynamodb.get_item(TableName=table, Key={'jobId': {'S': db_key} })
    if get_response['ResponseMetadata']['HTTPStatusCode'] != 200:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error retrieving job status'})
        }
    job_status = get_response['Item']['status']['S']

    # update message based on job status
    if job_status == "COMPLETED":
        # generate presigned url for the image
        try:
            message = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': "blurred-uploads/"+db_key+".jpg"}, ExpiresIn=3600)
        except Exception as e:
            print(e)
            message = "Error generating presigned URL"
            raise e
    elif job_status == "PENDING":
        message = "Job not complete"
    # send error message if job failed
    else:
        message = "Job failed"

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST'
        },
        'body': json.dumps({
            'content': message,
            'jobId': db_key,
            'status': job_status
        })
    }