pipeline {
    agent any

    environment {
        IMAGE_NAME = 'chris4929/yswchat'
        DOCKERHUB_CREDENTIALS = 'dockerhub-credential'
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/yoo-chris/yswchat2.git', credentialsId: 'github-credentials-id'
            }
        }

        stage('Front Build & Push') {
            steps {
                script {
                    docker.withRegistry('', DOCKERHUB_CREDENTIALS) {
                        sh 'docker build -t $IMAGE_NAME:front ./front'
                        sh 'docker push $IMAGE_NAME:front'
                    }
                }
            }
        }
    }
}