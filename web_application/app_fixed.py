from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import json
import random
import os
from datetime import datetime
import sqlite3
import traceback

app = Flask(__name__)
app.secret_key = 'benqa_quiz_secret_key_2024'
CORS(app)

# Configuration
DATA_FILE = 'data/questions.json'
DB_FILE = 'data/quiz_results.db'

class QuizApp:
    def __init__(self):
        self.questions = []
        self.load_questions()
        self.init_database()
    
    def load_questions(self):
        """Load questions from JSON file with error handling"""
        try:
            print(f"📂 Loading questions from: {DATA_FILE}")
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if isinstance(data, list) and len(data) > 0:
                self.questions = data
                print(f"✅ Loaded {len(self.questions)} questions successfully")
            else:
                print("❌ Questions data is empty or invalid format")
                self.questions = []
                
        except FileNotFoundError:
            print(f"❌ Questions file not found: {DATA_FILE}")
            self.questions = []
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in questions file: {e}")
            self.questions = []
        except Exception as e:
            print(f"❌ Error loading questions: {e}")
            self.questions = []
    
    def init_database(self):
        """Initialize SQLite database"""
        try:
            os.makedirs('data', exist_ok=True)
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            cursor.execute("""
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
            """)
            
            conn.commit()
            conn.close()
            print("✅ Database initialized")
            
        except Exception as e:
            print(f"❌ Database initialization error: {e}")
    
    def get_filtered_questions(self, subject=None, grade=None, limit=10):
        """Get filtered questions with better error handling"""
        try:
            print(f"🔍 Filtering questions: subject='{subject}', grade='{grade}', limit={limit}")
            
            if not self.questions:
                print("❌ No questions available")
                return []
            
            filtered = self.questions.copy()
            
            if subject and subject != 'all':
                # More flexible subject matching
                filtered = [q for q in filtered if subject.lower() in str(q.get('subject', '')).lower()]
                print(f"🔍 After subject filter: {len(filtered)} questions")
            
            if grade and grade != 'all':
                # More flexible grade matching
                filtered = [q for q in filtered if grade.lower() in str(q.get('grade', '')).lower()]
                print(f"🔍 After grade filter: {len(filtered)} questions")
            
            if not filtered:
                print(f"❌ No questions found for subject='{subject}', grade='{grade}'")
                # Return some questions anyway for demo
                filtered = self.questions[:min(limit, len(self.questions))]
                print(f"🔄 Returning {len(filtered)} questions as fallback")
            
            # Shuffle and limit
            random.shuffle(filtered)
            result = filtered[:int(limit)]
            print(f"✅ Returning {len(result)} questions")
            return result
            
        except Exception as e:
            print(f"❌ Error filtering questions: {e}")
            traceback.print_exc()
            return []
    
    def get_subjects(self):
        """Get unique subjects"""
        try:
            subjects = set(str(q.get('subject', 'Unknown')) for q in self.questions if q.get('subject'))
            subjects.add('all')  # Add 'all' option
            return sorted(list(subjects))
        except Exception as e:
            print(f"❌ Error getting subjects: {e}")
            return ['all', 'Math', 'Physics', 'Chemistry', 'Biology']
    
    def get_grades(self):
        """Get unique grades"""
        try:
            grades = set(str(q.get('grade', 'Unknown')) for q in self.questions if q.get('grade'))
            grades.add('all')  # Add 'all' option
            return sorted(list(grades))
        except Exception as e:
            print(f"❌ Error getting grades: {e}")
            return ['all', '8th', '10th', '12th']

# Initialize the quiz app
print("🚀 Initializing Quiz Application...")
quiz_app = QuizApp()

@app.route('/')
def index():
    """Home page"""
    try:
        subjects = quiz_app.get_subjects()
        grades = quiz_app.get_grades()
        print(f"📊 Rendering home page with {len(subjects)} subjects, {len(grades)} grades")
        return render_template('index.html', subjects=subjects, grades=grades)
    except Exception as e:
        print(f"❌ Error in home route: {e}")
        traceback.print_exc()
        return f"Error loading home page: {str(e)}", 500

@app.route('/start_quiz', methods=['POST'])
def start_quiz():
    """Start a new quiz session with detailed error handling"""
    try:
        print("🎯 ==> START_QUIZ endpoint called")
        data = request.get_json()
        print(f"📋 Received data: {data}")
        
        if not data:
            print("❌ No JSON data received")
            return jsonify({'error': 'No data provided'}), 400
        
        user_name = data.get('user_name', 'Anonymous')
        subject = data.get('subject', 'all')
        grade = data.get('grade', 'all')
        num_questions = int(data.get('num_questions', 10))
        
        print(f"📋 Quiz parameters: user='{user_name}', subject='{subject}', grade='{grade}', count={num_questions}")
        
        # Validate inputs
        if not user_name or user_name.strip() == '':
            return jsonify({'error': 'Please enter your name'}), 400
        
        if num_questions < 1 or num_questions > 50:
            return jsonify({'error': 'Please select between 1 and 50 questions'}), 400
        
        # Get questions
        questions = quiz_app.get_filtered_questions(subject, grade, num_questions)
        
        if not questions:
            available_subjects = quiz_app.get_subjects()
            available_grades = quiz_app.get_grades()
            return jsonify({
                'error': f'No questions found. Available subjects: {available_subjects}, Available grades: {available_grades}'
            }), 404
        
        # Store in session
        session['quiz_data'] = {
            'user_name': user_name.strip(),
            'subject': subject,
            'grade': grade,
            'questions': questions,
            'current_question': 0,
            'answers': [],
            'start_time': datetime.now().isoformat()
        }
        
        print(f"✅ Quiz started successfully with {len(questions)} questions")
        print(f"✅ Session data stored: {len(session.get('quiz_data', {}).get('questions', []))} questions")
        
        return jsonify({
            'success': True,
            'total_questions': len(questions),
            'message': f'Quiz started with {len(questions)} questions'
        })
        
    except ValueError as e:
        print(f"❌ Value error in start_quiz: {e}")
        return jsonify({'error': 'Invalid number of questions specified'}), 400
    except Exception as e:
        print(f"❌ Error in start_quiz: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to start quiz: {str(e)}'}), 500

@app.route('/get_question/<int:question_num>')
def get_question(question_num):
    """Get a specific question with error handling"""
    try:
        print(f"📝 ==> GET_QUESTION endpoint called for question {question_num}")
        
        if 'quiz_data' not in session:
            print("❌ No active quiz session")
            return jsonify({'error': 'No active quiz session. Please start a new quiz.'}), 404
        
        quiz_data = session['quiz_data']
        questions = quiz_data.get('questions', [])
        
        print(f"📊 Session has {len(questions)} questions")
        
        if question_num < 0 or question_num >= len(questions):
            print(f"❌ Invalid question number: {question_num}")
            return jsonify({'error': f'Invalid question number: {question_num}'}), 404
        
        question = questions[question_num].copy()
        
        # Remove correct answer from response
        if 'correct_answer' in question:
            question.pop('correct_answer')
        
        print(f"✅ Returning question {question_num + 1}")
        
        return jsonify({
            'question': question,
            'question_number': question_num + 1,
            'total_questions': len(questions)
        })
        
    except Exception as e:
        print(f"❌ Error getting question: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to load question: {str(e)}'}), 500

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    """Submit answer with error handling"""
    try:
        print(f"✍️ ==> SUBMIT_ANSWER endpoint called")
        
        if 'quiz_data' not in session:
            return jsonify({'error': 'No active quiz session'}), 404
        
        data = request.get_json()
        print(f"📝 Answer data: {data}")
        
        user_answer = str(data.get('answer', '')).lower().strip()
        question_num = int(data.get('question_number', 1)) - 1
        time_spent = int(data.get('time_spent', 0))
        
        quiz_data = session['quiz_data']
        questions = quiz_data['questions']
        
        if question_num < 0 or question_num >= len(questions):
            return jsonify({'error': 'Invalid question number'}), 404
        
        question = questions[question_num]
        correct_answer = str(question.get('correct_answer', 'a')).lower().strip()
        is_correct = user_answer == correct_answer
        
        print(f"✅ Answer check: user='{user_answer}', correct='{correct_answer}', match={is_correct}")
        
        # Store answer
        quiz_data['answers'].append({
            'question_id': question.get('id', question_num),
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct,
            'time_spent': time_spent
        })
        
        session['quiz_data'] = quiz_data
        
        # Get option text for explanation
        options = question.get('options', {})
        if isinstance(options, dict):
            correct_option_text = options.get(correct_answer.upper(), correct_answer)
        else:
            correct_option_text = f"Option {correct_answer.upper()}"
        
        return jsonify({
            'correct': is_correct,
            'correct_answer': correct_answer.upper(),
            'explanation': f"The correct answer is {correct_answer.upper()}: {correct_option_text}"
        })
        
    except Exception as e:
        print(f"❌ Error submitting answer: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to submit answer: {str(e)}'}), 500

@app.route('/finish_quiz', methods=['POST'])
def finish_quiz():
    """Finish quiz with error handling"""
    try:
        print(f"🏁 ==> FINISH_QUIZ endpoint called")
        
        if 'quiz_data' not in session:
            return jsonify({'error': 'No active quiz session'}), 404
        
        quiz_data = session['quiz_data']
        answers = quiz_data.get('answers', [])
        
        # Calculate results
        correct_count = sum(1 for answer in answers if answer.get('is_correct', False))
        total_questions = len(answers)
        score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        # Calculate time taken
        start_time = datetime.fromisoformat(quiz_data['start_time'])
        end_time = datetime.now()
        time_taken = int((end_time - start_time).total_seconds())
        
        print(f"📊 Quiz results: {correct_count}/{total_questions} = {score_percentage:.1f}%")
        
        # Clear session
        session.pop('quiz_data', None)
        
        # Determine grade
        if score_percentage >= 90:
            grade = 'A'
        elif score_percentage >= 80:
            grade = 'B'
        elif score_percentage >= 70:
            grade = 'C'
        elif score_percentage >= 60:
            grade = 'D'
        else:
            grade = 'F'
        
        return jsonify({
            'results': {
                'correct': correct_count,
                'total': total_questions,
                'percentage': round(score_percentage, 1),
                'time_taken': time_taken,
                'grade': grade
            }
        })
        
    except Exception as e:
        print(f"❌ Error finishing quiz: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to finish quiz: {str(e)}'}), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Page not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("="*60)
    print("🚀 STARTING BEnQA QUIZ APPLICATION")
    print("="*60)
    print(f"📊 Questions loaded: {len(quiz_app.questions)}")
    print(f"🎯 Subjects available: {quiz_app.get_subjects()}")
    print(f"🎓 Grades available: {quiz_app.get_grades()}")
    
    if len(quiz_app.questions) == 0:
        print("❌ WARNING: No questions loaded! Check your data file.")
    else:
        print("✅ Application ready to start")
    
    print("🌐 Server starting at: http://localhost:5000")
    print("="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)
