class PriceGuesserGame {
    constructor() {
        this.products = [];
        this.currentProduct = null;
        this.currentAttempt = 0;
        this.maxAttempts = 5;
        this.gameWon = false;
        this.gameOver = false;
        
        this.initializeElements();
        this.loadProducts();
    }

    initializeElements() {
        this.productImage = document.getElementById('product-image');
        this.productDescription = document.getElementById('product-description');
        this.priceInput = document.getElementById('price-input');
        this.submitButton = document.getElementById('submit-guess');
        this.gameMessage = document.getElementById('game-message');
        this.newGameButton = document.getElementById('new-game');
        this.guessRows = document.querySelectorAll('.guess-row');
    }

    async loadProducts() {
        try {
            const response = await fetch('products.json');
            this.products = await response.json();
            this.startNewGame();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please refresh the page.');
        }
    }

    startNewGame() {
        // Reset game state
        this.currentAttempt = 0;
        this.gameWon = false;
        this.gameOver = false;
        
        // Select random product
        this.currentProduct = this.products[Math.floor(Math.random() * this.products.length)];
        
        // Update UI
        this.updateProductDisplay();
        this.resetGuessRows();
        this.resetInput();
        this.hideGameMessage();
        this.hideNewGameButton();
        
        // Enable input
        this.priceInput.disabled = false;
        this.submitButton.disabled = false;
        
        // Focus on input
        this.priceInput.focus();
    }

    updateProductDisplay() {
        this.productImage.src = this.currentProduct.image;
        this.productImage.alt = this.currentProduct.name;
        this.productDescription.textContent = this.currentProduct.name;
    }

    resetGuessRows() {
        this.guessRows.forEach((row, index) => {
            const priceElement = row.querySelector('.guess-price');
            const feedbackElement = row.querySelector('.feedback-text');
            
            // Reset classes
            row.className = 'guess-row';
            
            // Reset content
            if (index === 0) {
                priceElement.textContent = '€0.00';
                feedbackElement.textContent = 'Start guessing!';
                feedbackElement.className = 'feedback-text start';
            } else {
                priceElement.textContent = '€0.00';
                feedbackElement.textContent = '';
                feedbackElement.className = 'feedback-text';
            }
        });
    }

    resetInput() {
        this.priceInput.value = '';
        this.priceInput.placeholder = 'Enter price (€)';
    }

    hideGameMessage() {
        this.gameMessage.style.display = 'none';
        this.gameMessage.className = 'game-message';
    }

    hideNewGameButton() {
        this.newGameButton.style.display = 'none';
    }

    showGameMessage(message, type) {
        this.gameMessage.textContent = message;
        this.gameMessage.className = `game-message ${type}`;
        this.gameMessage.style.display = 'block';
    }

    showNewGameButton() {
        this.newGameButton.style.display = 'inline-block';
    }

    showError(message) {
        this.showGameMessage(message, 'error');
    }

    submitGuess() {
        const guess = parseFloat(this.priceInput.value);
        
        // Validate input
        if (isNaN(guess) || guess < 0) {
            this.showError('Please enter a valid price (€0.00 or higher)');
            return;
        }

        // Round to 2 decimal places
        const roundedGuess = Math.round(guess * 100) / 100;
        
        // Update current guess row
        this.updateGuessRow(this.currentAttempt, roundedGuess);
        
        // Check if correct
        if (roundedGuess === this.currentProduct.price) {
            this.gameWon = true;
            this.gameOver = true;
            this.showGameMessage(`🎉 Correct! The price is €${this.currentProduct.price.toFixed(2)}. You won!`, 'win');
            this.endGame();
            return;
        }

        // Provide feedback
        const feedback = this.getFeedback(roundedGuess);
        this.updateFeedback(this.currentAttempt, feedback);
        
        // Move to next attempt
        this.currentAttempt++;
        
        // Check if game over
        if (this.currentAttempt >= this.maxAttempts) {
            this.gameOver = true;
            this.showGameMessage(`Game Over! The correct price was €${this.currentProduct.price.toFixed(2)}.`, 'lose');
            this.endGame();
            return;
        }

        // Clear input for next guess
        this.resetInput();
        this.priceInput.focus();
    }

    updateGuessRow(attemptIndex, price) {
        const row = this.guessRows[attemptIndex];
        const priceElement = row.querySelector('.guess-price');
        
        priceElement.textContent = `€${price.toFixed(2)}`;
        row.classList.add('active');
    }

    getFeedback(guess) {
        if (guess < this.currentProduct.price) {
            return {
                text: 'Higher',
                class: 'higher'
            };
        } else {
            return {
                text: 'Lower',
                class: 'lower'
            };
        }
    }

    updateFeedback(attemptIndex, feedback) {
        const row = this.guessRows[attemptIndex];
        const feedbackElement = row.querySelector('.feedback-text');
        
        feedbackElement.textContent = feedback.text;
        feedbackElement.className = `feedback-text ${feedback.class}`;
        
        // Update row styling based on feedback
        if (feedback.class === 'higher') {
            row.classList.add('incorrect');
        } else {
            row.classList.add('incorrect');
        }
    }

    endGame() {
        // Disable input
        this.priceInput.disabled = true;
        this.submitButton.disabled = true;
        
        // Show new game button
        this.showNewGameButton();
        
        // Remove active class from current row
        if (this.currentAttempt < this.maxAttempts) {
            this.guessRows[this.currentAttempt].classList.remove('active');
        }
        
        // Add correct styling to winning row if applicable
        if (this.gameWon) {
            this.guessRows[this.currentAttempt].classList.add('correct');
            const feedbackElement = this.guessRows[this.currentAttempt].querySelector('.feedback-text');
            feedbackElement.textContent = 'Correct!';
            feedbackElement.className = 'feedback-text correct';
        }
    }

    // Event handlers
    handleSubmitClick() {
        if (!this.gameOver) {
            this.submitGuess();
        }
    }

    handleNewGameClick() {
        this.startNewGame();
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !this.gameOver) {
            this.submitGuess();
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        this.submitButton.addEventListener('click', () => this.handleSubmitClick());
        this.newGameButton.addEventListener('click', () => this.handleNewGameClick());
        this.priceInput.addEventListener('keypress', (event) => this.handleKeyPress(event));
        
        // Prevent form submission on Enter in input
        this.priceInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new PriceGuesserGame();
    game.initializeEventListeners();
});

// Add some visual feedback for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to product image
    const productImage = document.getElementById('product-image');
    productImage.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    productImage.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
        this.alt = 'Image not available';
    });
    
    // Set initial opacity for smooth loading
    productImage.style.opacity = '0.7';
    productImage.style.transition = 'opacity 0.3s ease';
});
