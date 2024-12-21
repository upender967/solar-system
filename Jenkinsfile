pipeline {
    agent any
    tools {nodejs 'Nodejs-22.6.0'}
    stages {
        stage ('Install dependencies'){
            steps {
                sh '''
                    npm install --no-audit
                '''
            }
        }

    }
}
