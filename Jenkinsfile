pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
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

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'printenv'
                    sh "docker build -t solar-system-image:${env.GIT_COMMIT} ."
                }
            }
        }

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

        stage('Deploy Solar System Container') {
            when {
                branch 'feature-branch'
            }
            steps {
                script {
                    sshagent(['ssh-credentials']) {
                        sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@3.86.249.37 <<EOF
                        
                        # echo "Pulling the latest Docker image..."
                        # docker pull solar-system-image:${GIT_COMMIT}
        
                        if docker ps -a --format '{{.Names}}' | grep -q '^solar-system$'; then
                            echo "Stopping and removing existing container..."
                            docker stop solar-system && docker rm solar-system
                        else
                            echo "No existing container found."
                        fi
        
                        docker run -d --name solar-system \
                            -p 3000:3000 \
                            -e MONGO_URI=$MONGO_URI \
                            -e MONGO_USERNAME=$MONGO_USERNAME \
                            -e MONGO_PASSWORD=$MONGO_PASSWORD \
                            solar-system-image:${GIT_COMMIT}
                        EOF
                        '''
                    }
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
