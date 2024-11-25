# output "api_gateway_invoke_url" {
#   value = aws_apigatewayv2_api.api_gateway.api_endpoint
# }

output "domain_zones" {
  value = data.cloudflare_zones.domain
}

output "static_website_endpoint" {
  value = "https://${var.subdomain}"

}