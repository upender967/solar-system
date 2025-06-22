pipeline {
  agent any

  tools {

    nodejs "node JS"
  }




  stages {

      stage('install dependency') {
                steps {
                  // --no-audit: skip only the audit step during that install.
                  sh 'npm install --no-audit'
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
                  ''', odcInstallation: 'OWASP Dependency-Check Vulnerabilities'

                  dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                }
        }
     }
    }
    
  }
}
