pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo-uri')
        MONGO_USERNAME = credentials('mongo-username')
        MONGO_PASSWORD = credentials('mongo-password')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm run test'
            }
            post {
                always {
                    junit 'test-results.xml'
                    publishHTML(target: [
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Code Coverage Report'
                    ])
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("zim0101/kodekloud-solar-system:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        dockerImage.push()
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}