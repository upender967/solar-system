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
                    sh 'mkdir -p dependency-check-data'  // Ensure the directory exists
                }
            }
        }

        stage('Security Checks') {
            parallel {
                stage('Dependency Check (OWASP 10)') {
                    steps {
                        script {
                            dependencyCheck additionalArguments: """
                                --scan ./node_modules 
                                --out ./dependency-check-report 
                                --format ALL 
                                --prettyPrint
                                --data ./dependency-check-data  // Cache database
                                --disableAssembly  
                                --disableJar  
                                
                            """, odcInstallation: 'OWASP-Dependency-Check'
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
}

