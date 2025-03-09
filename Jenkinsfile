pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
    }

    environment {
        // Referencing credentials from Jenkins
          MONGO_URI = "mongodb://127.0.0.1:27017/myDatabase"
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
                withCredentials([usernamePassword(credentialsId: 'mongo-credentials', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')])  {
                    script {
                        sh '''#!/bin/bash
                        echo "Connecting to MongoDB with user: ${MONGO_USERNAME}"
                        npm test  # This will run your test script defined in package.json
                        '''
                    }
                    junit allowEmptyResults: true, stdioRetention: 'ALL', testResults: 'test-result.xml'  
                }
            }
        }

    }
}

