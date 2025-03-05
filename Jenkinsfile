pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 23.9.0'  // Make sure 'NodeJS 23.9.0' is configured in Jenkins tools
    }
    
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

