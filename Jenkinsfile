pipeline {
    agent any

    tools {
        nodejs 'nodejs-24-9-0'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }

        stage('Dependency Scanning') {
            parallel {
                stage('NPM Dependency Audit') {
                    steps {
                        sh '''
                            set +e
                            npm audit --audit-level=critical
                            echo "npm audit exit code: $?"
                            set -e
                        '''
                    }
                }

                stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck(
                            additionalArguments: '''
                                --scan ./ \
                                --out ./ \
                                --format \'ALL\'
                                --prettyPrint
                                --disableYarnAudit
                            ''',
                            odcInstallation: 'OWASP-DepCheck-10'
                        )
                        dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true

                        publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'dependency-check-HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                    }
                }
            }
        }
    }
}

