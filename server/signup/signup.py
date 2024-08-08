from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

############# Database #################
app.secret_key = 'yswchat'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'test123'
app.config['MYSQL_DB'] = 'login'
mysql = MySQL(app)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    userRole = data.get('userRole', 'user')  # 기본값을 'user'로 설정


    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM member WHERE email = %s', (email, ))
    user = cursor.fetchone()

    if user:
        msg = "이미 존재하는 계정입니다."
    else:
        cursor.execute(
                'INSERT INTO member (username, email, password, userRole) VALUES (%s, %s, %s, %s)',
                (username, email, password, userRole)
            )
        mysql.connection.commit()
        msg = '!!회원가입 성공!!'
        return jsonify({"msg": msg})
    
    return jsonify({"msg": msg})

if __name__ == '__main__':
    app.run(port=5011)
