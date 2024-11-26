# API Gateway
resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "face-blur-http-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_methods = ["POST"]
    allow_origins = ["*"]
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

# Create CNAMES for API Gateway
resource "cloudflare_record" "api_gateway_cname" {
  zone_id = data.cloudflare_zones.domain.zones[0].id
  name    = "${var.subdomain_api}.${var.site_domain}"
  value   = "${aws_apigatewayv2_api.api_gateway.api_endpoint}/prod"
  type    = "CNAME"

  ttl     = 1
  proxied = true
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

# S3 Block Public Access
resource "aws_s3_bucket_public_access_block" "face_blur_bucket_block" {
  bucket = aws_s3_bucket.face_blur_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

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

# IAM Policy to allow Upload Lambda to access S3 and DynamoDB
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
          "s3:PutObject"
        ],
        "Resource" : [
          "${aws_s3_bucket.face_blur_bucket.arn}/*"
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
      }
    ]
  })
}

# Zip the lambda code
data "archive_file" "archive_upload_lambda" {
  type        = "zip"
  source_dir  = "../lambda"
  output_path = "${path.module}/upload_image_lambda.zip"
}

# Lambda function to upload image to S3
resource "aws_lambda_function" "upload_image_lambda" {
  filename      = "upload_image_lambda.zip"
  function_name = "lambda_face_blurring_upload"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "upload.lambda_handler"

  runtime = "python3.9"
  timeout = 30

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
}