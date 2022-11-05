var rhit = rhit || {};

rhit.Game = class {
    constructor() {
        //Instance variables
        this.level = null;
        this.totalNotes = 0;
        this.perfectNotes = 0;
        this.greatNotes = 0;
        this.goodNotes = 0;
        this.score = 0;
        this.noteStreak = 0;
    }

    updateScore() {

    }

    begin() {

    }

    pause() {

    }

    checkForKeyPressed() {

    }

    postToLeaderboard() {

    }

    postToPersonalStats() {

    }
}

rhit.main = function () {
	console.log("Ready");
    const Notes = document.querySelectorAll(".note");
    let x = 0;
    document.querySelector("#moveDownButton").onclick = () => {
        Notes.forEach((note) => {
            let y = parseInt(note.dataset.height);
            note.style=`top: ${y}px`
            note.dataset.height = `${y + 10}`
        })
    }
};

rhit.main();