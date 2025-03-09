pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
    }

    environment {
        // Referencing credentials from Jenkins
        MONGO_URI = credentials('mongo-uri')  // MONGO_URI will be pulled from the 'mongo-uri' secret text credential
        MONGO_USERNAME = credentials('mongo-username')  // MONGO_USERNAME will be pulled from the 'mongo-username' credential
    }

    stages {
        stage('Verify Node.js and NPM') {
            steps {
                script {
                    sh 'node -v'
                    sh 'npm -v'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install --no-audit'
                }
            }
        }

        stage('Security Checks') {
            parallel {
                stage('Dependency Check (OWASP 10)') {
                    steps {
                        script {
                            dependencyCheck additionalArguments: """
                                --scan ./src  
                                --out ./dependency-check-report 
                                --format ALL 
                                --prettyPrint
                                --data ./dependency-check-data  
                                --disableAssembly  
                                --disableJar  
                            """, odcInstallation: 'OWASP-Dependency-Check'
                            dependencyCheckPublisher failedTotalCritical: 1, stopBuild: true
                        }
                    }
                }

                stage('NPM Audit (Critical)') {
                    steps {
                        script {
                            sh 'npm audit --audit-level=critical'
                        }
                    }
                }
            }
        }

        stage('JUnit Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'mongo-password', variable: 'MONGO_PASSWORD')  // Using mongo-password
                ]) {
                    script {
                        // Running tests with MongoDB credentials
                        echo "Running tests with MongoDB credentials..."

                        // Running npm tests
                        sh '''#!/bin/bash
                        echo "Connecting to MongoDB with user: ${MONGO_USERNAME}"
                        npm test  # This will run your test script defined in package.json
                        '''
                    }
                }
            }
        }

        stage('Publish JUnit Reports') {
            steps {
                script {
                    // Check if the reports directory exists, otherwise skip the publishing
                    if (fileExists('reports/junit-report.xml')) {
                        junit allowEmptyResults: true, testResults: 'reports/junit-report.xml'
                    } else {
                        echo 'No JUnit report generated. Skipping publishing.'
                    }
                }
            }
        }
    }
}

