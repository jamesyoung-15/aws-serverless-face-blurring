# API Gateway
resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "face-blur-http-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_methods = ["POST"]
    allow_origins = ["*"]
    allow_headers = ["*"]
  }
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "api_gateway_stage" {
  api_id      = aws_apigatewayv2_api.api_gateway.id
  name        = "prod"
  auto_deploy = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.cloudwatch_api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

# API Gateway Route
resource "aws_apigatewayv2_route" "api_gateway_route" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "POST /upload"
  target    = "integrations/${aws_apigatewayv2_integration.api_integration_upload.id}"
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "cloudwatch_api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.api_gateway.name}"

  retention_in_days = 3
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }
}

# API Gateway Integration Lambda
resource "aws_apigatewayv2_integration" "api_integration_upload" {
  api_id = aws_apigatewayv2_api.api_gateway.id

  integration_uri    = aws_lambda_function.upload_image_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# API Gateway Permission for Lambda
resource "aws_lambda_permission" "api_gateway_upload_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_image_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api_gateway.execution_arn}/*/*/*"
}

# DynamoDB Table to store the job status
resource "aws_dynamodb_table" "jobs_table" {
  name         = "Face-Blurring-Jobs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "jobId"

  attribute {
    name = "jobId"
    type = "S"
  }

  ttl {
    attribute_name = "expireAt"
    enabled        = true
  }

  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }
}


# S3 Bucket to store both original and blurred images
resource "aws_s3_bucket" "face_blur_bucket" {
  bucket = "face-blurring-bucket-jyylab"
}

resource "aws_s3_bucket_lifecycle_configuration" "face_blur_bucket_lifecycle" {
  bucket = aws_s3_bucket.face_blur_bucket.id
  # delete the object after 1 day
  rule {
    id = "delete-objects"
    expiration {
      days = 1
    }
    status = "Enabled"
  }
}

# S3 Block Public Access
resource "aws_s3_bucket_public_access_block" "face_blur_bucket_block" {
  bucket = aws_s3_bucket.face_blur_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 CORS Policy
resource "aws_s3_bucket_cors_configuration" "face_blur_bucket_cors" {
  bucket = aws_s3_bucket.face_blur_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}

# Policy to allow Lambda to assume role
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# IAM Role for Lambda, give basic execution role
resource "aws_iam_role_policy_attachment" "iam_lambda" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM Policy to allow Upload Lambda to access S3, DynamoDB, SQS
resource "aws_iam_role_policy" "iam_policy_lambda" {
  name = "lambda_face_blurring_policy"
  role = aws_iam_role.iam_for_lambda.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ],
        "Resource" : [
          "${aws_s3_bucket.face_blur_bucket.arn}/*",
          "${aws_s3_bucket.face_blur_bucket.arn}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ],
        "Resource" : "${aws_dynamodb_table.jobs_table.arn}"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "sqs:ChangeMessageVisibility",
          "sqs:ReceiveMessage",
          "sqs:GetQueueAttributes",
          "sqs:DeleteMessage",
          "sqs:GetQueueUrl"
        ],
        "Resource" : "${aws_sqs_queue.face_blur_queue.arn}"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "arn:aws:logs:*:*:*"
      },
      {
        "Effect": "Allow",
        Action: [
          "rekognition:DetectFaces"
        ],
        "Resource": "*"
      }
    ]
  })
}

# Zip the lambda code
data "archive_file" "archive_upload_lambda" {
  type        = "zip"
  source_dir  = "../lambda"
  output_path = "${path.module}/lambda.zip"
}

# Lambda function to upload image to S3
resource "aws_lambda_function" "upload_image_lambda" {
  filename      = "lambda.zip"
  function_name = var.upload_function_name
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "upload.lambda_handler"

  runtime = "python3.12"
  timeout = 30
  memory_size = 512

  environment {
    variables = {
      DYNAMODB_TABLE = "${aws_dynamodb_table.jobs_table.name}"
      BUCKET_NAME    = "${aws_s3_bucket.face_blur_bucket.bucket}"
    }
  }
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }

  depends_on = [ aws_cloudwatch_log_group.cloudwatch_upload_lambda, aws_iam_role_policy_attachment.iam_lambda ]
}

# cloudwatch log group for upload lambda
resource "aws_cloudwatch_log_group" "cloudwatch_upload_lambda" {
  name = "/aws/lambda/${var.upload_function_name}"

  retention_in_days = 3
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }
}

# SQS Queue to trigger the face blurring lambda
resource "aws_sqs_queue" "face_blur_queue" {
  name                       = "face-blurring-queue"
  delay_seconds              = 2
  visibility_timeout_seconds = 30
  message_retention_seconds  = 300
  receive_wait_time_seconds  = 2
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : "*",
        "Action" : "sqs:SendMessage",
        "Resource" : "*",
        "Condition" : {
          "ArnEquals" : {
            "aws:SourceArn" : "${aws_s3_bucket.face_blur_bucket.arn}"
          }
        }
      }
    ]
  })
}

# S3 send notification to SQS
resource "aws_s3_bucket_notification" "face_blur_bucket_notification" {
  bucket = aws_s3_bucket.face_blur_bucket.id

  queue {
    queue_arn     = aws_sqs_queue.face_blur_queue.arn
    events        = ["s3:ObjectCreated:*"]
    filter_prefix = "original-uploads/"
  }
}

# Lambda function to blur faces in the image
resource "aws_lambda_function" "blur_lambda" {
  filename      = "lambda.zip"
  function_name = var.blur_function_name
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "blur.lambda_handler"

  layers = [var.pillow_layer_arn]

  runtime = "python3.12"
  timeout = 30
  memory_size = 1024

  environment {
    variables = {
      DYNAMODB_TABLE = "${aws_dynamodb_table.jobs_table.name}"
      BUCKET_NAME    = "${aws_s3_bucket.face_blur_bucket.bucket}"
    }
  }
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }

  depends_on = [ aws_cloudwatch_log_group.cloudwatch_blur_lambda, aws_iam_role_policy_attachment.iam_lambda ]
}


# Lambda event source mapping
resource "aws_lambda_event_source_mapping" "sqs_mapping" {
  event_source_arn = aws_sqs_queue.face_blur_queue.arn
  function_name    = aws_lambda_function.blur_lambda.function_name
  batch_size       = 1
  depends_on       = [aws_lambda_function.blur_lambda]
}

# cloudwatch log group for blur lambda
resource "aws_cloudwatch_log_group" "cloudwatch_blur_lambda" {
  name = "/aws/lambda/${var.blur_function_name}"

  retention_in_days = 3
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }
}

# Lambda for getting getting job status and image
resource "aws_lambda_function" "get_job_lambda" {
  filename      = "lambda.zip"
  function_name = var.get_job_function_name
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "get_image.lambda_handler"

  runtime = "python3.12"
  timeout = 30
  memory_size = 512

  environment {
    variables = {
      DYNAMODB_TABLE = "${aws_dynamodb_table.jobs_table.name}"
      BUCKET_NAME    = "${aws_s3_bucket.face_blur_bucket.bucket}"
    }
  }
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }

  depends_on = [ aws_cloudwatch_log_group.cloudwatch_get_job_lambda, aws_iam_role_policy_attachment.iam_lambda ]
}

# cloudwatch log group for get job lambda
resource "aws_cloudwatch_log_group" "cloudwatch_get_job_lambda" {
  name = "/aws/lambda/${var.get_job_function_name}"

  retention_in_days = 3
  tags = {
    "application"       = "face-blurring"
    "terraform_managed" = "true"
  }
}

# API Gateway Route for get job status
resource "aws_apigatewayv2_route" "api_gateway_route_get_job" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "GET /jobs/{jobId}"
  target    = "integrations/${aws_apigatewayv2_integration.api_integration_get_job.id}"
}

# API Gateway Integration Lambda for get job status
resource "aws_apigatewayv2_integration" "api_integration_get_job" {
  api_id = aws_apigatewayv2_api.api_gateway.id

  integration_uri    = aws_lambda_function.get_job_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# API Gateway Permission for Lambda get job status
resource "aws_lambda_permission" "api_gateway_get_job_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_job_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api_gateway.execution_arn}/*/*/*"
}