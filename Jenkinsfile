pipeline {
  agent any

  tools {
    nodejs "node JS"
  }

 environment {
  MONGO_URI = "mongodb://muskaan:StrongPassword123@192.168.0.108:27017/solarsystemdb?authSource=admin"
}


  stages {

    stage("checking url")
    {
          steps {
      echo "Mongo URI: ${env.MONGO_URI}"
      sh 'echo $MONGO_URI' // inside shell
    }
    }

    stage('Test MongoDB Connection') {
  steps {
    sh 'nc -zv 192.168.0.108 27017 || echo "MongoDB not reachable!"'
  }
}
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
        sh "docker build -t muskaan810/nodemongoapp:$GIT_COMMIT"
      }
    }


    stage ("push to registry")
    {
      steps{
        // for this docker registry one , docker pipeline plugins needs to be installed in jenkins
        withDockerRegistry(credentialsId: 'dockerhub-credentials', url: '""') {
           sh "docker push -t muskaan810/nodemongoapp:$GIT_COMMIT"
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
