pipeline {
  agent any

  tools {

    nodejs "node JS"
  }


  stages {

    stage("dependency scanning"){
     parallel {
        stage('install dependency') {
                steps {
                  // --no-audit: skip only the audit step during that install.
                  sh 'node install --no-audit'
                }
        }
        stage('OWASP Dependency-Check Vulnerabilities') {
                steps {
                  dependencyCheck additionalArguments: '''
                    -o './'
                    -s './'
                    -f 'ALL'
                    --prettyPrint
                  ''', odcInstallation: 'OWASP Dependency-Check Vulnerabilities'

                  dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                }
        }
     }
    }
    
  }
}
