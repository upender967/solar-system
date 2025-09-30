pipeline {
    agent any

    tools {
        nodejs 'nodejs-24-9-0'
    }

    stages {
        stage('VM Node Version') {
            steps {
                sh 'npm install --no-audit'
            }
        }

        stage('NPM Dependency Audit') {
            steps {
                sh '''
                    npm audit --audit-level=critical
                    echo $?
                '''
            }
        }
    }
}