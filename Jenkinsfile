pipeline {
    agent any // Use any available agent

    tools {
        nodejs 'nodejs-22-6-0' // Corrected tool name to 'nodejs'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                // Install npm dependencies without performing a security audit
                sh 'npm install --no-audit'
            }
        }

        stage('Dependency Scanning') {
            parallel {
                stage('NPM Dependencies Audit') {
                    steps {
                        // Perform npm audit for critical vulnerabilities
                        sh '''
                            npm audit --audit-level=critical
                        '''
                    }
                }

                stage('OWASP Dependency Check') {
                    steps {
                        // Run OWASP Dependency Check with specified arguments
                        dependencyCheck additionalArguments: '''
                            --scan './'                             
                            --out './'                          
                            --format 'ALL'                        
                            --PRETTYPrint
                        ''', odcInstallation: 'Owasp-DepCheck-10'
                        dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
                        
                        junit allowEmptyResult: true, stdioRetention: '', testResults: 'dependency-check-junit.xml'

                        publishHTML([
                                allowMissing: true, 
                                alwaysLinkToLastBuild: true, 
                                keepAll: true, 
                                reportDir: './', 
                                reportFiles: 'dependency-check-jenkins.html', 
                                reportName: 'Dependency Check HTML Report', 
                                reportTitles: '', 
                                useWrapperFileDirectly: true
                            ])
                    }
                }
            }
        }
    }
}
