var app = angular.module('FitnessApp', []);

app.controller('MainCtrl', function ($scope, $interval, $timeout) {
    console.log("App Started!");

    $scope.page = 1;

    // Swipe game state
    $scope.timer = 30;
    $scope.score = 0;
    $scope.currentCardIndex = 0;
    $scope.cards = [];
    $scope.currentCard = null;
    var timerInterval = null;
    var isDragging = false;
    var startX = 0;
    var currentX = 0;

    // All available card images
    var razorCards = [
        { image: './Razor/1 Harsh, clinical copy.png', type: 'razor' },
        { image: './Razor/2 Razor Cuts copy.png', type: 'razor' },
        { image: './Razor/3 Cuts hair copy.png', type: 'razor' },
        { image: './Razor/4 Frustration, copy.png', type: 'razor' },
        { image: './Razor/5 Dryness copy.png', type: 'razor' },
        { image: './Razor/6 Hair grows back copy.png', type: 'razor' },
        { image: './Razor/7 Risky for copy.png', type: 'razor' },
        { image: './Razor/8 Prickly regrowth copy.png', type: 'razor' },
        { image: './Razor/9 Nicks, cuts, irritation, copy.png', type: 'razor' },
        { image: './Razor/10 Under arm darkening copy.png', type: 'razor' }
    ];

    var veetCards = [
        { image: './Veet/10 Smooth Skin copy.png', type: 'veet' },
        { image: './Veet/2 dermatologically tested copy.png', type: 'veet' },
        { image: './Veet/3 28 Days copy.png', type: 'veet' },
        { image: './Veet/4 Cuts hair copy.png', type: 'veet' },
        { image: './Veet/5 Feels cool, copy.png', type: 'veet' },
        { image: './Veet/7 Hydrates, copy.png', type: 'veet' },
        { image: './Veet/9 Safe and suitable for copy.png', type: 'veet' }
    ];

    // Shuffle array helper
    function shuffle(array) {
        var shuffled = array.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }

    $scope.getPercentage = function() {
        var total = $scope.cards.length || 10;
        var pct = ($scope.score / total) * 100;
        return Math.min(100, Math.max(0, pct));
    };

    // Pick 6 random from each category and combine
    function generateDeck() {
        var shuffledRazor = shuffle(razorCards);
        var shuffledVeet = shuffle(veetCards);
        var picked = shuffledRazor.slice(0, 6).concat(shuffledVeet.slice(0, 6));
        return shuffle(picked);
    }

    // Start the game
    $scope.startGame = function () {
        $scope.page = 3;
        $scope.timer = 30;
        $scope.score = 0;
        $scope.currentCardIndex = 0;
        $scope.cards = generateDeck();
        $scope.currentCard = $scope.cards[0];

        // Start countdown timer
        if (timerInterval) $interval.cancel(timerInterval);
        timerInterval = $interval(function () {
            $scope.timer--;
            if ($scope.timer <= 0) {
                $interval.cancel(timerInterval);
                timerInterval = null;
                endGame();
            }
        }, 1000);

        // Setup touch/mouse events after DOM renders
        $timeout(function () {
            setupSwipeEvents();
        }, 100);
    };

    function endGame() {
        if (timerInterval) {
            $interval.cancel(timerInterval);
            timerInterval = null;
        }
        if ($scope.score >= 10) {
            $scope.page = 4; // Win
        } else {
            $scope.page = 5; // Lose
        }
    }

    // Swipe card programmatically (from button clicks)
    $scope.swipeCard = function (direction) {
        if (!$scope.currentCard) return;
        animateSwipe(direction);
    };

    function animateSwipe(direction) {
        var card = document.getElementById('swipe-card');
        if (!card) return;

        card.classList.add('animating');
        if (direction === 'left') {
            card.classList.add('swipe-left');
        } else {
            card.classList.add('swipe-right');
        }

        // Check if correct
        var isCorrect = false;
        if (direction === 'left' && $scope.currentCard.type === 'razor') {
            isCorrect = true;
        } else if (direction === 'right' && $scope.currentCard.type === 'veet') {
            isCorrect = true;
        }

        var borderEl = document.querySelector('.correct-sel-border');
        if (isCorrect) {
            $scope.score++;
            if (borderEl) {
                borderEl.classList.remove('fade-out');
                borderEl.classList.add('correct-answer');
            }
        }

        // Wait for animation to complete, then show next card
        $timeout(function () {
            if (borderEl && isCorrect) {
                borderEl.classList.remove('correct-answer');
                borderEl.classList.add('fade-out');
                $timeout(function () {
                    if (borderEl) borderEl.classList.remove('fade-out');
                }, 500);
            }
            $scope.currentCardIndex++;
            if ($scope.currentCardIndex < $scope.cards.length) {
                $scope.currentCard = $scope.cards[$scope.currentCardIndex];
                $timeout(function () {
                    setupSwipeEvents();
                }, 50);
            } else {
                $scope.currentCard = null;
                endGame();
            }
        }, 400);
    }

    // Clamp drag distance so card stays within the game area border
    var maxDrag = 220;

    function getDragTransform(deltaX) {
        var clamped = Math.max(-maxDrag, Math.min(maxDrag, deltaX));
        var rotation = clamped * 0.05;
        var scale = 1 - Math.abs(clamped) / maxDrag * 0.15;
        var opacity = 1 - Math.abs(clamped) / maxDrag * 0.5;
        return {
            transform: 'translate(calc(-50% + ' + clamped + 'px), -50%) rotate(' + rotation + 'deg) scale(' + scale + ')',
            opacity: opacity
        };
    }

    // Setup touch and mouse drag events
    function setupSwipeEvents() {
        var card = document.getElementById('swipe-card');
        if (!card) return;

        // Reset classes and styles
        card.classList.remove('animating', 'swipe-left', 'swipe-right');
        card.style.transform = 'translate(-50%, -50%)';
        card.style.opacity = '1';

        // Touch events
        card.ontouchstart = function (e) {
            isDragging = true;
            startX = e.touches[0].clientX;
            currentX = startX;
            card.style.transition = 'none';
        };

        card.ontouchmove = function (e) {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.touches[0].clientX;
            var deltaX = currentX - startX;
            var styles = getDragTransform(deltaX);
            card.style.transform = styles.transform;
            card.style.opacity = styles.opacity;
        };

        card.ontouchend = function (e) {
            if (!isDragging) return;
            isDragging = false;
            var deltaX = currentX - startX;
            if (Math.abs(deltaX) > 80) {
                var direction = deltaX < 0 ? 'left' : 'right';
                $scope.$apply(function () {
                    animateSwipe(direction);
                });
            } else {
                // Snap back with spring feel
                card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
                card.style.transform = 'translate(-50%, -50%)';
                card.style.opacity = '1';
            }
        };

        // Mouse events for desktop
        card.onmousedown = function (e) {
            isDragging = true;
            startX = e.clientX;
            currentX = e.clientX;
            card.style.transition = 'none';
            e.preventDefault();
        };

        document.onmousemove = function (e) {
            if (!isDragging) return;
            currentX = e.clientX;
            var deltaX = currentX - startX;
            var styles = getDragTransform(deltaX);
            card.style.transform = styles.transform;
            card.style.opacity = styles.opacity;
        };

        document.onmouseup = function (e) {
            if (!isDragging) return;
            isDragging = false;
            var deltaX = currentX - startX;
            if (Math.abs(deltaX) > 80) {
                var direction = deltaX < 0 ? 'left' : 'right';
                $scope.$apply(function () {
                    animateSwipe(direction);
                });
            } else {
                // Snap back with spring feel
                card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
                card.style.transform = 'translate(-50%, -50%)';
                card.style.opacity = '1';
            }
        };
    }

    $scope.pg_up = function () {
        $scope.page++;
    };
});
