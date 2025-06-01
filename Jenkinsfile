Pipeline {
  agent any
  tools {
    nodejs 'nodejs-24'
  }
  stages {
    stage('Node Version') {
      sh '''
        node -v
        npm -v
      '''
    }
  }
}
