terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.18.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.35.0"
    }
  }
}