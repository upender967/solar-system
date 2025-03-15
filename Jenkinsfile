pipeline {
    agent any

    tools {
        nodejs 'NodeJS 23.9.0'
    }

    environment {
        MONGO_URI = "mongodb://10.0.2.15:27017"
        MONGO_USERNAME = credentials('user_name')
        MONGO_PASSWORD = credentials('db-password')
        SONAR_SCANNER_HOME = tool('SonarQube-Scanner-7.04')
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
                            dependencyCheck additionalArguments: "--scan ./src --out ./ --format HTML --disableAssembly --disableJar", 
                                odcInstallation: 'OWASP-Dependency-Check'
                            dependencyCheckPublisher failedTotalCritical: 1, stopBuild: true
                        }
                    }
                }

                stage('NPM Audit (Critical)') {
                    options {
                        timestamps()
                    }
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
                timeout(time: 1, unit: 'MINUTES') {
                    script {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Coverage Tests') {
            steps {
                script {
                    echo "Checking coverage report files..."
                    sh 'ls -R coverage'
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                        sh 'npm run coverage'
                    }
                }
            }
        }

        stage('Run SonarQube Analysis') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        $SONAR_SCANNER_HOME/bin/sonar-scanner \
                            -Dsonar.organization=khaled-projects \
                            -Dsonar.projectKey=khaled-projects_jenkins-pipeline \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=https://sonarcloud.io \
                            -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Publishing HTML Report..."
            junit allowEmptyResults: true, testResults: 'test-result.xml'
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: true, icon: '', keepAll: false, 
                         reportDir: 'coverage/lcov-report/', reportFiles: 'index.html', 
                         reportName: 'Coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}
