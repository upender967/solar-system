pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'solar-system-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        NODE_VERSION = '18'
        MONGO_URI = credentials('mongo-uri')
        MONGO_USERNAME = credentials('mongo-username')
        MONGO_PASSWORD = credentials('mongo-password')
    }
    
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests')
        booleanParam(name: 'BUILD_DOCKER', defaultValue: true, description: 'Build Docker image')
        booleanParam(name: 'PUSH_DOCKER', defaultValue: false, description: 'Push Docker image to registry')
        string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to build')
    }
    
    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.BRANCH}"]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/zim0101/kodekloud-solar-system-gitea.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: "NodeJS-${NODE_VERSION}", type: 'nodejs'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "Installing npm dependencies..."
                    npm ci --prefer-offline --no-audit
                    npm list --depth=0
                '''
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        sh '''
                            echo "Running code linting..."
                            npm run lint || echo "No lint script defined"
                        '''
                    }
                }
                stage('Security Scan') {
                    steps {
                        sh '''
                            echo "Running security audit..."
                            npm audit --production || true
                        '''
                    }
                }
            }
        }
        
        stage('Test') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                script {
                    try {
                        sh '''
                            echo "Running tests with coverage..."
                            npm run coverage
                        '''
                    } catch (Exception e) {
                        echo "Tests failed: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-results.xml'
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                    cobertura coberturaReportFile: 'coverage/cobertura-coverage.xml'
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                expression { params.BUILD_DOCKER == true }
            }
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Test Docker Image') {
            when {
                expression { params.BUILD_DOCKER == true }
            }
            steps {
                script {
                    sh '''
                        echo "Testing Docker image..."
                        docker run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} node --version
                        docker run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} npm --version
                    '''
                }
            }
        }
        
        stage('Push Docker Image') {
            when {
                expression { params.PUSH_DOCKER == true && params.BUILD_DOCKER == true }
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                expression { params.ENVIRONMENT != 'production' || (params.ENVIRONMENT == 'production' && env.BRANCH_NAME == 'main') }
            }
            steps {
                script {
                    echo "Deploying to ${params.ENVIRONMENT} environment..."
                    sh '''
                        echo "Creating deployment directory..."
                        mkdir -p deployment
                        cp docker-compose.yml deployment/
                        cd deployment
                        
                        echo "Setting environment variables..."
                        echo "MONGO_URI=${MONGO_URI}" > .env
                        echo "MONGO_USERNAME=${MONGO_USERNAME}" >> .env
                        echo "MONGO_PASSWORD=${MONGO_PASSWORD}" >> .env
                        echo "MONGO_PORT=27017" >> .env
                        echo "MONGO_INITDB_DATABASE=solar-system" >> .env
                        echo "MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}" >> .env
                        echo "MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}" >> .env
                        
                        echo "Docker Compose deployment would happen here in real environment"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up workspace...'
            sh '''
                docker image prune -f || true
                docker container prune -f || true
            '''
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            emailext (
                subject: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                         <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
                to: '$DEFAULT_RECIPIENTS'
            )
        }
        failure {
            echo 'Pipeline failed!'
            emailext (
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                         <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
                to: '$DEFAULT_RECIPIENTS'
            )
        }
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}