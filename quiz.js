let currentQuestionIndex = 0;
let score = 0;
let timer;
let selectedAnswer = null;
const timeLimit = 30;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (!category || !quizData[category]) {
        window.location.href = '/index.html';
        return;
    }

    document.getElementById('quiz-category').innerText = 
        `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    const questions = quizData[category];
    
    function startTimer() {
        let timeLeft = timeLimit;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timer) clearInterval(timer);
        
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                showFeedback(false);
                setTimeout(nextQuestion, 2000);
            }
        }, 1000);
    }

    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progress}%`;
    }

    function showFeedback(isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.style.display = 'block';
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect 
            ? 'Correct! 🎉' 
            : `Incorrect! The correct answer was: ${questions[currentQuestionIndex].correct}`;
    }

    function displayQuestion() {
        startTimer();
        updateProgress();
        selectedAnswer = null;
        
        const question = questions[currentQuestionIndex];
        document.getElementById('question-text').innerText = question.question;
        
        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.onclick = () => selectAnswer(option, button);
            optionsContainer.appendChild(button);
        });

        document.getElementById('feedback').style.display = 'none';
        document.getElementById('next-button').style.display = 'block';
    }

    function selectAnswer(answer, button) {
        if (selectedAnswer !== null) return; // Prevent multiple selections
        
        selectedAnswer = answer;
        
        // Remove selected class from all buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = true; // Disable all buttons after selection
        });
        
        // Add selected class to clicked button
        button.classList.add('selected');
        
        // Show feedback immediately
        const isCorrect = selectedAnswer === questions[currentQuestionIndex].correct;
        if (isCorrect) score++;
        showFeedback(isCorrect);
        clearInterval(timer);
    }

    window.nextQuestion = function() {
        if (selectedAnswer === null) {
            alert('Please select an answer first!');
            return;
        }
        
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            // Quiz completed
            const percentage = Math.round((score / questions.length) * 100);
            document.getElementById('quiz-container').innerHTML = `
                <div class="text-center">
                    <h2 class="mb-4">Quiz Completed! 🎉</h2>
                    <p class="h4 mb-3">Your Score: ${score}/${questions.length}</p>
                    <p class="h5 mb-4">${percentage}%</p>
                    <div class="mt-4">
                        <a href="/index.html" class="btn btn-primary btn-lg me-3">Try Another Quiz</a>
                        <a href="/quiz.html?category=${category}" class="btn btn-outline-primary btn-lg">Retry This Quiz</a>
                    </div>
                </div>
            `;
            document.getElementById('next-button').style.display = 'none';
        }
    };

    displayQuestion();
});