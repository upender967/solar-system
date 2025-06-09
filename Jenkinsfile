pipeline {
    agent any
    tools {
        nodejs 'NodeJS2410'
    }
    stages {
        stage('VM Node Version') {
            steps {
                sh '''
                    node -v

                    npm -v
                '''
            }
        }
    }
}