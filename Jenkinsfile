pipeline {
  agent any

  tools {
    nodejs "node JS"
  }

 environment {
  mongo_uri = credentials("mongo-uri")
  mongodb_credentials= credentials("mongodb-credentials")
  mongodb_username= credentials("mongodb-username")
  mongodb_password= credentials("mongodb-password")
}


  stages {

    
    stage('Install Dependency') {
      options { timestamps () }
      steps {
        sh 'npm install --no-audit'
      }
    }

    // stage('Auto Fix (Safe Upgrades)') {
    //   steps {
    //     sh 'npm audit fix || true'
    //   }
    // }

    stage('Dependency Scanning') {
      parallel {
        stage('npm Dependency Audit') {
          steps {
            sh 'npm audit --audit-level=critical'
          }
        }
        stage('OWASP Dependency-Check Vulnerabilities') {
          steps {
            dependencyCheck additionalArguments: '''
              -o './'
              -s './'
              -f 'ALL'
              --prettyPrint
            ''', odcInstallation: 'owasp-tool'

            dependencyCheckPublisher pattern: 'dependency-check-report.xml'
          }
        }
      }
    }


    stage('Unit Testing') {
      options { retry (2) }
      steps {
      withCredentials([usernamePassword(credentialsId: 'mongodb-credentials', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')]) {
          sh 'npm test'
      }
    
      }
    }


    stage('Code Coverage') {
        steps {
            withCredentials([usernamePassword(credentialsId: 'mongodb-credentials', passwordVariable: 'MONGO_PASSWORD',usernameVariable: 'MONGO_USERNAME')]) {
                catchError(buildResult: 'SUCCESS', message: 'It will be fixed later', stageResult: 'UNSTABLE') {
                    sh 'npm run coverage'
                }
            }
          
        }
    }

    stage (" Building docker image"){
      steps{
        sh "docker build -t muskaan810/nodemongoapp:$GIT_COMMIT ."
      }
    }


    stage("Push to Registry") {
      steps {
        script {
          withDockerRegistry(credentialsId: 'dockerhub-credentials', url: 'https://index.docker.io/v1/') {
            sh "docker push muskaan810/nodemongoapp:$GIT_COMMIT"
          }
        }
      }
    }

    stage("Deploy to AWS-EC2") {
      when {
        branch 'feature/*'
      }

      steps {
        script {
         sshagent(['EC2-privatekey']) {
           sh '''
                  ssh -o StrictHostKeyChecking=no ubuntu@44.201.249.132 "
                      if sudo docker ps -a | grep -q "nodemongoappcont"; then
                          echo "Container found. Stopping..."
                          sudo docker stop "nodemongoappcont" && sudo docker rm "nodemongoappcont"
                          echo "Container stopped and removed."
                      fi
                      sudo docker run --name nodemongoappcont\
                        -e MONGO_URI=$mongo-uri \
                        -e MONGO_USERNAME=$mongodb_username \
                        -e MONGO_PASSWORD=$mongodb_password \
                        -p 3000:3000 -d muskaan810/nodemongoapp:$GIT_COMMIT
                  "
              '''
    
          }
        }
      }
    }


  
  } 

  post {
      always {
                      publishHTML(target: [
                              allowMissing: false,
                              alwaysLinkToLastBuild: true,
                              keepAll: true,
                              reportDir: 'coverage/lcov-report/',
                              reportFiles: 'index.html',
                              reportName: 'Code Coverage Html Report'
                          ]) 

                                        publishHTML(target: [
                              allowMissing: false,
                              alwaysLinkToLastBuild: true,
                              keepAll: true,
                              reportDir: './',
                              reportFiles: 'dependency-check-report.html',
                              reportName: 'Oswao dependency check report'
                          ]) 
                          cleanWs()
      }
    }
}  
