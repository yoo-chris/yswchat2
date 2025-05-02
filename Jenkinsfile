pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/yoo-chris/yswchat2.git', credentialsId: 'github-credentials-id'
            }
        }
    }
}