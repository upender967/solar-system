pipeline {
  agent any

  tools {

    nodejs "node Js"
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
