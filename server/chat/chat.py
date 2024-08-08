from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_pymongo import PyMongo
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline
from flask_cors import CORS
import torch

# Flask 애플리케이션 설정
app = Flask(__name__)
CORS(app)


app.config['SECRET_KEY'] = 'yswchat'
app.config["MONGO_URI"] = "mongodb://localhost:27017/chatDB"  # MongoDB URI 설정
socketio = SocketIO(app, cors_allowed_origins="*")  # CORS 허용 설정
mongo = PyMongo(app)

# 비속어 탐지 모델 로드
model_name = 'smilegate-ai/kor_unsmile'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
device = 0 if torch.cuda.is_available() else -1  # GPU 사용 가능 여부 확인
pipe = TextClassificationPipeline(
    model=model,
    tokenizer=tokenizer,
    device=device,
    return_all_scores=True,
    function_to_apply='sigmoid'
)

# 이전 채팅 메시지 가져오기
@app.route('/api/get_chats', methods=['GET'])
def get_chats():
    try:
        # MongoDB에서 모든 채팅 메시지를 가져와 JSON으로 반환 (최신 순으로 정렬)
        chats = mongo.db.chats.find().sort('timestamp')
        return jsonify([{
            'username': chat['username'],
            'msg': chat['message']
            #'timestamp': chat['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
            #'is_offensive': chat['is_offensive'],
            #'offensive_score': chat['offensive_score']
        } for chat in chats])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 사용자별 채팅 내역 조회
@app.route('/api/get_user_chats/<username>', methods=['GET'])
def get_user_chats(username):
    try:
        # MongoDB에서 특정 사용자(username)의 채팅 메시지를 가져와 JSON으로 반환
        chats = mongo.db.chats.find({'username': username}).sort('timestamp', -1)
        return jsonify([{
            'username': chat['username'],
            'msg': chat['message'],
            'timestamp': chat['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
            'is_offensive': chat['is_offensive'],
            'offensive_score': chat['offensive_score']
        } for chat in chats])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 소켓 이벤트 처리
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(data):
    try:
        # 클라이언트에서 전달받은 인증 정보에서 username을 추출합니다
        username = data.get('username')
        if not username:
            emit('message', {'error': 'Username is required'}, broadcast=False)
            return

        # 메시지를 비속어 탐지 모델로 분석
        result = pipe(data['msg'])[0]
        max_label = max(result, key=lambda x: x['score'])

        # 비속어 여부 및 확률
        is_offensive = max_label['label']
        offensive_score = max_label['score'] * 100  # 확률을 백분율로 변환

        # 현재 시간을 가져와서 ISO 포맷으로 변환
        timestamp = datetime.utcnow()

        # 메시지를 MongoDB에 저장
        mongo.db.chats.insert_one({
            'username': username,
            'message': data['msg'],
            'timestamp': timestamp,
            'is_offensive': is_offensive,
            'offensive_score': offensive_score
        })

        # 클라이언트에게 메시지와 시간, 비속어 여부 및 확률 전송
        emit('message', {
            'username': username,
            'msg': data['msg'],
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'is_offensive': is_offensive,
            'offensive_score': offensive_score
        }, broadcast=True)
    except Exception as e:
        print(f"Error handling message: {e}")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
