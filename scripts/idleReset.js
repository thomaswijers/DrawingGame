const InactiveTimeMs = 30000;

var inactivityTime = function () {
    var time;
    // DOM Events
    window.addEventListener('load', resetTimer, true);
    var events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(function (name) {
        document.addEventListener(name, resetTimer, true);
    });

    function resetGame() {
        location.href = 'index.html';
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(resetGame, InactiveTimeMs)
    }

    resetTimer();
};

window.onload = function () {
    inactivityTime();
    // Maarten was here :3
}
