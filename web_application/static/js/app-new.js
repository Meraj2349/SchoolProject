// app.js - JavaScript functionality for BEnQA Quiz Platform

// Professional Alert System Class
class AlertSystem {
    constructor() {
        this.createNotificationContainer();
        this.createAlertOverlay();
    }
    
    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            
            // Position notifications appropriately based on screen size
            this.updateNotificationPosition(container);
            
            document.body.appendChild(container);
            
            // Update notification position on window resize
            window.addEventListener('resize', () => {
                this.updateNotificationPosition(container);
            });
        }
    }
    
    updateNotificationPosition(container) {
        if (window.innerWidth <= 768) {
            // Mobile: position below back button
            container.style.top = '80px';
            container.style.right = '10px';
            container.style.left = '10px';
            container.style.maxWidth = 'none';
        } else {
            // Desktop: standard top-right position
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.left = 'auto';
            container.style.maxWidth = '400px';
        }
    }
    
    createAlertOverlay() {
        if (!document.getElementById('alert-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'alert-overlay';
            overlay.className = 'alert-overlay';
            overlay.innerHTML = `
                <div class="alert-box">
                    <i class="alert-icon"></i>
                    <h3 class="alert-title"></h3>
                    <p class="alert-message"></p>
                    <div class="alert-buttons"></div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            // Close alert when clicking overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAlert();
                }
            });
        }
    }
    
    // Show professional alert dialog
    showAlert(options) {
        const {
            type = 'info',
            title = 'Alert',
            message = '',
            buttons = [{ text: 'OK', action: null, primary: true }]
        } = options;
        
        const overlay = document.getElementById('alert-overlay');
        const alertBox = overlay.querySelector('.alert-box');
        const iconElement = alertBox.querySelector('.alert-icon');
        const titleElement = alertBox.querySelector('.alert-title');
        const messageElement = alertBox.querySelector('.alert-message');
        const buttonsContainer = alertBox.querySelector('.alert-buttons');
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        iconElement.className = `alert-icon ${icons[type] || icons.info}`;
        alertBox.className = `alert-box alert-${type}`;
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        // Create buttons
        buttonsContainer.innerHTML = '';
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `alert-btn ${button.primary ? 'alert-btn-primary' : 'alert-btn-secondary'}`;
            btn.textContent = button.text;
            btn.onclick = () => {
                this.closeAlert();
                if (button.action) button.action();
            };
            buttonsContainer.appendChild(btn);
        });
        
        overlay.classList.add('show');
    }
    
    closeAlert() {
        const overlay = document.getElementById('alert-overlay');
        overlay.classList.remove('show');
    }
    
    // Show notification toast
    showNotification(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 4000
        } = options;
        
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        const notificationId = 'notification-' + Date.now();
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        notification.id = notificationId;
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="notification-icon ${icons[type] || icons.info}"></i>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="alertSystem.closeNotification('${notificationId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-remove notification
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notificationId);
            }, duration);
        }
        
        return notificationId;
    }
    
    closeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
    
    // Convenience methods
    success(message, title = 'Success') {
        this.showNotification({ type: 'success', title, message });
    }
    
    error(message, title = 'Error') {
        this.showNotification({ type: 'error', title, message });
    }
    
    warning(message, title = 'Warning') {
        this.showNotification({ type: 'warning', title, message });
    }
    
    info(message, title = 'Information') {
        this.showNotification({ type: 'info', title, message });
    }
    
    // Confirmation dialog
    confirm(options) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Yes',
            cancelText = 'Cancel',
            onConfirm = null,
            onCancel = null
        } = options;
        
        this.showAlert({
            type: 'warning',
            title,
            message,
            buttons: [
                { text: cancelText, action: onCancel, primary: false },
                { text: confirmText, action: onConfirm, primary: true }
            ]
        });
    }
}

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
        
        // Initialize professional alert system
        this.alertSystem = new AlertSystem();
        
        this.initializeEvents();
        this.setupBackButton();
    }
    
    setupBackButton() {
        // Enhanced back button functionality with responsive behavior
        const backButton = document.getElementById('backButton');
        
        // Add responsive classes based on screen size
        this.updateBackButtonForScreenSize();
        
        // Update back button on window resize
        window.addEventListener('resize', () => {
            this.updateBackButtonForScreenSize();
        });
        
        // Try to go back to the school website (parent window or previous page)
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if quiz is in progress
            const quizSection = document.getElementById('quiz-section');
            if (quizSection && quizSection.style.display !== 'none') {
                // Quiz is in progress, show confirmation
                this.alertSystem.confirm({
                    title: 'Leave Quiz?',
                    message: 'You are currently taking a quiz. Are you sure you want to leave? Your progress will be lost.',
                    confirmText: 'Yes, Leave',
                    cancelText: 'Stay Here',
                    onConfirm: () => {
                        this.navigateBack();
                    }
                });
                return;
            }
            
            this.navigateBack();
        });
    }
    
    updateBackButtonForScreenSize() {
        const backButton = document.getElementById('backButton');
        const span = backButton.querySelector('span');
        
        if (window.innerWidth <= 480) {
            // Very small screens - icon only
            if (span) span.style.display = 'none';
            backButton.setAttribute('title', 'Back to School Website');
        } else if (window.innerWidth <= 768) {
            // Small screens - show text but smaller
            if (span) {
                span.style.display = 'inline';
                span.textContent = 'Back';
            }
            backButton.setAttribute('title', 'Back to School Website');
        } else {
            // Normal screens - full text
            if (span) {
                span.style.display = 'inline';
                span.textContent = 'Back to School';
            }
            backButton.removeAttribute('title');
        }
    }
    
    navigateBack() {
        // If opened in new tab/window from school website
        if (window.opener && !window.opener.closed) {
            window.close();
            return;
        }
        
        // If there's history, go back
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        
        // Fallback: redirect to school website (your React home page)
        window.location.href = 'http://localhost:5173/'; // Your React school website URL
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
            this.alertSystem.showAlert({
                type: 'warning',
                title: 'Name Required',
                message: 'Please enter your name to start the quiz.',
                buttons: [{ text: 'OK', primary: true }]
            });
            return;
        }
        
        // Validate grade selection
        if (!formData.grade || formData.grade === '') {
            this.alertSystem.showAlert({
                type: 'warning',
                title: 'Grade Required',
                message: 'Please select a grade first before starting the quiz.',
                buttons: [{ text: 'OK', primary: true }]
            });
            return;
        }
        
        // Validate subject selection
        if (!formData.subject || formData.subject === '') {
            this.alertSystem.showAlert({
                type: 'warning',
                title: 'Subject Required',
                message: 'Please select a subject before starting the quiz.',
                buttons: [{ text: 'OK', primary: true }]
            });
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
                this.alertSystem.showAlert({
                    type: 'error',
                    title: 'Server Error',
                    message: `Failed to connect to server: ${response.status} ${response.statusText}`,
                    buttons: [{ text: 'OK', primary: true }]
                });
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data); // Debug log
            
            if (data.success) {
                this.totalQuestions = data.total_questions;
                this.currentQuestion = 0;
                this.answers = [];
                this.startTime = new Date();
                
                // Show success notification
                this.alertSystem.success(`Quiz started! You have ${data.total_questions} questions to answer.`, 'Quiz Started');
                
                // Hide home section, show quiz section
                document.getElementById('home-section').style.display = 'none';
                document.getElementById('quiz-section').style.display = 'block';
                
                this.loadQuestion(0);
            } else {
                this.alertSystem.showAlert({
                    type: 'error',
                    title: 'Quiz Start Failed',
                    message: data.error || 'Failed to start quiz. Please try again.',
                    buttons: [{ text: 'OK', primary: true }]
                });
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.alertSystem.showAlert({
                type: 'error',
                title: 'Connection Error',
                message: 'Failed to start quiz due to network issues. Please check your connection and try again.',
                buttons: [{ text: 'OK', primary: true }]
            });
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
                this.alertSystem.showAlert({
                    type: 'error',
                    title: 'Question Load Failed',
                    message: data.error || 'Failed to load question. Please try again.',
                    buttons: [{ text: 'Retry', action: () => this.loadQuestion(questionNum), primary: true }]
                });
            }
        } catch (error) {
            console.error('Error loading question:', error);
            this.alertSystem.showAlert({
                type: 'error',
                title: 'Connection Error',
                message: 'Failed to load question due to network issues. Please check your connection and try again.',
                buttons: [
                    { text: 'Retry', action: () => this.loadQuestion(questionNum), primary: true },
                    { text: 'Cancel', primary: false }
                ]
            });
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
            this.alertSystem.showAlert({
                type: 'error',
                title: 'Submit Failed',
                message: 'Failed to submit answer due to network issues. Please try again.',
                buttons: [{ text: 'OK', primary: true }]
            });
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
        
        // Show notification for answer feedback
        if (isCorrect) {
            this.alertSystem.success('Great job! You got it right.', 'Correct Answer');
        } else {
            this.alertSystem.warning('Not quite right. Review the explanation below.', 'Incorrect Answer');
        }
        
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
            
            // Show completion notification
            this.alertSystem.success('Congratulations! You have completed the quiz.', 'Quiz Completed');
            
        } catch (error) {
            console.error('Error finishing quiz:', error);
            this.alertSystem.showAlert({
                type: 'error',
                title: 'Finish Failed',
                message: 'Failed to finish quiz due to network issues. Please try again.',
                buttons: [{ text: 'OK', primary: true }]
            });
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
    if (window.quizApp && window.quizApp.alertSystem) {
        window.quizApp.alertSystem.showAlert({
            type: 'info',
            title: 'Statistics Coming Soon',
            message: 'Statistics feature will be available once you complete some quizzes! Keep taking quizzes to see your progress.',
            buttons: [{ text: 'Got it!', primary: true }]
        });
    } else {
        alert('Statistics feature will be available once you complete some quizzes!');
    }
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
    // Initialize global alert system
    window.alertSystem = new AlertSystem();
    
    // Initialize quiz app
    window.quizApp = new QuizApp();
    
    // Show welcome notification
    setTimeout(() => {
        window.alertSystem.info('Welcome to Star Academic School Quiz Platform! Select your grade and subject to get started.', 'Welcome');
    }, 1000);
});
