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
                        dependencyCheck additionalArguments: '''
                                            --scan './' \\
                                            --out './' \\
                                            --format 'ALL' \\
                                            --prettyPrint''', odcInstallation: 'OWASP-Dependency-Check'
                        publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: '$WORKSPACE/reports/html', reportFiles: 'index.html', reportName: 'HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                        publishGiteaAssets assets: '$WORKSPACE/**/TEST-*.xml', followSymlinks: false
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
    }

    post {
        always {
            // Archive Dependency-Check report
            archiveArtifacts 'dependency-check-report/*.html'
            
            // Publish HTML report for Dependency-Check
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'dependency-check-report',
                reportFiles: 'dependency-check-report.html',
                reportName: 'Dependency-Check Report'
            ])
        }
    }
}
