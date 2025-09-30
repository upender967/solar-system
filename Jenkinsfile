pipeline {
    agent any

    stages {
        stage('install dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }
    }
}