var rhit = rhit || {};

rhit.publicGame = null;

rhit.Game = class {
    constructor() {
        this.cycles = 0;
        this.score = 0;
        this.isPaused = false;
        console.log(this.cycles);
        this.begin();
    }

    updateScore() {
        document.querySelector("#score").innerHTML = `Score: ${this.score}`;
    }

    begin() {
        setInterval(this.runOneCycle.bind(this), 40);
    }

    runOneCycle() {
        if (!this.isPaused) {
            // console.log("one game cycle");
            this.cycles = this.cycles + 1;
            let Notes = document.querySelectorAll(".note");
            Notes.forEach((note) => {
                let y = parseInt(note.dataset.height);
                note.style=`top: ${y}px`;
                note.dataset.height = `${y + 5}`;
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
    note.dataset.height = "0";
    note.dataset.isScored = "false";
    note.className = `note ${noteType}`; 
    return note; 
}

function checkScoringNotes() {
    
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
                Notes = document.querySelectorAll(".leftNote");
                Notes.forEach((note) => {
                    if (note.dataset.scored == "false") {
                        console.log("left note not scored");
                        let y = parseInt(note.dataset.height);
                        if (y >= 350) {
                            rhit.publicGame.score += 5;
                            rhit.publicGame.updateScore();
                            note.dataset.scored = "true";
                        }
                    }
                })
                return;
            case "f":
                Notes = document.querySelectorAll(".leftMiddleNote");
                Notes.forEach((note) => {
                    if (note.dataset.scored == "false") {
                        console.log("left middle note not scored");
                        let y = parseInt(note.dataset.height);
                        if (y >= 350) {
                            rhit.publicGame.score += 5;
                            rhit.publicGame.updateScore();
                            note.dataset.scored = "true";
                        }
                    }
                })
                return;
            case "j":
                Notes = document.querySelectorAll(".rightMiddleNote");
                Notes.forEach((note) => {
                    if (note.dataset.scored == "false") {
                        console.log("right middle note not scored");
                        let y = parseInt(note.dataset.height);
                        if (y >= 350) {
                            rhit.publicGame.score += 5;
                            rhit.publicGame.updateScore();
                            note.dataset.scored = "true";
                        }
                    }
                })
                return;
            case "k":
                Notes = document.querySelectorAll(".rightNote");
                Notes.forEach((note) => {
                    if (note.dataset.scored == "false") {
                        console.log("right note not scored");
                        let y = parseInt(note.dataset.height);
                        if (y >= 350) {
                            rhit.publicGame.score += 5;
                            rhit.publicGame.updateScore();
                            note.dataset.scored = "true";
                        }
                    }
                })
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