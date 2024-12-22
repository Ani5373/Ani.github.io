from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import mysql.connector
import re

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 设置一个密钥用于会话

# 数据库连接配置
db_config = {
    'user': 'root',
    'password': '20040406lihao',
    'host': 'localhost',
    'database': 'bda'
}

# 数据库初始化
def init_db():
    conn = mysql.connector.connect(**db_config)#数据库连接
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS schedule (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            date DATE,
            event VARCHAR(255),
            created_at DATE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diary (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            date DATE,
            content TEXT,
            created_at DATE
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

# 主页重定向到管理员登录页面
@app.route('/')
def index():
    return render_template('index.html')

# 管理员登录页面
@app.route('/admin_login', methods=['GET', 'POST'])#管理员登录页面
def admin_login():#管理员登录函数
    if request.method == 'POST':#如果请求方法是POST
        username = request.form['username']#获取用户名
        password = request.form['password']#获取密码
        
        conn = mysql.connector.connect(**db_config)#连接数据库
        cursor = conn.cursor(dictionary=True)#创建游标
        
        cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))#查询用户名和密码
        user = cursor.fetchone()#获取查询结果
        
        cursor.close()#关闭游标
        conn.close()#关闭连接
        
        if user:#如果用户存在   
            session['user_id'] = 1 if user['is_admin'] == 1 else 0#设置用户ID
            session['is_admin'] = user['is_admin']#设置管理员状态
            session['username'] = user['username']  # 存储用户名
            return redirect(url_for('index'))#重定向到主页
        else:#如果用户不存在
            return render_template('admin_login.html', error='用户名或者密码错误')#返回登录页面，并显示错误信息
    
    return render_template('admin_login.html')


# 注册页面
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password'] 

        # 检查密码格式
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$', password):
            return render_template('register.html', error='密码必须是8-16位的字母加数字')

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # 检查用户名是否已存在
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        if user:    
            cursor.close()
            conn.close()
            return render_template('register.html', error='用户名已存在')

        # 获取当前最大is_admin值
        cursor.execute('SELECT MAX(is_admin) AS max_admin FROM users')
        max_admin = cursor.fetchone()['max_admin']
        new_is_admin = (max_admin or 0) + 1

        # 插入新用户
        cursor.execute('INSERT INTO users (username, password, is_admin) VALUES (%s, %s, %s)', (username, password, new_is_admin))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for('admin_login'))

    return render_template('register.html')

# 注销
@app.route('/logout')
def logout():
    session.clear()  # 清除会话
    return redirect(url_for('index'))  # 重定向到主页

# 主页
@app.route('/home')
def home():
    return render_template('index.html')

# 获取日程
@app.route('/get_schedules', methods=['GET'])
def get_schedules():
    if 'user_id' not in session:
        return jsonify({'error': '用户未登录'}), 401

    user_id = session['user_id']
    conn = mysql.connector.connect(**db_config)#连接数据库
    cursor = conn.cursor(dictionary=True)#创建游标
    cursor.execute('SELECT * FROM schedule WHERE user_id = %s ORDER BY date, id', (user_id,))#查询日程
    schedules = cursor.fetchall()#获取日程  
    cursor.close()
    conn.close()
    return jsonify(schedules)#返回日程

# 获取日记  
@app.route('/get_diaries', methods=['GET'])
def get_diaries():
    if 'user_id' not in session:
        return jsonify({'error': '用户未登录'}), 401

    user_id = session['user_id']
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM diary WHERE user_id = %s ORDER BY date, id', (user_id,))
    diaries = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(diaries)

# 添加日程  
@app.route('/add_schedule', methods=['POST'])
def add_schedule():
    if 'user_id' not in session:#如果用户未登录
        return jsonify({'error': '用户未登录'}), 401

    #提取flask请求中的数据  
    data = request.json
    user_id = session['user_id']
    date = data['date']
    event = data['event']
    created_at = data['created_at']
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO schedule (user_id, date, event, created_at) VALUES (%s, %s, %s, %s)', (user_id, date, event, created_at))
    conn.commit()
    
    # 创建响应对象
    response = jsonify({'message': '日程添加成功'})
    
    # 重新排序
    reorder_entries('schedule')
    
    # 返回响应
    return response

# 添加日记
@app.route('/add_diary', methods=['POST'])
def add_diary():
    if 'user_id' not in session:
        return jsonify({'error': '用户未登录'}), 401

    data = request.json
    user_id = session['user_id']
    date = data['date']
    content = data['content']
    created_at = data['created_at']
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO diary (user_id, date, content, created_at) VALUES (%s, %s, %s, %s)', (user_id, date, content, created_at))
    conn.commit()

    # 创建响应对象
    response = jsonify({'message': '日记添加成功'})
    
    # 重新排序
    reorder_entries('diary')
    
    # 返回响应
    return response


# 修改日程或日记
@app.route('/edit_<entry_type>', methods=['POST'])
def edit_entry(entry_type):
    data = request.json
    entry_id = data['id']
    new_value = data['newValue']
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    if entry_type == 'schedule':
        cursor.execute('UPDATE schedule SET event = %s WHERE id = %s', (new_value, entry_id))
    elif entry_type == 'diary':
        cursor.execute('UPDATE diary SET content = %s WHERE id = %s', (new_value, entry_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # 立即返回响应
    response = jsonify({'message': '修改成功'})
    
    return response

# 删除日程或日记
@app.route('/delete_<entry_type>', methods=['POST'])
def delete_entry(entry_type):
    data = request.json
    entry_id = data['id']
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    if entry_type == 'schedule':
        cursor.execute('DELETE FROM schedule WHERE id = %s', (entry_id,))
    elif entry_type == 'diary':
        cursor.execute('DELETE FROM diary WHERE id = %s', (entry_id,))


    conn.commit()
    cursor.close()
    conn.close()
    
    # 立即返回响应
    response = jsonify({'message': '删除成功'})
    
    # 重新排序（同步调用）
    if entry_type == 'schedule':
        reorder_entries('schedule')
    elif entry_type == 'diary':
        reorder_entries('diary')
    
    return response

# 重新排序日程和日记    排列次数多了总是在中间出错，干脆用事务，要么都对要么都错
def reorder_entries(table_name):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # 使用事务
    conn.start_transaction()#开始事务
    
    try:
        cursor.execute(f'SELECT id FROM {table_name} ORDER BY date, id')#查询id
        entries = cursor.fetchall()
        
        # 临时更新ID以避免冲突
        for new_id, (old_id,) in enumerate(entries, start=1):
            cursor.execute(f'UPDATE {table_name} SET id = %s WHERE id = %s', (-new_id, old_id))#更新id
        
        # 更新为新的ID
        for new_id, (old_id,) in enumerate(entries, start=1):
            cursor.execute(f'UPDATE {table_name} SET id = %s WHERE id = %s', (new_id, -new_id))#更新id
        
        conn.commit()#提交事务  
    except Exception as e:
        conn.rollback()#回滚事务
        print(f"重新排序出错: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)