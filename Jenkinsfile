pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
    }

    environment {
        // Referencing credentials from Jenkins
        MONGO_URI = "mongodb://10.0.2.15:27017"
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

        stage('Verify MongoDB Connectivity') {
            steps {
                script {
                    echo "Testing MongoDB connection at ${MONGO_URI}..."
                    // Test if MongoDB is reachable (replace with actual MongoDB URI and credentials if necessary)
                    sh '''
                        if nc -zv 10.0.2.15 27017; then
                            echo "MongoDB is reachable"
                        else
                            echo "MongoDB is not reachable"
                            exit 1
                        fi
                    '''
                }
            }
        }

        stage('JUnit Tests') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'mongo-credentials', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')])  {
                    script {
                        echo "Connecting to MongoDB with user: ${MONGO_USERNAME}"
                        sh 'npm test'  // This will run your test script defined in package.json
                    }
                    junit allowEmptyResults: true, stdioRetention: 'ALL', testResults: 'test-result.xml'  
                }
            }
        }

    }
}
