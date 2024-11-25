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

variable "subdomain" {
  description = "Subdomain for static site."
  type        = string
  default     = "faceblur.jyylab.com"
}