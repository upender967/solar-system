pipeline{
  agent any
    tool name: 'Node 24.4.0', type: 'nodejs'

  stages{
    stage('VM NOde version') {
      steps{
        sh '''
            node -v
            npm -v
        '''
         }
    }
   }
}


