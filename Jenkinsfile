pipeline {
    agent any

    tools {
        nodejs 'nodejs-22-6-0'
    }

    stages {
        stage('VM Node Version') {
            steps {
                sh '''
                    node -v
                    npm -v
                    git --version
                    echo $?
                
                '''
            }
        }
    }
}