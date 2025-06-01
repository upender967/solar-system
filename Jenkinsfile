Pipeline {
  agent any
  tools {
    nodejs 'nodejs-24'
  }
  stages {
    stage('Node Version') {
      sh '''
        echo "Node Version: $(node -v)"
        echo "NPM Version: $(npm -v)"
      '''
    }
  }
}