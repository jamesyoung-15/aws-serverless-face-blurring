variable "aws_region" {
  description = "AWS region to deploy resources."
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS profile to use for deployment."
  type        = string
  default     = "Dev"
}

variable "site_domain" {
  description = "Domain name for static site."
  type        = string
  default     = "jyylab.com"
}

variable "subdomain_website" {
  description = "Subdomain for static site."
  type        = string
  default     = "faceblur"
}

variable "subdomain_api" {
  description = "Subdomain for API Gateway."
  type        = string
  default     = "api"

}

variable "cloudflare_api_token" {
  description = "Cloudflare API token."
  type        = string
}

variable "upload_function_name" {
  description = "Name for the upload image Lambda function."
  type        = string
  default     = "face-blurring-upload-image"

}

variable "blur_function_name" {
  description = "Name for the blur image Lambda function."
  type        = string
  default     = "face-blurring-blur-image"
}

variable "pillow_layer_arn" {
  description = "ARN for Pillow Lambda Layer."
  type        = string
  default     = "arn:aws:lambda:us-east-1:770693421928:layer:Klayers-p312-pillow:1"

}

variable "get_job_function_name" {
  description = "Name for the get job status Lambda function."
  type        = string
  default     = "face-blurring-get-image"
}