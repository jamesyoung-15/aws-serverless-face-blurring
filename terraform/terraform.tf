terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.29"
    }
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.4"
    }
  }
}