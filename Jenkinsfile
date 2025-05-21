pipeline {

    agent any

    tools {
        nodejs 'node-22-15-1'
    }

    environment {
        NVD_API_KEY = credentials('nvd-api-key')
    }

    parameters {
        string(
            name: 'ODC_INSTALLATION',
            defaultValue: 'OWASP-DEP-CHECK-12-1-1',
            description: 'OWASP Dependency Check installation to use'
        )
        string(
            name: 'REPORTS_DIR',
            defaultValue: 'dependency-check-reports',
            description: 'Directory to store dependency check reports'
        )
        string(
            name: 'REPORT_FILE',
            defaultValue: 'dependency-check-report.xml',
            description: 'Name of the dependency check report file'
        )
        string(
            name: 'JUNIT_FILE',
            defaultValue: 'dependency-check-junit.xml',
            description: 'Name of the dependency check junit file'
        )
        string(
            name: 'FAILED_TOTAL_CRITICAL',
            defaultValue: '1',
            description: 'Number of critical vulnerabilities to fail the build'
        )
    }

    stages {
        stage('VM Node Version') {
            steps {
                sh '''
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }

        stage('Security Checks') {
            parallel {
                stage('NPM Dependency Audit') {
                    steps {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh 'npm audit --audit-level=critical'
                        }
                    }
                }

                stage('OWASP Dependency Check') {
                    steps {
                        sh "mkdir -p ${params.REPORTS_DIR}"

                        script {
                            def arguments = [
                                '--scan ./',
                                '--project "Solar System App"',
                                '--format "ALL"',
                                "--out ./${params.REPORTS_DIR}",
                                '--nvdApiKey ${NVD_API_KEY}',
                                '--failOnCVSS 7',
                                '--nvdValidForHours 24'
                            ].join(' ')

                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                dependencyCheck(
                                    additionalArguments: arguments,
                                    odcInstallation: params.ODC_INSTALLATION
                                )
                            }
                        }

                        dependencyCheckPublisher(
                            pattern: "${params.REPORTS_DIR}/${params.REPORT_FILE}",
                            failedTotalCritical: params.FAILED_TOTAL_CRITICAL.toInteger()
                        )

                        script {
                            if (fileExists("${params.REPORTS_DIR}/${params.JUNIT_FILE}")) {
                                echo "JUnit file found, attempting to process..."
                                junit(
                                    allowEmptyResults: true,
                                    keepLongStdio: true,
                                    testResults: "${params.REPORTS_DIR}/${params.JUNIT_FILE}"
                                )
                            } else {
                                echo "WARNING: JUnit file not found at ${params.REPORTS_DIR}/${params.JUNIT_FILE}"
                                sh "ls -la ${params.REPORTS_DIR}/"
                            }
                        }

                        publishHTML([
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            icon: '',
                            keepAll: true,
                            reportDir: "./${params.REPORTS_DIR}",
                            reportFiles: 'dependency-check-report.html',
                            reportName: 'OWASP Dependency Report HTML',
                            reportTitles: '', useWrapperFileDirectly: true
                        ])
                    }
                }
            }
        }

        stage('Unit Test') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        success {
            echo "Security checks completed successfully"
        }
        unstable {
            echo "Security checks found vulnerabilities"
        }
        failure {
            echo "Security checks failed to complete"
        }
        always {
            sh 'docker compose down -v --remove-orphans || true'
            sh 'docker system prune -af --volumes || true'

            archiveArtifacts(
                artifacts: "${params.REPORTS_DIR}/**",
                allowEmptyArchive: true
            )
        }
    }
}
