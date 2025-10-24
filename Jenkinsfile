pipeline {
    agent any

    tools {
        nodejs 'nodejs-22-6-0'
    }

    stages {
        stage('Installing Dependencis') {
            steps {
                sh 'npm install --no-audit'
            }
        }
    }
}