$(document).ready(function () {
    let currentPos = 0, totalCharsTyped = 0, correctCharsTyped = 0, startTime, timerStarted = false, testDuration = 60, interval;
    let currentParaIndex = -1;

    const typingArea = $('.typing-area'), timerDisplay = $('.timer'), typeSound = $('#typeSound')[0];
    const startModal = $('#startModal'), resultModal = $('#resultModal'), resultText = $('#resultText');

    $('.time-btn').click(function () {
        testDuration = $(this).data('time');
        timerDisplay.text(testDuration);
        startModal.removeClass('show');
        $('.container').show();
        generateTest();
    });

    function generateTest() {
        let previousIndex = currentParaIndex;
        do {
            currentParaIndex = Math.floor(Math.random() * paras.length);
        } while (paras.length > 1 && currentParaIndex === previousIndex);

        const test = paras[currentParaIndex];
        let content = "";
        test.split('').forEach((char, i) => {
            content += `<span id="char-${i}">${char}</span>`;
        });
        typingArea.html(content);
        currentPos = 0;
        updateCursor();
    }

    function updateCursor() {
        $('span').removeClass('cursor');
        $(`#char-${currentPos}`).addClass('cursor');
        scrollToCurrentCharacter();
    }

    function scrollToCurrentCharacter() {
        let $currentChar = $(`#char-${currentPos}`);
        if ($currentChar.length) {
            let charTop = $currentChar.position().top;
            let typingAreaOffset = $('.typing-area').offset().top;
            let charPosition = charTop - typingAreaOffset;
            let typingAreaHeight = $('.typing-area').height();

            if (charPosition > typingAreaHeight * 0.8) {
                $('.typing-area').animate({
                    scrollTop: $('.typing-area').scrollTop() + charPosition - typingAreaHeight * 0.8
                }, 100);
            }
        }
    }

    function startTimer() {
        startTime = new Date().getTime();
        interval = setInterval(() => {
            const elapsedTime = (new Date().getTime() - startTime) / 1000;
            const remainingTime = testDuration - Math.floor(elapsedTime);
            timerDisplay.text(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(interval);
                $(document).off('keypress keydown');
                const minutes = elapsedTime / 60;
                const wpm = Math.round((correctCharsTyped / 5 / minutes) || 0);
                const accuracy = Math.round((correctCharsTyped / totalCharsTyped) * 100) || 0;
                resultText.html(`Speed: ${wpm} WPM<br>Accuracy: ${accuracy}%`);
                resultModal.addClass('show');
            }
        }, 1000);
    }

    $(document).on('keypress', function (e) {
        if (!timerStarted) {
            startTimer();
            timerStarted = true;
        }
        typeSound.currentTime = 0;
        typeSound.play();
        let charTyped = String.fromCharCode(e.which);
        let correctChar = $(`#char-${currentPos}`).text();
        totalCharsTyped++;
        if (charTyped === correctChar) {
            $(`#char-${currentPos}`).removeClass('incorrect').addClass('correct');
            correctCharsTyped++;
            currentPos++;
            if (currentPos >= paras[currentParaIndex].length) {
                generateTest();
            }
        } else {
            $(`#char-${currentPos}`).removeClass('correct').addClass('incorrect');
        }
        updateCursor();
    });

    $(document).on('keydown', function (e) {
        if (e.key === "Backspace" && currentPos > 0) {
            currentPos--;
            totalCharsTyped--;
            if ($(`#char-${currentPos}`).hasClass('correct')) {
                correctCharsTyped--;
            }
            $(`#char-${currentPos}`).removeClass('correct incorrect');
            updateCursor();
            e.preventDefault();

            $('span').slice(currentPos).removeClass('incorrect');
        }
    });

    startModal.addClass('show');
});
