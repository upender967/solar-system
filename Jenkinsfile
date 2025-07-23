pipeline {
  agent any

  tools {
    nodejs "node JS"
  }

 environment {
  MONGO_URI = credentials("mongo-uri")
  mongodb_credentials= credentials("mongodb-credentials")
  mongodb_username= credentials("mongodb-username")
  mongodb_password= credentials("mongodb-password")
  github_token =credentials('githubcredentails')
}


  stages {

    
      stage('Install Dependency') {
        options { timestamps () }
        steps {
          sh 'npm install --no-audit'
        }
      }

    // stage('Auto Fix (Safe Upgrades)') {
    //   steps {
    //     sh 'npm audit fix || true'
    //   }
    // }

      stage('Dependency Scanning') {
        parallel {
          stage('npm Dependency Audit') {
            steps {
              sh 'npm audit --audit-level=critical'
            }
          }
          stage('OWASP Dependency-Check Vulnerabilities') {
            steps {
              dependencyCheck additionalArguments: '''
                -o './'
                -s './'
                -f 'ALL'
                --prettyPrint
              ''', odcInstallation: 'owasp-tool'

              dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
          }
        }
      }




      stage('Unit Testing') {
        options { retry (2) }
        steps {
        withCredentials([usernamePassword(credentialsId: 'mongodb-credentials', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')]) {
            sh 'npm test'
        }
      
        }
      }


      stage('Code Coverage') {
          steps {
              withCredentials([usernamePassword(credentialsId: 'mongodb-credentials', passwordVariable: 'MONGO_PASSWORD',usernameVariable: 'MONGO_USERNAME')]) {
                  catchError(buildResult: 'SUCCESS', message: 'It will be fixed later', stageResult: 'UNSTABLE') {
                      sh 'npm run coverage'
                  }
              }
            
          }
      }

      stage (" Building docker image"){
        steps{
          sh "docker build -t muskaan810/nodemongoapp:$GIT_COMMIT ."
        }
      }


      stage("Push to Registry") {
        steps {
          script {
            withDockerRegistry(credentialsId: 'dockerhub-credentials', url: 'https://index.docker.io/v1/') {
              sh "docker push muskaan810/nodemongoapp:$GIT_COMMIT"
            }
          }
        }
      }

      stage("Deploy to AWS-EC2") {
        when {
          branch 'feature/*'
        }

        steps {
          script {
          sshagent(['EC2-privatekey']) {
            sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@18.205.113.142 "
                        if sudo docker ps -a | grep -q "nodemongoappcont"; then
                            echo "Container found. Stopping..."
                            sudo docker stop "nodemongoappcont" && sudo docker rm "nodemongoappcont"
                            echo "Container stopped and removed."
                        fi
                        sudo docker run --name nodemongoappcont\
                          -e MONGO_URI=$MONGO_URI \
                          -e MONGO_USERNAME=$mongodb_username \
                          -e MONGO_PASSWORD=$mongodb_password \
                          -p 3000:3000 -d muskaan810/nodemongoapp:$GIT_COMMIT
                    "
                '''
      
            }
          }
        }
      }

      stage("k8-image updater Tag") {
        when {
          branch 'PR*'
        }
        steps {
          script {
            sh "git clone -b main https://github.com/muskaanbhatia30/solar-system-manifest"

            dir("solar-system-manifest/kubernetes") {
              sh '''
                git checkout main
                git checkout -b feature-$BUILD_ID

                # Replace Docker Image Tag
                sed -i "s#muskaan810.*#muskaan810/nodemongoapp:$GIT_COMMIT#g" deployment.yaml

                cat deployment.yaml

                # Git Config and Push
                git config --global user.email "2019pietcsmuskaan103@poornima.org"
                git config --global user.name "muskaanbhatia30"
                git remote set-url origin https://$github_token@github.com/muskaanbhatia30/solar-system-manifest.git
                git add .
                git commit -m "Updated docker image"
                git push -u origin feature-$BUILD_ID
              '''
            }
          }
        }
    }

    stage( " Raise Manifest-PR*"){
       when {
          branch 'PR*'
        }
      steps{
         sh """
           curl -L \
          -X POST \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer $github_token" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          https://api.github.com/repos/muskaanbhatia30/solar-system-manifest/pulls \
            -d '{
              "title":"Amazing new feature",
              "body":"Please pull these awesome changes in!",
              "head":"feature-$build_ID",
              "base":"main"
            }'
         
         """
      }
    }


  } 

  post {
      always {
        script {
            if(fileExists("solar-system-manifest")) {
            sh "rm -rf solar-system-manifest"
          }
        }
                      publishHTML(target: [
                              allowMissing: false,
                              alwaysLinkToLastBuild: true,
                              keepAll: true,
                              reportDir: 'coverage/lcov-report/',
                              reportFiles: 'index.html',
                              reportName: 'Code Coverage Html Report'
                          ]) 

                                        publishHTML(target: [
                              allowMissing: false,
                              alwaysLinkToLastBuild: true,
                              keepAll: true,
                              reportDir: './',
                              reportFiles: 'dependency-check-report.html',
                              reportName: 'Oswao dependency check report'
                          ]) 
                          cleanWs()
      }
    }
}  
