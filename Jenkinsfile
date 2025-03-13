pipeline{
  agent any
  tools {
  nodejs 'node-23-9-0'
}

  stages{
    stage('Installing Dependency'){
      steps{
          sh 'npm install --no-audit'
        
      }
    }
    stage('audit fix'){
       steps{
          sh 'npm audit --audit-level=critical'
       }
      }
     stage('owasp' ){
       steps{
         dependencyCheck additionalArguments: '''
              --scan  \\\'./\\\'
              --out  \\\'./\\\'
              --format \\\'./\\\'
              --prettyPrint\'\'\'''', odcInstallation: 'owasp'
       }
     }
    
    
  }
}


































