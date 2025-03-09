pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
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
                            dependencyCheck additionalArguments: """
                                --scan ./src  
                                --out ./dependency-check-report 
                                --format ALL 
                                --prettyPrint
                                --data ./dependency-check-data  
                                --disableAssembly  
                                --disableJar  
                            """, odcInstallation: 'OWASP-Dependency-Check'
                            dependencyCheckPublisher failedTotalCritical: 1, stopBuild: true
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

        stage('JUnit Tests') {
            steps {
                script {
                    // Running tests without generating JUnit reports
                    sh 'npm test'
                }
            }
        }

        stage('Publish JUnit Reports') {
            steps {
                script {
                    // Check if the reports directory exists, otherwise skip the publishing
                    if (fileExists('reports/junit-report.xml')) {
                        junit allowEmptyResults: true, testResults: 'reports/junit-report.xml'
                    } else {
                        echo 'No JUnit report generated. Skipping publishing.'
                    }
                }
            }
        }
    }
}
