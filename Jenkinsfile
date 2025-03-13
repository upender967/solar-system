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
    stages('audit fix'){
       steps{
          sh 'npm audit --audit-level=critical'
       }
    }
    }
  }
}


































