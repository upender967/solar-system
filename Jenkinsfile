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
                        dependencyCheck additionalArguments: '''--scan \'./\' \\
                        --out \'./\' \\
                        --format \'ALL\' \\
                        --prettyPrint''', odcInstallation: 'OWASP-Dependency-Check-10'
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
}
