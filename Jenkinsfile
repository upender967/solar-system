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
               }
             }
      }
    }
    
  }
}


































