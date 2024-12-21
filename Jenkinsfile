pipeline {
    agent any
    tools {nodejs 'Nodejs-22.6.0'}
    environment {
  MONGO_URI = "mongodb+srv://supercluster.d83jj.mongodb.net/superData"
	}
    stages {
        stage ('Install dependencies'){
            steps {
                sh '''
                    npm install --no-audit
                '''
            }
        }

	stage ('Dependency Check'){
		parallel{
			stage('NPM dependency check')
				{
				steps {
                                    	sh '''
					   npm audit --audit-level=critical
					   echo $?
					'''	
				      }
				}
 		
			stage ('OWASP Check')
				{

				steps {

			dependencyCheck additionalArguments: '''
				--scan \'./\'
				--out  \'./\'
				--format \'ALL\'
			        --prettyPrint''', odcInstallation: 'OWASP-10'
			
				dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
				
				junit allowEmptyResults: true, stdioRetention: '', testResults: 'dependency-check-junit.xml'
				      }
				}

                        }		
		}
	stage ('Unit Testing'){

		steps {

			withCredentials([usernamePassword(credentialsId: 'Mongo-creds', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')]) {
    			sh 'npm test'
			}
		junit allowEmptyResults: true, stdioRetention: '', testResults: 'test-results.xml'

		
		}

	}	
	    

    }
}
	

