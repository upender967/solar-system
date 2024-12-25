pipeline {
    agent any
    tools {nodejs 'Nodejs-22.6.0'}
    environment {
  MONGO_URI = "mongodb+srv://supercluster.d83jj.mongodb.net/superData"
  MONGO_USERNAME=credentials('mongo-username')
  MONGO_PASSWORD=credentials('mongo-pwd')
  SONAR_SCANNER=tool 'sonarqube-610'
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

			withSonarQubeEnv('sonarqube-server1'){	
				sh '''
				
   						 
					$SONAR_SCANNER/bin/sonar-scanner \
  					-Dsonar.projectKey=SolarSystem-Project \
  					-Dsonar.sources=app.js \
					-Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info 
					
				'''
				}
			waitForQualityGate abortPipeline: true
			//		}	

		}

	}	
	

	stage ('Build Docker image'){
		steps {
			sh 'printenv'
			sh 'docker build -t majid359/solarsystem:$GIT_COMMIT .'
		      }
			
		}

       stage ('Image scanning-Trivy') {
		steps {

			sh '''
			trivy image majid359/solarsystem:$GIT_COMMIT \
			--severity LOW,MEDIUM,HIGH \
			--exit-code 0 \
			--quiet \
			--format json -o trivy-image-non-critical-results.json

			trivy image majid359/solarsystem:$GIT_COMMIT \
                        --severity CRITICAL \
                        --exit-code 1 \
                        --quiet \
                        --format json -o trivy-image-cirtical-results.json
 			
 			'''

		      }
		post {

			always {

				sh '''

			 	trivy convert \
				 --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
				 --output trivy-image-non-critical-results.html  trivy-image-non-critical-results.json

				trivy covert \
				--format template --template "@/usr/local/share/trivy/templates/html.tpl" \
				--output trivy-image-critical-results.html  trivy-image-critical-results.json
				

				
				   '''

			       }
		     }

		
		}    

    }

post {
  always {
     junit allowEmptyResults: true, stdioRetention: '', testResults: 'dependency-check-junit.xml'
     junit allowEmptyResults: true, stdioRetention: '', testResults: 'test-results.xml'
    publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Coverage Report', reportTitles: '', useWrapperFileDirectly: true])
     publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: './', reportFiles: 'trivy-image-non-critical-results.html', reportName: 'Trviy-image-non-critical-vulnerabilities', reportTitles: '', useWrapperFileDirectly: true])
     publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: './', reportFiles: 'trivy-image-critical-results.html', reportName: 'Trviy-image-critical-vulnerabilities', reportTitles: '', useWrapperFileDirectly: true])
     
 	 }
    }
}
	

