var rhit = rhit || {};

rhit.publicGame = null;

rhit.Game = class {
    constructor() {
        this.cycles = 0;
        this.score = 0;
        this.noteStreak = 0;
        this.isPaused = false;
        console.log(this.cycles);
        this.begin();
    }

    updateScore(scoreIncrease) {
        this.score += scoreIncrease;
        document.querySelector("#score").innerHTML = `Score: ${this.score}`;
        document.querySelector("#noteStreak").innerHTML = `Hit Streak: ${this.noteStreak}`;
    }

    begin() {
        setInterval(this.runOneCycle.bind(this), 40);
    }

    runOneCycle() {
        if (!this.isPaused) {
            this.cycles = this.cycles + 1;
            if (this.cycles % 20 == 0){
                // document.querySelector("#noteContainer").appendChild(createNoteElement("leftNote"));
            }
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
                if (y >= 1000) {
                    note.remove();
                }
            })
        }
    }

    pause() {
        this.isPaused = !this.isPaused;
    }

    checkForKeyPressed() {

    }

    postToLeaderboard() {

    }

    postToPersonalStats() {

    }
}

function pressedD (event) {
    if (event.key == "d") {
        console.log("pressed the d key");
    }
    removeEventListener("keydown", pressedD)
}

function createNoteElement (noteType) {
    let note = document.createElement('img');
    note.src="img/Music_Note.png";
    note.dataset.height = "-50";
    note.dataset.scored = "false";
    note.className = `note ${noteType}`; 
    return note; 
}

function handleScoringNotes(noteType) {
    let Notes = document.querySelectorAll(noteType);
        Notes.forEach((note) => {
            if (note.dataset.scored == "false") {
                let y = parseInt(note.dataset.height);
                if (y >= 500 && y <= 505) {
                    note.dataset.scored = "hit";
                    console.log("perfect");
                    rhit.publicGame.noteStreak++;
                    rhit.publicGame.updateScore(25);
                } else if (y >= 485 && y <= 520) {
                    note.dataset.scored = "hit";
                    console.log("great");
                    rhit.publicGame.noteStreak++;
                    rhit.publicGame.updateScore(10);
                } else if (y >= 465 && y <= 540) {
                    note.dataset.scored = "hit";
                    console.log("good");
                    rhit.publicGame.noteStreak++;
                    rhit.publicGame.updateScore(5);
                }
            }
        })
}

// _createCard(movieQuote) {
//     return htmlToElement(`<div class="card">
//     <div class="card-body">
//       <h5 class="card-title">${movieQuote.quote}</h5>
//       <h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
//     </div>
//   </div>`)
// }

rhit.main = function () {
	console.log("Ready");
    rhit.publicGame = new rhit.Game();

    document.addEventListener("keydown", (event) => {
        let Notes = null;
        switch(event.key) {
            case "d":
                handleScoringNotes(".leftNote");
                return;
            case "f":
                handleScoringNotes(".leftMiddleNote");
                return;
            case "j":
                handleScoringNotes(".rightMiddleNote");
                return;
            case "k":
                handleScoringNotes(".rightNote");
                return;
            default:
                return;
        }
    })

    document.querySelector("#pause").onclick = () => {
        rhit.publicGame.pause();
    }

    document.querySelector("#spawnLeftButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("leftNote"));
    }

    document.querySelector("#spawnLeftMiddleButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("leftMiddleNote"));
    }

    document.querySelector("#spawnRightMiddleButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("rightMiddleNote"));
    }

    document.querySelector("#spawnRightButton").onclick = () => {
        document.querySelector("#noteContainer").appendChild(createNoteElement("rightNote"));
    }
};

rhit.main();