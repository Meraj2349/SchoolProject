// app.js - JavaScript functionality for BEnQA Quiz Platform

class QuizApp {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 0;
        this.selectedAnswer = null;
        this.startTime = null;
        this.questionStartTime = null;
        this.answers = [];
        this.timer = null;
        this.elapsedTime = 0;
        
        this.initializeEvents();
    }
    
    initializeEvents() {
        // Quiz form submission
        document.getElementById('quiz-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startQuiz();
        });
        
        // Submit answer button
        document.getElementById('submit-answer').addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // Next question button
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // Start timer when page loads
        this.startGlobalTimer();
    }
    
    async startQuiz() {
        const formData = {
            user_name: document.getElementById('user_name').value,
            subject: document.getElementById('subject').value,
            grade: document.getElementById('grade').value,
            num_questions: document.getElementById('num_questions').value
        };
        
        if (!formData.user_name.trim()) {
            alert('Please enter your name');
            return;
        }
        
        // Validate grade selection
        if (!formData.grade || formData.grade === '') {
            alert('Please select a grade first');
            return;
        }
        
        // Validate subject selection
        if (!formData.subject || formData.subject === '') {
            alert('Please select a subject');
            return;
        }
        
        console.log('Form data being sent:', formData); // Debug log
        
        try {
            const response = await fetch('/start_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status); // Debug log
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                alert(`Server error: ${response.status} ${response.statusText}`);
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data); // Debug log
            
            if (data.success) {
                this.totalQuestions = data.total_questions;
                this.currentQuestion = 0;
                this.answers = [];
                this.startTime = new Date();
                
                // Hide home section, show quiz section
                document.getElementById('home-section').style.display = 'none';
                document.getElementById('quiz-section').style.display = 'block';
                
                this.loadQuestion(0);
            } else {
                alert(data.error || 'Failed to start quiz');
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Failed to start quiz. Please try again.');
        }
    }
    
    async loadQuestion(questionNum) {
        try {
            const response = await fetch(`/get_question/${questionNum}`);
            const data = await response.json();
            
            if (data.question) {
                this.displayQuestion(data.question, data.question_number, data.total_questions);
                this.questionStartTime = new Date();
            } else {
                alert(data.error || 'Failed to load question');
            }
        } catch (error) {
            console.error('Error loading question:', error);
            alert('Failed to load question. Please try again.');
        }
    }
    
    displayQuestion(question, questionNumber, totalQuestions) {
        // Update progress
        const progressPercent = (questionNumber / totalQuestions) * 100;
        document.getElementById('progress-text').textContent = `Question ${questionNumber} of ${totalQuestions}`;
        document.getElementById('progress-bar').style.width = `${progressPercent}%`;
        
        // Display question info
        document.getElementById('question-subject').textContent = question.subject;
        document.getElementById('question-grade').textContent = question.grade;
        document.getElementById('question-text').innerHTML = question.question; // Changed to innerHTML for math rendering
        
        // Display options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        Object.entries(question.options).forEach(([key, value]) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-card';
            optionDiv.dataset.option = key.toLowerCase();
            optionDiv.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="badge bg-primary me-3">${key}</span>
                    <span>${value}</span>
                </div>
            `;
            
            optionDiv.addEventListener('click', () => {
                this.selectOption(key.toLowerCase(), optionDiv);
            });
            
            optionsContainer.appendChild(optionDiv);
        });
        
        // Reset selection
        this.selectedAnswer = null;
        document.getElementById('submit-answer').disabled = true;
        document.getElementById('answer-feedback').style.display = 'none';
        
        // Render MathJax for mathematical expressions
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([document.getElementById('question-text'), optionsContainer])
                .catch((err) => console.log('MathJax typeset failed: ' + err.message));
        }
    }
    
    selectOption(option, optionElement) {
        // Remove previous selection
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new option
        optionElement.classList.add('selected');
        this.selectedAnswer = option;
        document.getElementById('submit-answer').disabled = false;
    }
    
    async submitAnswer() {
        if (!this.selectedAnswer) return;
        
        const timeSpent = Math.floor((new Date() - this.questionStartTime) / 1000);
        
        try {
            const response = await fetch('/submit_answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answer: this.selectedAnswer,
                    question_number: this.currentQuestion + 1,
                    time_spent: timeSpent
                })
            });
            
            const data = await response.json();
            this.showAnswerFeedback(data);
            
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer. Please try again.');
        }
    }
    
    showAnswerFeedback(feedbackData) {
        const feedbackDiv = document.getElementById('answer-feedback');
        const contentDiv = document.getElementById('feedback-content');
        
        // Highlight correct/incorrect options
        document.querySelectorAll('.option-card').forEach(card => {
            const option = card.dataset.option;
            if (option === feedbackData.correct_answer.toLowerCase()) {
                card.classList.add('correct');
            } else if (option === this.selectedAnswer && !feedbackData.correct) {
                card.classList.add('incorrect');
            }
        });
        
        // Show feedback
        const isCorrect = feedbackData.correct;
        contentDiv.innerHTML = `
            <div class="${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}">
                <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'} fa-3x mb-3"></i>
                <h4>${isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                <p>${feedbackData.explanation}</p>
            </div>
        `;
        
        feedbackDiv.style.display = 'block';
        document.getElementById('submit-answer').style.display = 'none';
        
        // Update next button text
        const nextButton = document.getElementById('next-question');
        if (this.currentQuestion + 1 >= this.totalQuestions) {
            nextButton.innerHTML = '<i class="fas fa-flag-checkered me-2"></i>Finish Quiz';
        } else {
            nextButton.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Next Question';
        }
    }
    
    async nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            await this.finishQuiz();
        } else {
            document.getElementById('submit-answer').style.display = 'inline-block';
            await this.loadQuestion(this.currentQuestion);
        }
    }
    
    async finishQuiz() {
        try {
            const response = await fetch('/finish_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            this.showResults(data.results);
            
        } catch (error) {
            console.error('Error finishing quiz:', error);
            alert('Failed to finish quiz. Please try again.');
        }
    }
    
    showResults(results) {
        // Hide quiz section, show results section
        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';
        
        // Display results
        const resultsDiv = document.getElementById('results-content');
        const gradeClass = `grade-${results.grade.toLowerCase()}`;
        
        resultsDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="result-score ${gradeClass}">${results.percentage}%</div>
                    <h5>Your Score</h5>
                </div>
                <div class="col-md-6">
                    <div class="result-grade ${gradeClass}">${results.grade}</div>
                    <h5>Grade</h5>
                </div>
            </div>
            <hr>
            <div class="row text-start">
                <div class="col-md-3">
                    <strong>Correct Answers:</strong><br>
                    <span class="text-success">${results.correct} / ${results.total}</span>
                </div>
                <div class="col-md-3">
                    <strong>Time Taken:</strong><br>
                    <span class="text-info">${this.formatTime(results.time_taken)}</span>
                </div>
                <div class="col-md-3">
                    <strong>Accuracy:</strong><br>
                    <span class="text-primary">${results.percentage}%</span>
                </div>
                <div class="col-md-3">
                    <strong>Performance:</strong><br>
                    <span class="${gradeClass}">${this.getPerformanceText(results.percentage)}</span>
                </div>
            </div>
        `;
        
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    
    getPerformanceText(percentage) {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 80) return 'Very Good';
        if (percentage >= 70) return 'Good';
        if (percentage >= 60) return 'Fair';
        return 'Needs Improvement';
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    startGlobalTimer() {
        this.timer = setInterval(() => {
            this.elapsedTime++;
            const timeDisplay = document.getElementById('time-display');
            if (timeDisplay) {
                timeDisplay.textContent = this.formatTime(this.elapsedTime);
            }
        }, 1000);
    }
}

// Global functions
function showStats() {
    alert('Statistics feature will be available once you complete some quizzes!');
}

// Grade to subject mapping for filtering
function filterSubjects() {
    const gradeSubjectMap = {
        '8th': ['Math', 'Science'],
        '10th': ['Biology', 'Chemistry', 'Math', 'Math-II', 'Physics'],
        '12th': ['Biology-I', 'Biology-II', 'Chemistry-I', 'Chemistry-II', 'Math-I', 'Math-II', 'Physics-I', 'Physics-II']
    };

    const gradeSelect = document.getElementById('grade');
    const subjectSelect = document.getElementById('subject');
    const selectedGrade = gradeSelect.value;

    // Clear and reset subject dropdown
    subjectSelect.innerHTML = '';
    
    if (selectedGrade === '') {
        subjectSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">Select Grade First</option>';
    } else if (selectedGrade === 'all') {
        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        // Add all subjects
        const allSubjects = [...gradeSubjectMap['8th'], ...gradeSubjectMap['10th'], ...gradeSubjectMap['12th']];
        // Remove duplicates
        const uniqueSubjects = [...new Set(allSubjects)];
        uniqueSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject.replace('-', ' '); // Make it more readable
            subjectSelect.appendChild(option);
        });
    } else {
        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="">Choose Subject</option>';
        
        // Add subjects for selected grade
        if (gradeSubjectMap[selectedGrade]) {
            gradeSubjectMap[selectedGrade].forEach(subject => {
                const option = document.createElement('option');
                option.value = subject; // Use the correct subject name
                option.textContent = subject.replace('-', ' '); // Make it more readable
                subjectSelect.appendChild(option);
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.quizApp = new QuizApp();
});
