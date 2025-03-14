pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
    }

    environment {
        /* Referencing credentials from Jenkins */
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
                            dependencyCheck additionalArguments: "--scan ./src --out ./ --format HTML --disableAssembly --disableJar", 
                                odcInstallation: 'OWASP-Dependency-Check'
                            dependencyCheckPublisher failedTotalCritical: 1, stopBuild: true
                        }
                    }
                }

                stage('NPM Audit (Critical)') {
                    options {
                        timestamps()
                    }
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
                timeout(time: 1, unit: 'MINUTES') { // Set timeout to 1 minute
                    withCredentials([usernamePassword(credentialsId: 'mongo-credentials', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')]) {
                        script {
                            echo "Connecting to MongoDB with user: ${MONGO_USERNAME}"
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                sh 'npm test' // Runs the test script from package.json
                                junit allowEmptyResults: true, testResults: 'test-result.xml'
                            }
                        }
                    }
                }
            }
        }

        stage('Test Coverage') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'mongo-credentials', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')]) {
                    catchError(buildResult: 'FAILURE', stageResult: 'SUCCESS') {
                        script {
                            echo "Connecting to MongoDB with user: ${MONGO_USERNAME}"
                            sh 'npm run coverage' 
                            publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, icon: '', keepAll: false, reportDir: 'coverage/lcov-report/', reportFiles: 'index.html', reportName: 'Coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                        }
                        echo ":::error will be fixed later"
                    }
                }
            }
        }
    }
}
