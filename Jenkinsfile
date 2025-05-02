pipeline {
    agent any

    environment {
        IMAGE_NAME = 'chris4929/yswchat'
        DOCKERHUB_CREDENTIALS = 'dockerhub-credential'  // Jenkins에 등록한 DockerHub 자격증명 ID
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/yoo-chris/yswchat2.git', credentialsId: 'github-credentials-id'
            }
        }

        stage('Project Build & Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            docker build -t ${IMAGE_NAME}:front ./front
                            docker push ${IMAGE_NAME}:front

                            docker build -t ${IMAGE_NAME}:chat ./server/chat
                            docker push ${IMAGE_NAME}:chat

                            docker build -t ${IMAGE_NAME}:signin ./server/signin
                            docker push ${IMAGE_NAME}:signin

                            docker build -t ${IMAGE_NAME}:signup ./server/signup
                            docker push ${IMAGE_NAME}:signup
                        '''
                    }
                }
            }
        }
    }
}
