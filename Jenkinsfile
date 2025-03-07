pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'  // The name configured in Global Tool Configuration
    }

    environment {
        // Define the directory for the dependency-check report
        REPORT_DIR = 'dependency-check-report'
    }

    stages {
        stage('Verify Node.js and NPM') {
            steps {
                script {
                    sh 'node -v'
                    sh 'npm -v'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install --no-audit'
                }
            }
        }

        stage('Security Checks') {
            parallel {
                stage('Dependency Check (OWASP 10)') {
                    steps {
                        script {
                            // Run OWASP Dependency Check
                            dependencyCheck additionalArguments: '''
                                --scan ./ 
                                --out ./${REPORT_DIR} 
                                --format ALL 
                                --prettyPrint
                            ''', odcInstallation: 'OWASP-Dependency-Check'
                            
                            // Ensure the report directory is created if not already present
                            sh 'mkdir -p $REPORT_DIR'
                            
                            // Publish the HTML report
                            publishHTML([ 
                                allowMissing: false, 
                                alwaysLinkToLastBuild: true, 
                                keepAll: true, 
                                reportDir: "$WORKSPACE/$REPORT_DIR", 
                                reportFiles: 'index.html', 
                                reportName: 'HTML Report' 
                            ])
                            
                            // Optional: Publish Dependency Check results (XML format)
                            publishGiteaAssets assets: '$WORKSPACE/**/TEST-*.xml', followSymlinks: false
                            dependencyCheckPublisher failedTotalCritical: 1, pattern: '$WORKSPACE/**/TEST-*.xml', stopBuild: true 
                        }
                    }
                }

                stage('NPM Audit (Critical)') {
                    steps {
                        script {
                            sh 'npm audit --audit-level=critical'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Archive Dependency-Check report
            archiveArtifacts '**/dependency-check-report/*.html'
            
            // Publish HTML report for Dependency-Check
            publishHTML([ 
                allowMissing: false, 
                alwaysLinkToLastBuild: true, 
                keepAll: true, 
                reportDir: "$WORKSPACE/$REPORT_DIR", 
                reportFiles: 'dependency-check-report.html', 
                reportName: 'Dependency-Check Report' 
            ])
        }
    }
}
