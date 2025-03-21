#!/bin/bash

# Install dependencies (if necessary)
install_dependencies() {
    sudo apt-get update -y
    sudo apt-get install -y jq curl awscli
}

# Fetch EC2 Instance ID (from instance metadata)
fetch_instance_id() {
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
}

# Fetch EC2 Instance DNS using AWS CLI
fetch_dns_name() {
    DNS_NAME=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query "Reservations[0].Instances[0].PublicDnsName" \
        --output text)
}

# Query data from the API
query_planet_collection_data() {
    API_ENDPOINT="http://$DNS_NAME:3000/planets-collection-api/data"
    response=$(curl -s $API_ENDPOINT)
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
    install_dependencies
    fetch_instance_id
    fetch_dns_name
    query_planet_collection_data
    run_integration_test
}

# Run the script
main
