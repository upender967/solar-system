pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'  // The name you configured in Global Tool Configuration
    }

    stages {
        stage('Install Node.js and NPM') {
            steps {
                script {
                    // You can skip manual installation since it's configured
                    sh 'node -v'
                    sh 'npm -v'
                }
            }
        }
    }
}


