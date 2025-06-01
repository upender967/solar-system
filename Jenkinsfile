Pipeline {
  agent any
  stages {
    stage('Node Version') {
      sh '''
        echo "Node Version: $(node -v)"
        echo "NPM Version: $(npm -v)"
      '''
    }
  }
}