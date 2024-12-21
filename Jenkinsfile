pipeline {
    agent any
    tools {nodejs 'Nodejs-22.6.0'}
    stages {
        stage ('node version check'){
            steps {
                sh '''
                    node -v
                    npm -v
	            echo 'this is for testing'
                '''
            }
        }

    }
}
