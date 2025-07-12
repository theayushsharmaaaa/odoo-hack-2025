from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
import os
from datetime import datetime
import uuid

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Database initialization
def init_db():
    conn = sqlite3.connect('skillswap.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            location TEXT,
            profile_photo TEXT,
            is_public INTEGER DEFAULT 1,
            availability TEXT,
            is_admin INTEGER DEFAULT 0,
            is_banned INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Skills table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill_name TEXT NOT NULL,
            skill_type TEXT NOT NULL, -- 'offered' or 'wanted'
            description TEXT,
            is_approved INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Swap requests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS swap_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requester_id INTEGER,
            provider_id INTEGER,
            offered_skill_id INTEGER,
            requested_skill_id INTEGER,
            status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (requester_id) REFERENCES users (id),
            FOREIGN KEY (provider_id) REFERENCES users (id),
            FOREIGN KEY (offered_skill_id) REFERENCES skills (id),
            FOREIGN KEY (requested_skill_id) REFERENCES skills (id)
        )
    ''')
    
    # Ratings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            swap_id INTEGER,
            rater_id INTEGER,
            rated_id INTEGER,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (swap_id) REFERENCES swap_requests (id),
            FOREIGN KEY (rater_id) REFERENCES users (id),
            FOREIGN KEY (rated_id) REFERENCES users (id)
        )
    ''')
    
    # Admin messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create admin user if doesn't exist
    cursor.execute('SELECT * FROM users WHERE username = ?', ('admin',))
    if not cursor.fetchone():
        admin_hash = generate_password_hash('admin123')
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, is_admin)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@skillswap.com', admin_hash, 'Administrator', 1))
    
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect('skillswap.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        location = data.get('location', '')
        
        if not all([username, email, password, full_name]):
            return jsonify({'error': 'All required fields must be filled'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Create user
        password_hash = generate_password_hash(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, location)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, email, password_hash, full_name, location))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Registration successful'}), 201
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            if user['is_banned']:
                return jsonify({'error': 'Account is banned'}), 403
            
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin']
            
            return jsonify({'message': 'Login successful', 'redirect': url_for('dashboard')}), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if session.get('is_admin'):
        return redirect(url_for('admin_dashboard'))
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get user's skills
    cursor.execute('''
        SELECT * FROM skills WHERE user_id = ? AND is_approved = 1
    ''', (session['user_id'],))
    skills = cursor.fetchall()
    
    # Get pending swap requests
    cursor.execute('''
        SELECT sr.*, u.full_name as requester_name, s1.skill_name as offered_skill, s2.skill_name as requested_skill
        FROM swap_requests sr
        JOIN users u ON sr.requester_id = u.id
        JOIN skills s1 ON sr.offered_skill_id = s1.id
        JOIN skills s2 ON sr.requested_skill_id = s2.id
        WHERE sr.provider_id = ? AND sr.status = 'pending'
    ''', (session['user_id'],))
    pending_requests = cursor.fetchall()
    
    # Get user's sent requests
    cursor.execute('''
        SELECT sr.*, u.full_name as provider_name, s1.skill_name as offered_skill, s2.skill_name as requested_skill
        FROM swap_requests sr
        JOIN users u ON sr.provider_id = u.id
        JOIN skills s1 ON sr.offered_skill_id = s1.id
        JOIN skills s2 ON sr.requested_skill_id = s2.id
        WHERE sr.requester_id = ?
    ''', (session['user_id'],))
    sent_requests = cursor.fetchall()
    
    conn.close()
    
    return render_template('dashboard.html', skills=skills, pending_requests=pending_requests, sent_requests=sent_requests)

# @app.route('/profile')
# def profile():
#     if 'user_id' not in session:
#         return redirect(url_for('login'))
    
#     conn = get_db()
#     cursor = conn.cursor()
#     cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
#     user = cursor.fetchone()
#     conn.close()
    
#     return render_template('profile.html', user=user)



@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
    user = cursor.fetchone()

    # 👇 ADD this block to provide user_stats
    cursor.execute('''
        SELECT 
            (SELECT COUNT(*) FROM skills WHERE user_id = ?) as total_skills,
            (SELECT COUNT(*) FROM swap_requests WHERE requester_id = ?) as total_requests,
            (SELECT COUNT(*) FROM ratings WHERE rated_id = ?) as total_reviews
    ''', (user['id'], user['id'], user['id']))
    user_stats = cursor.fetchone()

    conn.close()

    return render_template('profile.html', user=user, user_stats=user_stats)

@app.route('/browse')
def browse():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    skill_filter = request.args.get('skill', '')
    conn = get_db()
    cursor = conn.cursor()

    query = '''
        SELECT DISTINCT u.id, u.full_name, u.location, u.profile_photo, 
               GROUP_CONCAT(s.skill_name) as skills
        FROM users u
        JOIN skills s ON u.id = s.user_id
        WHERE u.is_public = 1 AND u.is_banned = 0 AND s.skill_type = 'offered' AND s.is_approved = 1
    '''
    params = []

    # Optional: exclude current user
    if session.get('user_id'):
        query += ' AND u.id != ?'
        params.append(session['user_id'])

    if skill_filter:
        query += ' AND s.skill_name LIKE ?'
        params.append(f'%{skill_filter}%')

    query += ' GROUP BY u.id'

    cursor.execute(query, params)
    users = cursor.fetchall()
    conn.close()

    print('Users returned to browse:', [dict(u) for u in users])  # ✅ Safe now
    return render_template('browse.html', users=users, skill_filter=skill_filter)


# @app.route('/browse')
# def browse():
#     print('Users returned to browse:', [dict(u) for u in users])

#     if 'user_id' not in session:
#         return redirect(url_for('login'))
    
#     skill_filter = request.args.get('skill', '')
    
#     conn = get_db()
#     cursor = conn.cursor()
    
#     query = '''
#         SELECT DISTINCT u.id, u.full_name, u.location, u.profile_photo, 
#                GROUP_CONCAT(s.skill_name) as skills
#         FROM users u
#         JOIN skills s ON u.id = s.user_id
#         WHERE u.is_public = 1 AND u.is_banned = 0 AND u.id != ? AND s.skill_type = 'offered' AND s.is_approved = 1
#     '''
#     params = [session['user_id']]
    
#     if skill_filter:
#         query += ' AND s.skill_name LIKE ?'
#         params.append(f'%{skill_filter}%')
    
#     query += ' GROUP BY u.id'
    
#     cursor.execute(query, params)
#     users = cursor.fetchall()
#     conn.close()
    
#     return render_template('browse.html', users=users, skill_filter=skill_filter)

@app.route('/admin')
def admin_dashboard():
    if 'user_id' not in session or not session.get('is_admin'):
        return redirect(url_for('login'))
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get stats
    cursor.execute('SELECT COUNT(*) as total_users FROM users WHERE is_admin = 0')
    total_users = cursor.fetchone()['total_users']
    
    cursor.execute('SELECT COUNT(*) as total_swaps FROM swap_requests')
    total_swaps = cursor.fetchone()['total_swaps']
    
    cursor.execute('SELECT COUNT(*) as pending_swaps FROM swap_requests WHERE status = "pending"')
    pending_swaps = cursor.fetchone()['pending_swaps']
    
    # Get recent activity
    cursor.execute('''
        SELECT sr.*, u1.full_name as requester, u2.full_name as provider
        FROM swap_requests sr
        JOIN users u1 ON sr.requester_id = u1.id
        JOIN users u2 ON sr.provider_id = u2.id
        ORDER BY sr.created_at DESC LIMIT 10
    ''')
    recent_swaps = cursor.fetchall()
    
    # Get unapproved skills
    cursor.execute('''
        SELECT s.*, u.full_name as user_name
        FROM skills s
        JOIN users u ON s.user_id = u.id
        WHERE s.is_approved = 0
    ''')
    unapproved_skills = cursor.fetchall()
    
    conn.close()
    
    return render_template('admin.html', 
                         total_users=total_users,
                         total_swaps=total_swaps,
                         pending_swaps=pending_swaps,
                         recent_swaps=recent_swaps,
                         unapproved_skills=unapproved_skills)

# API Routes
@app.route('/api/skills', methods=['GET', 'POST'])
def api_skills():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.get_json()
        skill_name = data.get('skill_name')
        skill_type = data.get('skill_type')
        description = data.get('description', '')
        
        if not skill_name or skill_type not in ['offered', 'wanted']:
            return jsonify({'error': 'Invalid skill data'}), 400
        
        cursor.execute('''
            INSERT INTO skills (user_id, skill_name, skill_type, description)
            VALUES (?, ?, ?, ?)
        ''', (session['user_id'], skill_name, skill_type, description))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Skill added successfully'}), 201
    
    # GET request
    cursor.execute('SELECT * FROM skills WHERE user_id = ?', (session['user_id'],))
    skills = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(skills)

@app.route('/api/swap-request', methods=['POST'])
def api_swap_request():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    provider_id = data.get('provider_id')
    offered_skill_id = data.get('offered_skill_id')
    requested_skill_id = data.get('requested_skill_id')
    message = data.get('message', '')
    
    if not all([provider_id, offered_skill_id, requested_skill_id]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO swap_requests (requester_id, provider_id, offered_skill_id, requested_skill_id, message)
        VALUES (?, ?, ?, ?, ?)
    ''', (session['user_id'], provider_id, offered_skill_id, requested_skill_id, message))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Swap request sent successfully'}), 201

@app.route('/api/swap-request/<int:request_id>', methods=['PUT', 'DELETE'])
def api_swap_request_action(request_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'DELETE':
        cursor.execute('''
            DELETE FROM swap_requests 
            WHERE id = ? AND requester_id = ? AND status = 'pending'
        ''', (request_id, session['user_id']))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Request not found or cannot be deleted'}), 404
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Request deleted successfully'})
    
    # PUT request - accept/reject
    data = request.get_json()
    action = data.get('action')
    
    if action not in ['accept', 'reject']:
        return jsonify({'error': 'Invalid action'}), 400
    
    status = 'accepted' if action == 'accept' else 'rejected'
    
    cursor.execute('''
        UPDATE swap_requests 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND provider_id = ? AND status = 'pending'
    ''', (status, request_id, session['user_id']))
    
    if cursor.rowcount == 0:
        return jsonify({'error': 'Request not found or already processed'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': f'Request {action}ed successfully'})

if __name__ == '__main__':
    if not os.path.exists('static/uploads'):
        os.makedirs('static/uploads')
    
    init_db()
    app.run(debug=True)