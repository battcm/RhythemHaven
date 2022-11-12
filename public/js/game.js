var  rhit = rhit || {};

rhit.publicGame = null;

rhit.Game = class {
    constructor() {
        this.level = [
            [1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0], 
            [0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1], 
            [0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1], 
            [0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1]]
        this.cycles = 0;
        this.score = 0;
        this.noteStreak = 0;
        this.isPaused = false;
        this.totalNotes = 0;
        this.perfectNotes = 0;
        this.greatNotes = 0;
        this.goodNotes = 0;
        this.initializeNotes();
        const interval = setInterval(this.runOneCycle.bind(this), 20);
    }

    // Spawns all the notes in at the beginning of the game before any frames occur.
    // This was done instead of adding notes in as needed because that caused lag which wasn't able to be resolved. 
    initializeNotes() {
        let x = null;
        for (let i = 0; i < this.level[0].length; i++) {
            if (this.level[0][i] == 1) {
                x = createNoteElement("leftNote", (-100 * (i + 1)));
                document.querySelector("#noteContainer").appendChild(x);
                this.totalNotes++;
            } if (this.level[1][i] == 1) {
                x = createNoteElement("leftMiddleNote", (-100 * (i + 1)));
                document.querySelector("#noteContainer").appendChild(x);
                this.totalNotes++;
            } if (this.level[2][i] == 1) {
                x = createNoteElement("rightMiddleNote", (-100 * (i + 1)));
                document.querySelector("#noteContainer").appendChild(x);
                this.totalNotes++;
            } if (this.level[3][i] == 1) {
                x = createNoteElement("rightNote", (-100 * (i + 1)));
                document.querySelector("#noteContainer").appendChild(x);
                this.totalNotes++;
            }
        }
    }

    // Adds the given score to the current score and updates the scoreboard accordingly. 
    updateScore(scoreIncrease) {
        this.score += (scoreIncrease * this.generateScoreMultiplier());
        document.querySelector("#score").innerHTML = `Score: ${this.score}`;
        document.querySelector("#noteStreak").innerHTML = `Note Streak: ${this.noteStreak}`;
        document.querySelector("#scoreMultiplier").innerHTML = `Score Multiplier: ${this.generateScoreMultiplier()}`;
    }

    // Generates a score multiplier based on the current note streak
    generateScoreMultiplier() {
        if (this.noteStreak >= 100) {
            return 5;
        } else if (this.noteStreak >= 50) {
            return 3;
        } else if (this.noteStreak >= 10) {
            return 2;
        } else {
            return 1;
        }
    }

    // Runs one cycle of the game which involves moving the notes and removing those that fall off the screen.
    runOneCycle() {
        if (!this.isPaused) {
            this.cycles = this.cycles + 1;
            let Notes = document.querySelectorAll(".note");
            Notes.forEach((note) => {
                let y = parseInt(note.dataset.height);
                note.style=`top: ${y}px`;
                note.dataset.height = `${y + 5}`;
                if (y > 540 && note.dataset.scored == "false") {
                    note.dataset.scored = "miss";
                    this.noteStreak = 0;
                    this.updateScore(0);
                }
                if (y >= 635) {
                    note.remove();
                }
            })
            if (this.cycles == 500) {
                console.log(this.totalNotes);
                console.log(this.perfectNotes);
                console.log(this.greatNotes);
                console.log(this.goodNotes);
            }
        }
    }

    // Pauses the game. 
    pause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            document.querySelector("#restart").hidden = false;
            document.querySelector("#mainMenu").hidden = false;
        } else {
            document.querySelector("#restart").hidden = true; 
            document.querySelector("#mainMenu").hidden = false;          
        }
    }

    endGame() {
        clearInterval(this.interval);
    }

    postToLeaderboard() {

    }

    postToPersonalStats() {

    }
}

// Creates a note giving it the classes note and noteType while also setting its height to height. 
function createNoteElement (noteType, height) {
    let note = document.createElement('img');
    note.src="img/Neon_Arrow.png";
    note.dataset.height = height;
    note.style=`top: ${height}px`;
    note.dataset.scored = "false";
    note.className = `note ${noteType}`; 
    return note; 
}

// Checks to see if any note is within the scoring zone and scores the note accordingly
// Alos increments the perfect, great, and good note trackers accordingly. 
function handleScoringNotes(noteType) {
    if (!rhit.publicGame.isPaused){
        let Notes = document.querySelectorAll(noteType);
        Notes.forEach((note) => {
            if (note.dataset.scored == "false") {
                let y = parseInt(note.dataset.height);
                if (y >= 500 && y <= 505) {
                    note.dataset.scored = "hit";
                    console.log("perfect");
                    rhit.publicGame.noteStreak++;
                    rhit.publicGame.perfectNotes++;
                    rhit.publicGame.updateScore(25);
                } else if (y >= 485 && y <= 520) {
                    note.dataset.scored = "hit";
                    console.log("great");
                    rhit.publicGame.noteStreak++;
                    rhit.publicGame.greatNotes++;
                    rhit.publicGame.updateScore(10);
                } else if (y >= 465 && y <= 540) {
                    note.dataset.scored = "hit";
                    console.log("good");
                    rhit.publicGame.noteStreak++;
                    rhit.publicGame.goodNotes++;
                    rhit.publicGame.updateScore(5);
                }
            }
        })
    }
}

function handlePressed(press){
    document.querySelector(".baseNote" + press).style = "filter: hue-rotate(40deg) grayscale(0%);"
    setTimeout(() => {
        document.querySelector(".baseNote" + press).style = "filter: grayscale(100%);"
    }, 110)
}

rhit.main = function () {
	console.log("Ready");
    rhit.publicGame = new rhit.Game();

    // initialized the keyboard event listener to call handleScoringNotes
    document.addEventListener("keydown", (event) => {
        let Notes = null;
        switch(event.key) {
            case "d":
                handleScoringNotes(".leftNote");
                handlePressed("1");
                return;
            case "f":
                handleScoringNotes(".leftMiddleNote");
                handlePressed("2");
                return;
            case "j":
                handleScoringNotes(".rightMiddleNote");
                handlePressed("3");
                return;
            case "k":
                handleScoringNotes(".rightNote");
                handlePressed("4");
                return;
            case "p":
                rhit.publicGame.pause();
                return;
            case "Escape":
                rhit.publicGame.pause();
            default:
                return;
        }
    })

    document.querySelector("#pause").onclick = () => {
        rhit.publicGame.pause();
    }

    document.querySelector("#restart").onclick = () => {
        location.reload();
    }

    document.querySelector("#mainMenu").onclick = () => {
        location.replace("http://localhost:5000/index.html"); // Needs to be changed when deployed
    }

};

rhit.main();