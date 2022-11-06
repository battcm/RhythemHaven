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

rhit.game = function () {
	console.log("Ready");
    document.querySelector("#moveDownButton").onclick = () => {
        const Notes = document.querySelectorAll(".note");
        Notes.forEach((note) => {
            let y = parseInt(note.dataset.height);
            note.style=`top: ${y}px`
            note.dataset.height = `${y + 10}`
            if (y == 200) {
                switch (note.className) {
                    case "note leftNote":
                        console.log("left");
                        document.addEventListener("keydown", (event) => {
                            if (event.key == "d") {
                                console.log("pressed the d key");
                            }
                            removeEventListener("keydown", )
                        })
                        break;
                    case "note leftMiddleNote":
                        console.log("leftMiddle");
                        document.addEventListener("keydown", (event) => {
                            if (event.key == "f") {
                                console.log("pressed the f key");
                            }
                        })
                        break;
                    case "note rightMiddleNote":
                        console.log("rightMiddle");
                        document.addEventListener("keydown", (event) => {
                            if (event.key == "j") {
                                console.log("pressed the j key");
                            }
                        })
                        break;
                    case "note rightNote":
                        console.log("right");
                        document.addEventListener("keydown", (event) => {
                            if (event.key == "k") {
                                console.log("pressed the k key");
                            }
                        })
                        break;
                    default:
                        break; 
                }
            }
        })
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

function pressedD (event) {
    if (event.key == "d") {
        console.log("pressed the d key");
    }
    removeEventListener("keydown", pressedD)
}

function createNoteElement (noteType) {
    const note = document.createElement('img');
    note.src="img/Music_Note.png";
    note.dataset.height = "0";
    note.className = `note ${noteType}`; 
    return note; 
}

// _createCard(movieQuote) {
//     return htmlToElement(`<div class="card">
//     <div class="card-body">
//       <h5 class="card-title">${movieQuote.quote}</h5>
//       <h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
//     </div>
//   </div>`)
// }

rhit.game();