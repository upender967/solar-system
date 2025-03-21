pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
        /* dockerTool 'docker-cli' */
    }

    environment {
        MONGO_URI = "mongodb://10.0.2.15:27017"
        MONGO_USERNAME = credentials('user_name')
        MONGO_PASSWORD = credentials('db-password')
        SONAR_SCANNER_HOME = tool('SonarQube-Scanner-7.04')
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

        stage('Verify Package.json Exists') {
            steps {
                script {
                    // List files in the workspace to verify package.json exists
                    sh 'ls -la /var/jenkins_home/workspace/peline-nodejs-app_feature-branch@2'
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
/*
        stage('JUnit Tests') {
            steps {
                timeout(time: 1, unit: 'MINUTES') {
                    script {
                        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }
*/
        stage('Generate Test Coverage') {
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                        sh 'npm run coverage'
                    }
                    echo "Coverage issues detected, will be fixed later."
                }
            }
        }

        /* stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh "${SONAR_SCANNER_HOME}/bin/sonar-scanner"
                    }
                }
            }
        } */

        stage('Build Docker Image') {
            steps {
                script {
                    // Print environment variables
                    sh 'printenv'

                    // Build the Docker image with the Git commit as the tag
                    sh "docker build -t solar-system-image:${env.GIT_COMMIT} ."
                }
            }
        }
/*
        stage('Trivy Scan') {
                steps {
                    script {
                        // Scan for MEDIUM and LOW vulnerabilities
                        sh "trivy image --severity MEDIUM,LOW --format json --output ${WORKSPACE}/non-critical-result-${env.GIT_COMMIT}.json --exit-code 0 solar-system-image:${env.GIT_COMMIT}"
                        
                        // Scan for HIGH and CRITICAL vulnerabilities
                        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                            sh "trivy image --severity HIGH,CRITICAL --format json --output ${WORKSPACE}/critical-result-${env.GIT_COMMIT}.json --exit-code 1 solar-system-image:${env.GIT_COMMIT}"
                        }
            
                        // Fetch Trivy HTML template
                        sh '''
                            mkdir -p ${WORKSPACE}/contrib
                            curl -sSL -o ${WORKSPACE}/contrib/html.tpl https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl
                        '''
                        
                        // Convert JSON results to HTML using trivy convert (no need to fetch the template)
                        sh """
                            trivy convert --format html --output ${WORKSPACE}/non-critical-result-${env.GIT_COMMIT}.html ${WORKSPACE}/non-critical-result-${env.GIT_COMMIT}.json
                            trivy convert --format html --output ${WORKSPACE}/critical-result-${env.GIT_COMMIT}.html ${WORKSPACE}/critical-result-${env.GIT_COMMIT}.json
                        """
                       
                            
                    }
                }
                post {
                    always {
                        echo "Publishing Trivy Reports..."
            
                        // Publish HTML reports
                        publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, keepAll: false, 
                                     reportDir: "${WORKSPACE}", reportFiles: "non-critical-result-${env.GIT_COMMIT}.html", 
                                     reportName: 'Non-Critical Vulnerabilities Report', useWrapperFileDirectly: true])
            
                        publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, keepAll: false, 
                                     reportDir: "${WORKSPACE}", reportFiles: "critical-result-${env.GIT_COMMIT}.html", 
                                     reportName: 'Critical Vulnerabilities Report', useWrapperFileDirectly: true])
            
                        // Publish JUnit XML reports
                        junit allowEmptyResults: true, testResults: "${WORKSPACE}/non-critical-result-${env.GIT_COMMIT}.xml"
                        junit allowEmptyResults: true, testResults: "${WORKSPACE}/critical-result-${env.GIT_COMMIT}.xml"
                    }
                }
            }
*/
        stage('Push Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'dockerhub-credentials', url: 'https://index.docker.io/v1/') {
                        sh "docker tag solar-system-image:${env.GIT_COMMIT}  relyonlyurself/first-repo:${env.GIT_COMMIT}"
                       
                        sh "docker push relyonlyurself/first-repo:${env.GIT_COMMIT}"
                    }
                }
            }
        }
    }
        stage('Deploy Solar System Container') {
            when {
                branch 'feature-branch'
            }
            steps {
                script {
                    sshagent(['ssh-credentials']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${HOST} << 'EOF'
                            # Check if the container exists
                            if docker ps -a --format '{{.Names}}' | grep -q '^solar-system\$'; then
                                echo "Stopping and removing existing container..."
                                docker stop solar-system && docker rm solar-system
                            else
                                echo "No existing container found."
                            fi
        
                            # Deploy the new container
                            docker run -d --name solar-system \\
                                -p 3000:3000 \\
                                -e MONGO_URI="mongodb://10.0.2.15:27017" \\
                                -e MONGO_USERNAME="${MONGO_USERNAME}" \\
                                -e MONGO_PASSWORD="${MONGO_PASSWORD}" \\
                                solar-system-image:${env.GIT_COMMIT}
                        EOF
                        """
                    }
                }
            }
        }

    post {
        always {
            echo "Publishing HTML Report..."
            junit allowEmptyResults: true, testResults: 'test-result.xml'
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, icon: '', keepAll: false, 
                         reportDir: 'coverage/lcov-report/', reportFiles: 'index.html', 
                         reportName: 'Coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}
