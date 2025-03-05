pipeline {
    agent any
    
    stages {
        stage('Check Node.js and NPM Versions') {
            steps {
                script {
                    sh 'node -v'
                    sh 'npm -v'
                }
            }
        }
    }
}

