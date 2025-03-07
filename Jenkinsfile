pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'  // The name configured in Global Tool Configuration
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
                                --scan './' \\
                                --out './dependency-check-report' \\
                                --format 'ALL' \\
                                --prettyPrint
                            ''', odcInstallation: 'OWASP-Dependency-Check'
                            
                            // Ensure report is generated before publishing
                            sh 'ls -R dependency-check-report'  // List files to verify report existence
                        }

                        // Publish HTML report for Dependency-Check (adjusting path)
                        publishHTML([
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'dependency-check-report', // Ensure this matches the correct path
                            reportFiles: 'dependency-check-report.html', // Ensure this file exists
                            reportName: 'Dependency-Check Report'
                        ])

                        // Publish assets (if any) from tests or other reports
                        publishGiteaAssets assets: '$WORKSPACE/**/TEST-*.xml', followSymlinks: false
                        
                        // Publish Dependency Check Publisher report
                        dependencyCheckPublisher failedTotalCritical: 1, pattern: '$WORKSPACE/**/TEST-*.xml', stopBuild: true
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

        stage('Generate OWASP Dependency Check Report') {
            steps {
                script {
                    // Ensure that if OWASP Dependency Check didn't generate reports earlier,
                    // we force it to run here (just in case).
                    dependencyCheck additionalArguments: '''
                        --scan './' \\
                        --out './dependency-check-report' \\
                        --format 'ALL' \\
                        --prettyPrint
                    ''', odcInstallation: 'OWASP-Dependency-Check'

                    // Print the directory content for debugging
                    sh 'ls -R dependency-check-report'
                }
            }
        }
    }

    post {
        always {
            // Archive Dependency-Check report (adjust path if needed)
            archiveArtifacts 'dependency-check-report/*.html'

            // Publish the Dependency-Check report as HTML
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'dependency-check-report', // Path where report is saved
                reportFiles: 'dependency-check-report.html', // Ensure this is the correct file
                reportName: 'Dependency-Check Report'
            ])
        }
    }
}
