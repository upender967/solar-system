pipeline{
  agent any
  tools {
  nodejs 'node-js'
}


  stages{
    stage('Installing Dependency'){
      steps{
          sh 'npm install --no-audit'
        
      }
    }
    stage('parellel'){
      parallel{
              stage('audit fix'){
               steps{
                  sh 'npm audit --audit-level=critical'
                  sh 'echo hiiii'
               }
              }
             stage('owasp' ){
               steps{
               dependencyCheck additionalArguments: '''
                 --scan './' 
                 --out './' 
                 --format 'ALL' 
                 --prettyPrint''', odcInstallation: 'owasp'
                   dependencyCheckPublisher pattern: 'http://172.210.59.109:8080/job/Jenkins-Project/job/main/2/execution/node/3/ws/dependency-check-report.xml', stopBuild: true
                   publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: './', reportFiles: 'http://172.210.59.109:8080/job/Jenkins-Project/job/jenkins/2/execution/node/3/ws/dependency-check-jenkins.html', reportName: 'HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                   junit stdioRetention: 'ALL', testResults: 'http://172.210.59.109:8080/job/Jenkins-Project/job/jenkins/2/execution/node/3/ws/dependency-check-junit.xml'
               }
             }
      }
    }
    
  }
}


































