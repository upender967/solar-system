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
        S3_BUCKET = 'your-s3-bucket-name' 
        GIT_USER_EMAIL = credentials('github-user-email')
        GIT_USER_NAME = credentials('github-user-name')
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
        stage('SonarQube Scan') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh "${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=solar-system \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://your-sonarqube-server:9000 \
                            -Dsonar.login=${credentials('sonar-token')}"
                    }
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
        stage('Trivy Security Scan & Report Conversion') {
                steps {
                    script {
                        // Scan for High & Critical vulnerabilities (Exit 1 if found)
                        sh "trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o trivy-high-critical.json solar-system-image:${env.GIT_COMMIT}"
            
                        // Scan for Medium & Low vulnerabilities (Exit 0)
                        sh "trivy image --severity MEDIUM,LOW --exit-code 0 --format json -o trivy-medium-low.json solar-system-image:${env.GIT_COMMIT}"
            
                        // Convert JSON reports to HTML and XML
                        sh "trivy convert --format template --template @/usr/local/share/trivy/templates/html.tpl -i trivy-high-critical.json -o trivy-high-critical.html"
                        sh "trivy convert --format template --template @/usr/local/share/trivy/templates/html.tpl -i trivy-medium-low.json -o trivy-medium-low.html"
                        sh "trivy convert --format sarif -i trivy-high-critical.json -o trivy-high-critical.xml"
                        sh "trivy convert --format sarif -i trivy-medium-low.json -o trivy-medium-low.xml"
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
        stage('Update Image Tag') {
            when {
                branch 'PR*'  
            }
            steps {
                script {
                    sh '''
                    
                    git clone https://$GITEA_TOKEN@github.com/khaled-projects/tpcplusplus.git tpcplusplus
        
                    cd tpcplusplus
                    git config --global user.email "$GIT_USER_EMAIL"
                    git config --global user.name "$GIT_USER_NAME"
        
                    sed -i "s|image: relyonlyurself/first-repo:[^ ]*|image: relyonlyurself/first-repo:$GIT_COMMIT|" kubernetes/deployment.yaml
        
                    git add kubernetes/deployment.yaml
                    git commit -m "Updated image to relyonlyurself/first-repo:$GIT_COMMIT"
                    git push https://$GITEA_TOKEN@github.com/khaled-projects/tpcplusplus.git main
                    exit 0
                    '''
                }
            }
        }
        stage('Create Gitea PR') {
                    steps {
                        script {
                            sh """
                            curl -X POST -H "Content-Type: application/json" \\
                                 -H "Authorization: token YOUR_GITEA_TOKEN" \\
                                 -d '{
                                      "title": "Update Image to relyonlyurself/first-repo:${GIT_COMMIT}",
                                      "body": "This PR updates the Docker image in deployment.yaml to use the new tag: ${GIT_COMMIT}",
                                      "head": "feature-branch",
                                      "base": "main"
                                  }' \\
                                 https://gitea.example.com/api/v1/repos/khaled-projects/tpcplusplus/pulls
                            """
                        }
                    }
                }
        stage('Approval') {
            steps {
                script {
                    timeout(time: 1, unit: 'DAYS') {  // Timeout after 1 day
                        input message: 'PR Approved and ArgoCD Synced?', ok: 'Proceed'
                    }
                }
            }
        }
        stage('ZAP DAST Scan') {
                steps {
                    script {
                        sh '''
                        mkdir -p zap-reports
                        chmod 777 zap-reports  # Grant full permissions
            
                        docker run --rm --name zap-dast \
                            -v $(pwd)/zap-reports:/zap/wrk/ \
                            --user $(id -u):$(id -g) \  # Run with current user permissions
                            owasp/zap2docker-stable:latest \
                            zap-baseline.py -t http://your-app-url/api/doc -r zap_report.html -x zap_report.xml -J zap_report.json -c Zap_ignore_rule
                        '''
                    }
                }
            } 
        stage('Prepare and Upload Reports') {
                when {
                       branch 'PR*'  // Runs only on the 'feature' branch
                     }
                steps {
                    script {
                        // Create a new directory for the reports
                        def reportsDir = "reports-${BUILD_ID}"
                        sh """
                            mkdir -p ${reportsDir}
                            cp coverage/lcov-report/index.html ${reportsDir}/lcov-report.html
                            cp zap-reports/* ${reportsDir}/
                            cp trivy* ${reportsDir}/
                            cp dependency* ${reportsDir}/
                            cp test-result.xml ${reportsDir}/
                        """
            
                        // List files to ensure they are copied
                        sh "ls -l ${reportsDir}"
            
                        // Use withAWS to provide credentials
                        withAWS(credentials: 'jenkins-aws-credentials', region: 'us-east-1') {
                            // Upload the entire directory to S3 using S3 Upload Plugin
                            s3Upload(
                                bucket: "${S3_BUCKET}",
                                path: "reports/${reportsDir}/",
                                file: "${reportsDir}/",
                                includePathPattern: "**/*",  // Ensures all files in the directory are uploaded
                                recursive: true
                            )
                        }
                    }
                }
        stage('Approval - Deploy to Production') {
                when {
                    branch 'main'
                }
                steps {
                    script {
                        timeout(time: 1, unit: 'DAYS') {  // Timeout after 1 day
                            def userInput = input(
                                message: 'PR Approved and ArgoCD Synced?',
                                ok: 'Proceed',
                                submitter: 'admin' // Only 'admin' can approve
                            )
                        }
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
            // Publish ZAP report as HTML
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, icon: '', keepAll: false, 
                         reportDir: 'zap-reports/', reportFiles: 'zap_report.html', 
                         reportName: 'ZAP HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}
