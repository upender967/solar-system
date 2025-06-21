pipeline {
  agent any

  tools {

    nodejs "node JS"
  }

  stages {
    stage('Check versions') {
      steps {
        sh 'node -v'
        sh 'npm -v'
      }
    }
  }
}
