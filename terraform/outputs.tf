output "api_gateway_invoke_url" {
  value = "https://${var.subdomain_api}.${var.site_domain}"
}

output "domain_zones" {
  value = data.cloudflare_zones.domain
}

output "static_website_endpoint" {
  value = "https://${var.subdomain_website}.${var.site_domain}"
}