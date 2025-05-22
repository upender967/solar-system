pipeline {

    agent any

    tools {
        nodejs 'node-22-15-1'
    }

    environment {
        NVD_API_KEY = credentials('nvd-api-key')
    }

    options {
        disableResume()
        disableConcurrentBuilds abortPrevious: true
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
        string(
            name: 'CODE_COVERAGE_REPORTS_DIR',
            defaultValue: 'coverage/lcov-report',
            description: 'Directory to store code coverage reports'
        )
        string(
            name: 'CODE_COVERAGE_HTML_REPORT_FILE',
            defaultValue: 'index.html',
            description: 'Name of the code coverage html report file'
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
            options {
                timestamps()
            }

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

        stage('Setup App ENV') {
            steps {
                script {
                    // Create .env file with values from Jenkins credentials
                    withCredentials([
                        string(credentialsId: 'mongo-database', variable: 'MONGO_DATABASE'),
                        string(credentialsId: 'mongo-root-username', variable: 'MONGO_ROOT_USERNAME'),
                        string(credentialsId: 'mongo-root-password', variable: 'MONGO_ROOT_PASSWORD'),
                        string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
                        string(credentialsId: 'mongo-username', variable: 'MONGO_USERNAME'),
                        string(credentialsId: 'mongo-password', variable: 'MONGO_PASSWORD')
                    ]) {
                            writeFile file: '.env', text: """# MongoDB Configuration
                                MONGO_INITDB_DATABASE=${MONGO_DATABASE}
                                MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
                                MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}

                                # Node.js Application Configuration
                                MONGO_URI=${MONGO_URI}
                                MONGO_USERNAME=${MONGO_USERNAME}
                                MONGO_PASSWORD=${MONGO_PASSWORD}
                                NODE_ENV=development
                                PORT=3001

                                # Port Configuration
                                MONGO_PORT=27017
                                """
                    }
                }
            }
        }

        stage('Unit Test') {
            options {
                retry(3)
            }

            steps {
                sh 'npm test'
            }
        }

        stage('Run Code Coverage') {
            steps {
                catchError(buildResult: 'UNSTABLE', message: 'Ops! It will be fixed in future release') {
                    sh 'npm run coverage'
                }

                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    icon: '',
                    keepAll: true,
                    reportDir: "./${params.CODE_COVERAGE_REPORTS_DIR}",
                    reportFiles: "${params.CODE_COVERAGE_HTML_REPORT_FILE}",
                    reportName: 'Code Coverage Report HTML',
                    reportTitles: '', useWrapperFileDirectly: true
                ])
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
            archiveArtifacts(
                artifacts: "${params.REPORTS_DIR}/**",
                allowEmptyArchive: true
            )

            // Clean up .env file for security
            script {
                if (fileExists('.env')) {
                    sh 'rm -f .env'
                }
            }
        }
    }
}
