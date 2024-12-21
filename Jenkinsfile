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

	stage ('Dependency Check'){
		
		steps {
			dependencyCheck additionalArguments: '''
				--scan \'./\'
				--out  \'./\'
				--format \'ALL\'
			        --prettyPrint''', odcInstallation: 'OWASP-10'
			

		}		

	}

    }
}
