# app.py - Main Flask Application for BEnQA Quiz Platform

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import json
import random
import os
from datetime import datetime
import sqlite3

app = Flask(__name__)
app.secret_key = 'benqa_quiz_secret_key_2024'
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'questions.json')
DB_FILE = os.path.join(BASE_DIR, 'data', 'quiz_results.db')

class QuizApp:
    def __init__(self):
        self.questions = self.load_questions()
        self.init_database()
    
    def load_questions(self):
        """Load questions from JSON file"""
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                
            # Process questions to format mathematical expressions
            for question in questions:
                question['question'] = self.format_math_expressions(question['question'])
                for key, option in question.get('options', {}).items():
                    question['options'][key] = self.format_math_expressions(option)
                    
            return questions
        except FileNotFoundError:
            print(f"Error: {DATA_FILE} not found!")
            return []
    
    def format_math_expressions(self, text):
        """Format mathematical expressions for MathJax rendering"""
        if not text:
            return text
            
        # Convert common LaTeX patterns to MathJax format
        import re
        
        # Handle inline fractions: \frac{a}{b} -> $\frac{a}{b}$
        text = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'$\\frac{\1}{\2}$', text)
        
        # Handle exponents: x^2 -> $x^2$
        text = re.sub(r'(\w+)\^(\{[^}]+\}|\w+)', r'$\1^{\2}$', text)
        
        # Handle square roots: \sqrt{x} -> $\sqrt{x}$
        text = re.sub(r'\\sqrt\{([^}]+)\}', r'$\\sqrt{\1}$', text)
        
        # Handle subscripts: x_1 -> $x_1$
        text = re.sub(r'(\w+)_(\{[^}]+\}|\w+)', r'$\1_{\2}$', text)
        
        # Handle common mathematical symbols
        replacements = {
            '\\cdot': '$\\cdot$',
            '\\times': '$\\times$',
            '\\div': '$\\div$',
            '\\pm': '$\\pm$',
            '\\infty': '$\\infty$',
            '\\pi': '$\\pi$',
            '\\theta': '$\\theta$',
            '\\alpha': '$\\alpha$',
            '\\beta': '$\\beta$',
            '\\gamma': '$\\gamma$',
            '\\delta': '$\\delta$',
        }
        
        for latex, mathjax in replacements.items():
            text = text.replace(latex, mathjax)
        
        # Handle display math (equations on their own line)
        text = re.sub(r'\\\[(.*?)\\\]', r'$$\1$$', text, flags=re.DOTALL)
        text = re.sub(r'\\\((.*?)\\\)', r'$\1$', text, flags=re.DOTALL)
        
        return text
    
    def init_database(self):
        """Initialize SQLite database for storing results"""
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT,
                subject TEXT,
                grade TEXT,
                total_questions INTEGER,
                correct_answers INTEGER,
                score_percentage REAL,
                time_taken INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS question_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                question_id INTEGER,
                user_answer TEXT,
                correct_answer TEXT,
                is_correct BOOLEAN,
                time_spent INTEGER,
                FOREIGN KEY (session_id) REFERENCES quiz_sessions (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_filtered_questions(self, subject=None, grade=None, limit=10):
        """Get filtered questions based on criteria"""
        filtered = self.questions.copy()
        
        # Debug: Print available subjects and grades
        if len(self.questions) > 0:
            sample_question = self.questions[0]
            print(f"Sample question keys: {sample_question.keys()}")
            if 'subject' in sample_question:
                print(f"Sample subject: '{sample_question['subject']}'")
            if 'grade' in sample_question:
                print(f"Sample grade: '{sample_question['grade']}'")
        
        available_subjects = set(q.get('subject', 'Unknown') for q in self.questions)
        available_grades = set(q.get('grade', 'Unknown') for q in self.questions)
        print(f"Available subjects: {sorted(list(available_subjects))}")
        print(f"Available grades: {sorted(list(available_grades))}")
        print(f"Filtering for: subject='{subject}', grade='{grade}'")
        
        if subject and subject != 'all':
            # Try exact match first
            filtered_exact = [q for q in filtered if q.get('subject', '').lower() == subject.lower()]
            if filtered_exact:
                filtered = filtered_exact
            else:
                # Try partial match
                filtered = [q for q in filtered if subject.lower() in q.get('subject', '').lower()]
        
        if grade and grade != 'all':
            # Try exact match first
            filtered_exact = [q for q in filtered if q.get('grade', '').lower() == grade.lower()]
            if filtered_exact:
                filtered = filtered_exact
            else:
                # Try partial match
                filtered = [q for q in filtered if grade.lower() in q.get('grade', '').lower()]
        
        print(f"Questions after filtering: {len(filtered)}")
        
        # Shuffle and limit
        random.shuffle(filtered)
        return filtered[:limit]
    
    def get_subjects(self):
        """Get unique subjects"""
        subjects = set(q.get('subject', 'Unknown') for q in self.questions)
        subjects_list = sorted(list(subjects))
        print(f"Available subjects: {subjects_list}")
        return subjects_list
    
    def get_grades(self):
        """Get unique grades"""
        grades = set(q.get('grade', 'Unknown') for q in self.questions)
        grades_list = sorted(list(grades))
        print(f"Available grades: {grades_list}")
        return grades_list
    
    def save_quiz_result(self, session_data, attempts):
        """Save quiz results to database"""
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Insert session
        cursor.execute('''
            INSERT INTO quiz_sessions 
            (user_name, subject, grade, total_questions, correct_answers, score_percentage, time_taken)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_data['user_name'],
            session_data['subject'],
            session_data['grade'],
            session_data['total_questions'],
            session_data['correct_answers'],
            session_data['score_percentage'],
            session_data['time_taken']
        ))
        
        session_id = cursor.lastrowid
        
        # Insert attempts
        for attempt in attempts:
            cursor.execute('''
                INSERT INTO question_attempts 
                (session_id, question_id, user_answer, correct_answer, is_correct, time_spent)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                session_id,
                attempt['question_id'],
                attempt['user_answer'],
                attempt['correct_answer'],
                attempt['is_correct'],
                attempt['time_spent']
            ))
        
        conn.commit()
        conn.close()
        return session_id

# Initialize the quiz app
quiz_app = QuizApp()

# Routes
@app.route('/')
def index():
    """Home page"""
    return render_template('index.html', 
                         subjects=quiz_app.get_subjects(),
                         grades=quiz_app.get_grades())

@app.route('/start_quiz', methods=['POST'])
def start_quiz():
    """Start a new quiz session"""
    print(f"=== START_QUIZ REQUEST ===")
    print(f"Method: {request.method}")
    print(f"Content-Type: {request.content_type}")
    print(f"Raw data: {request.data}")
    print(f"========================")
    
    try:
        data = request.get_json()
        print(f"Parsed JSON data: {data}")
        
        if not data:
            print("ERROR: No JSON data received")
            return jsonify({'error': 'No JSON data provided'}), 400
        user_name = data.get('user_name', 'Anonymous')
        subject = data.get('subject', 'all')
        grade = data.get('grade', 'all')
        num_questions = int(data.get('num_questions', 10))
        
        print(f"Parameters: user={user_name}, subject={subject}, grade={grade}, num={num_questions}")
        
        # Get questions
        questions = quiz_app.get_filtered_questions(subject, grade, num_questions)
        print(f"Found {len(questions)} questions")
        
        if not questions:
            print("ERROR: No questions found")
            return jsonify({'error': 'No questions found for selected criteria'}), 404
        
        # Store in session
        session['quiz_data'] = {
            'user_name': user_name,
            'subject': subject,
            'grade': grade,
            'questions': questions,
            'current_question': 0,
            'answers': [],
            'start_time': datetime.now().isoformat()
        }
        
        print(f"SUCCESS: Quiz started with {len(questions)} questions")
        return jsonify({
            'success': True,
            'total_questions': len(questions),
            'first_question': questions[0] if questions else None
        })
        
    except Exception as e:
        print(f"ERROR in start_quiz: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/get_question/<int:question_num>')
def get_question(question_num):
    """Get a specific question"""
    if 'quiz_data' not in session:
        return jsonify({'error': 'No active quiz session'}), 404
    
    quiz_data = session['quiz_data']
    questions = quiz_data['questions']
    
    if question_num < 0 or question_num >= len(questions):
        return jsonify({'error': 'Invalid question number'}), 404
    
    question = questions[question_num].copy()
    # Remove correct answer from response
    question.pop('correct_answer', None)
    
    return jsonify({
        'question': question,
        'question_number': question_num + 1,
        'total_questions': len(questions)
    })

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    """Submit an answer for current question"""
    if 'quiz_data' not in session:
        return jsonify({'error': 'No active quiz session'}), 404
    
    data = request.get_json()
    user_answer = data.get('answer', '').lower()
    question_num = data.get('question_number', 0) - 1
    time_spent = data.get('time_spent', 0)
    
    quiz_data = session['quiz_data']
    questions = quiz_data['questions']
    
    if question_num < 0 or question_num >= len(questions):
        return jsonify({'error': 'Invalid question number'}), 404
    
    question = questions[question_num]
    correct_answer = question['correct_answer'].lower()
    is_correct = user_answer == correct_answer
    
    # Store answer
    quiz_data['answers'].append({
        'question_id': question['id'],
        'user_answer': user_answer,
        'correct_answer': correct_answer,
        'is_correct': is_correct,
        'time_spent': time_spent
    })
    
    session['quiz_data'] = quiz_data
    
    return jsonify({
        'correct': is_correct,
        'correct_answer': correct_answer.upper(),
        'explanation': f"The correct answer is {correct_answer.upper()}: {question['options'][correct_answer.upper()]}"
    })

@app.route('/finish_quiz', methods=['POST'])
def finish_quiz():
    """Finish quiz and calculate results"""
    if 'quiz_data' not in session:
        return jsonify({'error': 'No active quiz session'}), 404
    
    quiz_data = session['quiz_data']
    answers = quiz_data['answers']
    
    # Calculate results
    correct_count = sum(1 for answer in answers if answer['is_correct'])
    total_questions = len(answers)
    score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
    
    # Calculate time taken
    start_time = datetime.fromisoformat(quiz_data['start_time'])
    end_time = datetime.now()
    time_taken = int((end_time - start_time).total_seconds())
    
    # Prepare session data
    session_data = {
        'user_name': quiz_data['user_name'],
        'subject': quiz_data['subject'],
        'grade': quiz_data['grade'],
        'total_questions': total_questions,
        'correct_answers': correct_count,
        'score_percentage': score_percentage,
        'time_taken': time_taken
    }
    
    # Save to database
    session_id = quiz_app.save_quiz_result(session_data, answers)
    
    # Clear session
    session.pop('quiz_data', None)
    
    return jsonify({
        'session_id': session_id,
        'results': {
            'correct': correct_count,
            'total': total_questions,
            'percentage': round(score_percentage, 1),
            'time_taken': time_taken,
            'grade': 'A' if score_percentage >= 90 else 'B' if score_percentage >= 80 else 'C' if score_percentage >= 70 else 'D' if score_percentage >= 60 else 'F'
        },
        'answers': answers
    })

@app.route('/results/<int:session_id>')
def view_results(session_id):
    """View detailed results"""
    return render_template('results.html', session_id=session_id)

@app.route('/api/stats')
def get_stats():
    """Get overall statistics"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Get basic stats
    cursor.execute('SELECT COUNT(*) FROM quiz_sessions')
    total_sessions = cursor.fetchone()[0]
    
    cursor.execute('SELECT AVG(score_percentage) FROM quiz_sessions')
    avg_score = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT subject, AVG(score_percentage) FROM quiz_sessions GROUP BY subject')
    subject_stats = cursor.fetchall()
    
    conn.close()
    
    return jsonify({
        'total_sessions': total_sessions,
        'average_score': round(avg_score, 1),
        'subject_performance': {subject: round(score, 1) for subject, score in subject_stats},
        'total_questions': len(quiz_app.questions)
    })

if __name__ == '__main__':
    # Ensure data directory exists
    data_dir = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    print("🚀 Starting BEnQA Quiz Application...")
    print("📊 Questions loaded:", len(quiz_app.questions))
    print("🎯 Subjects available:", len(quiz_app.get_subjects()))
    print("🎓 Grades available:", len(quiz_app.get_grades()))
    print("🌐 Server starting at: http://localhost:5002")
    
    app.run(debug=True, host='0.0.0.0', port=5002)
