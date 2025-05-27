pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'solar-system-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        NODE_VERSION = '18'
        MONGO_URI = credentials('mongo-uri')
        MONGO_USERNAME = credentials('mongo-username')
        MONGO_PASSWORD = credentials('mongo-password')
        SONAR_TOKEN = credentials('sonar-token')
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
    }
    
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Deployment environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests')
        booleanParam(name: 'BUILD_DOCKER', defaultValue: true, description: 'Build Docker image')
        booleanParam(name: 'PUSH_DOCKER', defaultValue: false, description: 'Push to Docker registry')
        string(name: 'DOCKER_NAMESPACE', defaultValue: 'myorg', description: 'Docker namespace/organization')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.GIT_BRANCH = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Docker version:"
                    docker --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci --prefer-offline --no-audit'
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Linting') {
                    steps {
                        sh 'npm run lint || true'
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --production || true'
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                script {
                    try {
                        sh 'npm test'
                    } catch (Exception e) {
                        echo "Tests failed but continuing pipeline: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-results.xml'
                }
            }
        }
        
        stage('Code Coverage') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                sh 'npm run coverage || true'
                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Code Coverage Report'
                ])
            }
        }
        
        stage('SonarQube Analysis') {
            when {
                expression { env.SONAR_TOKEN != null }
            }
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=solar-system-app \
                                -Dsonar.projectName='Solar System App' \
                                -Dsonar.projectVersion=${env.BUILD_NUMBER} \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/**,coverage/**,test/** \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.testExecutionReportPaths=test-results.xml
                        """
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                expression { params.BUILD_DOCKER == true }
            }
            steps {
                script {
                    docker.build("${params.DOCKER_NAMESPACE}/${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${params.DOCKER_NAMESPACE}/${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Docker Security Scan') {
            when {
                expression { params.BUILD_DOCKER == true }
            }
            steps {
                sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --format json \
                        --output trivy-image-scan.json \
                        ${params.DOCKER_NAMESPACE}/${DOCKER_IMAGE}:${DOCKER_TAG}
                """
                archiveArtifacts artifacts: 'trivy-image-scan.json', allowEmptyArchive: true
            }
        }
        
        stage('Push Docker Image') {
            when {
                allOf {
                    expression { params.PUSH_DOCKER == true }
                    expression { params.BUILD_DOCKER == true }
                    branch 'main'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-credentials') {
                        docker.image("${params.DOCKER_NAMESPACE}/${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${params.DOCKER_NAMESPACE}/${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy to Environment') {
            when {
                expression { params.ENVIRONMENT != 'prod' || (params.ENVIRONMENT == 'prod' && env.GIT_BRANCH == 'main') }
            }
            steps {
                script {
                    echo "Deploying to ${params.ENVIRONMENT} environment"
                    // Add deployment logic here based on your infrastructure
                    // Example: kubectl apply, docker-compose up, etc.
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
            sh 'docker system prune -f || true'
        }
        success {
            echo 'Pipeline completed successfully!'
            // Send success notification
        }
        failure {
            echo 'Pipeline failed!'
            // Send failure notification
        }
        unstable {
            echo 'Pipeline is unstable!'
            // Send unstable notification
        }
    }
}