pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'zim0101/solar-system'
        GITHUB_REPO = 'https://github.com/zim0101/kodekloud-solar-system-gitea'
    }

    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
        string(name: 'BRANCH', defaultValue: 'main', description: 'Branch to build')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${params.BRANCH}", 
                    url: "${GITHUB_REPO}", 
                    credentialsId: 'github-credentials'
            }
        }

        stage('Setup Node') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
                junit 'test-results.xml'
            }
            post {
                failure {
                    emailext (
                        subject: "Test Failure in ${env.JOB_NAME}",
                        body: "Tests failed in build ${env.BUILD_NUMBER}",
                        to: 'team@company.com'
                    )
                }
            }
        }

        stage('Code Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'npm run sonar'
                }
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Deploy') {
            when {
                expression { params.DEPLOY_ENV == 'production' }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_NUMBER}").push()
                    }
                    
                    // Add deployment steps for Kubernetes/Cloud
                    sh """
                        kubectl set image deployment/solar-system \
                        solar-system=${DOCKER_IMAGE}:${env.BUILD_NUMBER}
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
        }
        success {
            slackSend (
                color: 'good', 
                message: "Build successful: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend (
                color: 'danger', 
                message: "Build failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
            )
        }
    }
}