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