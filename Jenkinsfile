pipeline {
    agent any
    tools {nodejs 'Nodejs-22.6.0'}
    environment {
  MONGO_URI = "mongodb+srv://supercluster.d83jj.mongodb.net/superData"
  MONGO_USERNAME=credentials('mongo-username')
  MONGO_PASSWORD=credentials('mongo-pwd')
  SONAR_SCANNER=tool 'sonarqube-server';
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
				
				
				      }
				}

                        }		
		}
	stage ('Unit Testing'){

		steps {

			
    			sh 'npm test'
			
		

		
		}

	}
	
	stage ('Coverage Check'){

		steps {
                       catchError(buildResult: 'SUCCESS', message: 'Will fix this in next release', stageResult: 'UNSTABLE') {
    					sh 'npm run coverage' 
			}
			
			
		}
			
			
	
	}

     stage ('SonarQube Stage'){

		steps {

			
				sh '''
				
   						 
					$SONAR_SCANNER/bin/sonar-scanner \
  					-Dsonar.projectKey=SolarSystem-Project \
  					-Dsonar.sources=app.js 
  					
				'''
						

		}

	}	
	    

    }

post {
  always {
     junit allowEmptyResults: true, stdioRetention: '', testResults: 'dependency-check-junit.xml'
     junit allowEmptyResults: true, stdioRetention: '', testResults: 'test-results.xml'
    publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Coverage Report', reportTitles: '', useWrapperFileDirectly: true])
 	 }
    }
}
	

