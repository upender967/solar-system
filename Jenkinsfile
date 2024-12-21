pipeline {
    agent any 
    stages {
        stage ('node version check'){
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

    }
}
