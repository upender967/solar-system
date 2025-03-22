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
        GITEA_TOKEN = credentials('tpplus-token')
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
                                    ssh -o StrictHostKeyChecking=no ubuntu@54.84.167.209 bash -c "
                                    echo 'Waiting for a moment to allow the image to be available on Docker Hub...'
                                    #sleep 40  # Wait for 20 seconds
                                    # echo 'Pulling the latest Docker image...'
                                    # docker pull solar-system-image:${GIT_COMMIT}
                                    
                                    if docker ps -a --format '{{.Names}}' | grep -q '^solar-system$'; then
                                        echo 'Stopping and removing existing container...'
                                        docker stop solar-system && docker rm solar-system
                                    else
                                        echo 'No existing container found.'
                                    fi
                                    
                                    docker run -d --name solar-system \
                                        -p 3000:3000 \
                                        -e MONGO_URI=$MONGO_URI \
                                        -e MONGO_USERNAME=$MONGO_USERNAME \
                                        -e MONGO_PASSWORD=$MONGO_PASSWORD \
                                        relyonlyurself/first-repo:$GIT_COMMIT
                                    "
                                '''
                            }
                        }
                    }
                }
       /* 
        stage('Run EC2 Integration Script') {
            when {
                branch 'feature-branch'  // Trigger only when the branch is 'feature-branch'
            }
            steps {
                script {
                    withAWS(region: 'us-east-1', credentials: 'awzs-credentials') {
                        // Running the shell script in the EC2 instance
                        sh './ec2-integration-script.sh'  // Ensure this script is in your repository or provide the correct path
                    }
                }
            }
        }
     */ 
        stage('Update Image Tag') {
            when {
                branch 'PR*'  // Runs only on the 'feature' branch
            }
            steps {
                script {
                    sh '''
                    
                    git clone https://$GITEA_TOKEN@github.com/khaled-projects/tpcplusplus.git tpcplusplus
        
                    cd tpcplusplus
                    git config --global user.email "khaledneji25@gmail.com"
                    git config --global user.name "khaled-projects"
        
                    sed -i "s|image: relyonlyurself/first-repo:[^ ]*|image: relyonlyurself/first-repo:$GIT_COMMIT|" kubernetes/deployment.yaml
        
                    git add kubernetes/deployment.yaml
                    git commit -m "Updated image to relyonlyurself/first-repo:$GIT_COMMIT"
                    git push https://$GITEA_TOKEN@github.com/khaled-projects/tpcplusplus.git main
                    exit 0
                    '''
                }
            }
        }
    }
    post {
        always {
            // Check if the folder exists, then remove it
            script {
                if (fileExists('tpcplusplus')) {
                    sh 'rm -rf tpcplusplus'
                    echo "Removed 'tpcplusplus' folder."
                } else {
                    echo "'tpcplusplus' folder does not exist."
                }
            }
            echo "Publishing HTML Report..."
            junit allowEmptyResults: true, testResults: 'test-result.xml'
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, icon: '', keepAll: false, 
                         reportDir: 'coverage/lcov-report/', reportFiles: 'index.html', 
                         reportName: 'Coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}
