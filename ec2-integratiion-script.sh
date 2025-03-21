#!/bin/bash

# Fetch EC2 Instance ID (from instance metadata)
# This is not necessary anymore since we're using the AWS CLI directly

# Fetch EC2 Instance DNS using AWS CLI
fetch_dns_name() {
    DNS_NAME=$(aws ec2 describe-instances \
        --query "Reservations[0].Instances[0].PublicDnsName" \
        --output text)
    
    if [ -z "$DNS_NAME" ]; then
        echo "Failed to fetch the Public DNS Name. Exiting."
        exit 1
    fi
}

# Query data from the API
query_planet_collection_data() {
    API_ENDPOINT="http://$DNS_NAME:3000/planets-collection-api/data"
    response=$(curl -s $API_ENDPOINT)
    
    if [ -z "$response" ]; then
        echo "No response received from the API. Exiting."
        exit 1
    fi
    echo "$response"
}

# Run the integration test
run_integration_test() {
    if echo "$response" | jq -e '.data[] | select(.name == "Earth")' > /dev/null; then
        echo "Test Passed: Earth data found in the collection."
    else
        echo "Test Failed: Earth data not found in the collection."
        exit 1
    fi
}

# Main function to execute steps
main() {
    fetch_dns_name
    query_planet_collection_data
    run_integration_test
}

# Run the script
main
