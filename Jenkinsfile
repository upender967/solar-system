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
                    sh 'npm test -- --reporter=junit --reporter-options output=reports/junit-report.xml'
                }
            }
        }

        stage('Publish JUnit Reports') {
            steps {
                junit allowEmptyResults: true, testResults: 'reports/junit-report.xml'
            }
        }
    }
}
