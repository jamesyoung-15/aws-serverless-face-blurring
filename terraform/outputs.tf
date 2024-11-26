# output "api_gateway_invoke_url" {
#   value = "https://${var.subdomain_api}.${var.site_domain}"
# }

output "api_gateway" {
  value = aws_apigatewayv2_api.api_gateway.api_endpoint
}

output "static_website_endpoint" {
  value = "https://${var.subdomain_website}.${var.site_domain}"
}