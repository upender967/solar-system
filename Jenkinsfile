pipeline {
  agent any

  tools {

    nodejs "node JS"
  }

  environment{
    MONGO_URI=mongodb://muskaan:StrongPassword123.d83jj.mongodb.net/solarsystemdb
  }


  stages {

      stage('install dependency') {
                steps {
                  // --no-audit: skip only the audit step during that install.
                  sh 'npm install --no-audit'
                }
        }

    stage('Auto Fix (Safe Upgrades)') {
      steps {
        sh 'npm audit fix || true' // Attempts safe fixes
      }
    }
    
    stage("dependency scanning"){
     parallel {
        stage('npm dependency audit') {
                steps {
                  // --no-audit: skip only the audit step during that install.
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
    stage("unit testing"){
      steps{
        sh 'npm test'
      }
    }


  }
}
