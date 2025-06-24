pipeline {
  agent any

  tools {
    nodejs "node JS"
  }

  // environment {
  //   MONGO_URI = "mongodb+srv://muskaan:StrongPassword123@d83jj.mongodb.net/solarsystemdb?retryWrites=true&w=majority"
  // }

  stages {
    stage('Install Dependency') {
      steps {
        sh 'npm install --no-audit'
      }
    }

    stage('Auto Fix (Safe Upgrades)') {
      steps {
        sh 'npm audit fix || true'
      }
    }

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

    stage('Start MongoDB with Auth') {
      steps {
        sh '''
          docker run -d --name mongo-auth \
            -e MONGO_INITDB_ROOT_USERNAME=muskaan \
            -e MONGO_INITDB_ROOT_PASSWORD=StrongPassword123 \
            -p 27017:27017 mongo:latest
        '''
      }
    }

    stage('Unit Testing') {
      steps {
        sh 'npm test'
      }
    }

    stage('Stop MongoDB') {
      steps {
        sh 'docker rm -f mongo-auth || true'
      }
    }
  }
}
