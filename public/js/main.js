//import {initializeApp} from 'firebase/app';
//import {getMessaging, getToken, onMessage} from 'firebase/messaging';

var rhythm = rhythm || {};
rhythm.FbAuthManager = null;
rhythm.FB_COLLECTION_USERSTATS = "userStats";
rhythm.FB_COLLECTION_SONGS = "songs";
rhythm.FB_KEY_ACCURACY = "accuracy";
rhythm.FB_KEY_HOURS_SPENT = "hoursSpent";
rhythm.FB_KEY_TOTAL_SCORE = "totalScore";
rhythm.FB_KEY_SONGS_PLAYED = "songsPlayed";
rhythm.FB_KEY_TOTAL_NOTES = "totalNotes";
rhythm.FB_KEY_OK = "ok";
rhythm.FB_KEY_GOOD = "good";
rhythm.FB_KEY_PERFECT = "perfect";
rhythm.FB_KEY_GREAT = "great";
rhythm.FB_KEY_KEYBINDS = ["keyBind0","keyBind1","keyBind2","keyBind3"];
rhythm.FB_KEY_OFFSET = "offset";

rhythm.validUser = false;
rhythm.userStatsManager = null;
rhythm.settingsManager = null;
//let settingsManager = null;
//const firebase = require('firebase');
//require('firebase/firestore');
//user = currently signed in user

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
   }

rhythm.main = function () {
	rhythm.userStatsManager = new rhythm.UserStatsManager();

	console.log("checking auth...")

	
    firebase.auth().onAuthStateChanged((user) => {
		if (user) {
		  var displayName = user.displayName;
		  var email = user.email;
		  var phoneNumber = user.phoneNumber;
		  var photoURL = user.photoURL;
		  var isAnonymous = user.isAnonymous;
		  window.signedInUser = user.uid;
		  console.log("set uid to "+window.signedInUser);
		  var providerData = user.providerData;
		  rhythm.settingsManager = new rhythm.SettingsManager(window.signedInUser);
		  rhythm.validUser = true;
		  // ...
		  console.log("The user is signd in " , window.signedInUser);
		  console.log('displayName :>> ', displayName);
		  console.log('email :>> ', email);
		  console.log('photoURL :>> ', photoURL);
		  console.log('phoneNumber :>> ', phoneNumber);
		  console.log('isAnonymous :>> ', isAnonymous);
		  console.log('uid :>> ', window.signedInUser);
		  //make sure auth stuff finishes before initializepage is called
		  setTimeout(rhythm.initializePage,600,rhythm.settingsManager.getSignedInUser());
		} else {
		  // User is signed out
		  // ...
		  console.log("There is no user signed in");
		  rhythm.validUser = false;
		   //make sure auth stuff finishes before initializepage is called
		   setTimeout(rhythm.initializePage,600,null);
		}
	  })
	  
	//setTimeout(console.log,600,("uid after auth: "+window.signedInUser));


	//console.log("called initializepage. uid is ..."+rhythm.settingsManager.getSignedInUser());
	//rhythm.initializePage(uid);
}

rhythm.initializePage = function (signedInUserUid) {
	const urlParams = new URLSearchParams(window.location.search);
	console.log("signedInUserUid): "+ signedInUserUid);

	if(document.querySelector("#loginPage")) {
		console.log("on login page");
		const loginPageController = new rhythm.LoginPageController();
		//loginPageController.startFirebaseUI();
	}

	if(document.querySelector("#signOutPage")) {

		console.log(`sign out`);
		firebase.auth().signOut().then(() => {
			// Sign-out successful.
			console.log("You are now signed out");
			window.location.replace("/log-in.html");
		  }).catch((error) => {
			// An error happened.
			console.log("sign out error");
			window.location.replace("/log-in.html");
		  });

	}

	if(document.querySelector("#globalLeaderboard")) {
		console.log("on ldb");
		const globalLeaderboardController = new rhythm.GlobalLeaderboardController();
		globalLeaderboardController.updateLeaderboard();
	}

	if(document.querySelector("#settingsPage")) {
		const settingsPageController = new rhythm.SettingsPageController();
		settingsPageController.updateView();
		//console.log(settingsPageController.getKeybinds()); // added
	}

	if(document.querySelector("#statsPage")) {
		console.log("on stats page");
		let user = "";
		let signedIn = false;
		console.log(urlParams.get("id"));
		//creates a new page controller based on the user id given in the URL
		if(urlParams.get("id") == "me"){
			user = signedInUserUid;
			signedIn = true;
			console.log('id is me. user is..'+signedInUserUid);
		}
		else{
			user = urlParams.get("id");
		}
		rhythm.statsPageController = new rhythm.StatsPageController(user, signedIn);
		rhythm.statsPageController.updateView();
	}

	if (document.querySelector("#gamePage")) {
		let gamePageController = new rhythm.GamePageController();
	}

}

rhythm.LoginPageController = class {

	constructor() {
	const inputEmailEl = document.querySelector("#inputEmail");
	const inputPasswordEl = document.querySelector("#inputPassword");
	//const user = null;

    document.querySelector("#signUpButton").onclick = (event) => {
		console.log(`Create account for Email: ${inputEmailEl.value} Password: ${inputPasswordEl.value}`)
		event.preventDefault();
		firebase.auth().createUserWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value)
		.then((userCredential) => {
		  // Signed in 
		  var user = userCredential.user;
		  console.log(user);
		  //initializes stats
		  rhythm.userStatsManager.add(user.uid,0,0,0,0,0,0,0,0,0);
		  // ...
		  document.getElementById("errorText").innerHTML = `Welcome to Rhythm Haven, user +${user.uid}`;
		})
		.catch((error) => {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log("Create Account error", errorCode, errorMessage);
		  document.getElementById("errorText").innerHTML = errorMessage;
		  // ..
		});

	}

    document.querySelector('#signOutButton').onclick = (event) => {
        console.log(`sign out`);
		firebase.auth().signOut().then(() => {
			// Sign-out successful.
			console.log("You are now signed out");
			document.getElementById("errorText").innerHTML = `You are now signed out.`;
		  }).catch((error) => {
			// An error happened.
			console.log("sign out error");
			document.getElementById("errorText").innerHTML = `Sign out error ):`;
		  });
    }

    document.querySelector("#signInButton").onclick = (event) => {
		console.log(`Log in for Email: ${inputEmailEl.value} Password: ${inputPasswordEl.value}`)
		
		firebase.auth().signInWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value)
		.then((userCredential) => {
		  // Signed in
		  var user = userCredential.user;
		  document.getElementById("errorText").innerHTML = `Welcome back, user +${user.uid}`;

		  // ...
		})
		.catch((error) => {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log("Login error", errorCode, errorMessage);
		  document.getElementById("errorText").innerHTML = `Login error: +${errorMessage}`;
		  console.log(document.getElementById("errorText").innerHTML);
		});
	}
	}
	startFirebaseUI = function(){

		// FirebaseUI config.
		var uiConfig = {
			signInSuccessUrl: '/',
			signInOptions: [
			  // Leave the lines as is for the providers you want to offer your users.
			  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			  firebase.auth.EmailAuthProvider.PROVIDER_ID,
			  firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			  firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
			],
		  };
	
		  // Initialize the FirebaseUI Widget using Firebase.
		  var ui = new firebaseui.auth.AuthUI(firebase.auth());
		  // The start method will wait until the DOM is loaded.
		  ui.start('#firebaseui-auth-container', uiConfig);
	}

}

rhythm.UserStatsManager = class {
	constructor(){
		console.log("created user stats manager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhythm.FB_COLLECTION_USERSTATS);
	    this._unsubscribe = null;
		this.searchId = null;

		//this.beginListening(this.getUserByUid.bind(this));
	}

	add(uid,accuracy,hoursSpent,totalScore,totalNotes,songsPlayed,ok,good,perfect,great) {
		console.log("creating new user entry with uid: ");
		console.log(uid);
		this._ref.doc(uid).set({
			[rhythm.FB_KEY_TOTAL_SCORE]: totalScore,
			[rhythm.FB_KEY_ACCURACY]:accuracy,
			[rhythm.FB_KEY_HOURS_SPENT]: hoursSpent,
			[rhythm.FB_KEY_TOTAL_NOTES]: totalNotes,
			[rhythm.FB_KEY_SONGS_PLAYED]: songsPlayed,
			[rhythm.FB_KEY_OK]: ok,
			[rhythm.FB_KEY_GOOD]: good,
			[rhythm.FB_KEY_GREAT]: great,
			[rhythm.FB_KEY_PERFECT]: perfect,
			[rhythm.FB_KEY_KEYBINDS[0]]: "d",
			[rhythm.FB_KEY_KEYBINDS[1]]: "f",
			[rhythm.FB_KEY_KEYBINDS[2]]: "j",
			[rhythm.FB_KEY_KEYBINDS[3]]: "k",
			[rhythm.FB_KEY_OFFSET]: 0
		})
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding document: ", error);
		})
		//console.log("UID: "+uid);
		//docRef.id = uid;
		//console.log("UID: "+docRef.id);
	}

	beginListening(changeListener) {

		let query = this._ref.orderBy(rhythm.FB_KEY_TOTAL_SCORE, "desc").limit(50);

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	  }

	stopListening() {  
		this._unsubscribe();
	  }


	get length() {  
		return this._documentSnapshots.length;
	  }
	
	getUserAtIndex(index) {  
		const docSnapshot = this._documentSnapshots[index];
		const userAtIndex = new rhythm.User(
			docSnapshot.id,
			docSnapshot.get(rhythm.FB_KEY_ACCURACY),
			docSnapshot.get(rhythm.FB_KEY_HOURS_SPENT),
			docSnapshot.get(rhythm.FB_KEY_TOTAL_SCORE),
			docSnapshot.get(rhythm.FB_KEY_TOTAL_NOTES),
			docSnapshot.get(rhythm.FB_KEY_SONGS_PLAYED),
			docSnapshot.get(rhythm.FB_KEY_OK),
			docSnapshot.get(rhythm.FB_KEY_GOOD),
			docSnapshot.get(rhythm.FB_KEY_PERFECT),
			docSnapshot.get(rhythm.FB_KEY_GREAT)
		);
		return userAtIndex;
	  }
	
	getUserByUid(theUid) {
		const db = firebase.firestore().collection(rhythm.FB_COLLECTION_USERSTATS);
		console.log("call made to getUserByUid with paramater "+theUid);

		//const docRef = doc(db, FB_COLLECTION_USERSTATS, uid);
        //const docSnapshot = getDoc(docRef);
		let docSnapshot = null;

		for (let i = 0; i< this._documentSnapshots.length; i++) {
			let doc = this._documentSnapshots[i];
			console.log(`running search. parsing db for user: ${theUid}`);
			console.log("current id: "+doc.id);
			if(`${doc.id}` == theUid){
				docSnapshot = doc;
				console.log("found user!" + `${docSnapshot.id}`);
				console.log(docSnapshot);
				break;
			}
		}

		//user not found
		if(docSnapshot == null){
			return null;
		}
		
		const userByUid = new rhythm.User(
			docSnapshot.id,
			docSnapshot.get(rhythm.FB_KEY_ACCURACY),
			docSnapshot.get(rhythm.FB_KEY_HOURS_SPENT),
			docSnapshot.get(rhythm.FB_KEY_TOTAL_SCORE),
			docSnapshot.get(rhythm.FB_KEY_TOTAL_NOTES),
			docSnapshot.get(rhythm.FB_KEY_SONGS_PLAYED),
			docSnapshot.get(rhythm.FB_KEY_OK),
			docSnapshot.get(rhythm.FB_KEY_GOOD),
			docSnapshot.get(rhythm.FB_KEY_PERFECT),
			docSnapshot.get(rhythm.FB_KEY_GREAT)
		);
		console.log("finished running getuserbyuid");
		return userByUid; 
	}

}

rhythm.User = class{
	constructor(uid,accuracy,hoursSpent,totalScore,totalNotes,songsPlayed,ok,good,perfect,great){
		this.uid = uid;
		this.accuracy = accuracy;
		this.hoursSpent = hoursSpent;
		this.totalScore = totalScore;
		this.totalNotes = totalNotes;
		this.songsPlayed = songsPlayed;
		this.ok = ok;
		this.good = good;
		this.great = great;
		this.perfect = perfect;
	}
}

rhythm.SettingsManager = class {


	constructor(signedInUserUid){
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhythm.FB_COLLECTION_USERSTATS).doc(signedInUserUid);
		this.signedInUserUid = signedInUserUid;
		console.log("settings manager created!");
		console.log("signed in user from settings manager: "+signedInUserUid);

	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document!");
			}
		});
		}
	
		stopListening() {
		  this._unsubscribe();
		}

	updateKeybinds(a,b,c,d){
		console.log("updating keybinds!");
		this._ref.update({
			[rhythm.FB_KEY_KEYBINDS[0]]: a,
			[rhythm.FB_KEY_KEYBINDS[1]]: b,
			[rhythm.FB_KEY_KEYBINDS[2]]: c,
			[rhythm.FB_KEY_KEYBINDS[3]]: d,
		})
		.then(() => {
			console.log("Document successfully updated!");
			console.log(rhythm.FB_KEY_KEYBINDS[0]);
			console.log(rhythm.FB_KEY_KEYBINDS[1]);
			console.log(rhythm.FB_KEY_KEYBINDS[2]);
			console.log(rhythm.FB_KEY_KEYBINDS[3]);
		})
		.catch(function(error) {
			console.error("Error updating document: ", error);
		});
	}

	getKeybinds(){
		console.log("getting keybinds");
		console.log(this._documentSnapshot.data());
		return [this._documentSnapshot.data().keyBind0,this._documentSnapshot.data().keyBind1,
			this._documentSnapshot.data().keyBind2,this._documentSnapshot.data().keyBind3
		];
	}

	getSignedInUser(){
		return this.signedInUserUid;
	}

	updateOffset(offset){
		console.log("updating offset!");
		this._ref.update({
			[rhythm.FB_KEY_OFFSET]: offset
		})
		.then(() => {
			console.log("Document successfully updated!");
		})
		.catch(function(error) {
			console.error("Error updating document: ", error);
		});
		console.log(`new offset: ${this._documentSnapshot.get(rhythm.FB_KEY_OFFSET)}`);
	}

	offset(){
		return this._documentSnapshot.get(rhythm.FB_KEY_OFFSET);
	}

	getPlayerStats() {
		return [this._documentSnapshot.get(rhythm.FB_KEY_TOTAL_NOTES),
		this._documentSnapshot.get(rhythm.FB_KEY_PERFECT), 
		this._documentSnapshot.get(rhythm.FB_KEY_GREAT), 
		this._documentSnapshot.get(rhythm.FB_KEY_GOOD), 
		this._documentSnapshot.get(rhythm.FB_KEY_TOTAL_SCORE), 
		this._documentSnapshot.get(rhythm.FB_KEY_SONGS_PLAYED),
		this._documentSnapshot.get(rhythm.FB_KEY_HOURS_SPENT)]
	}

}

rhythm.SettingsPageController = class {

	constructor(){
		console.log('settings page controller loaded!')

		rhythm.settingsManager.beginListening(this.updateView.bind(this));

		document.querySelector("#submitKeybindsButton").addEventListener("click", (event) => {
		let binds = ["0","0","0","0"];

			for(let i=0;i<=3;i++){
				binds[i] = document.getElementById(`${i}`).value;
			}
		
		console.log(`submitting binds: ${binds}`);
		rhythm.settingsManager.updateKeybinds(binds[0],binds[1],binds[2],binds[3]);
		this.updateView();
		});

		document.querySelector("#submitOffsetButton").addEventListener("click", (event) => {
		let offset = document.getElementById('offsetInput').value.parseInt();
		rhythm.settingsManager.updateOffset(offset);
		this.updateView();
		});	
	}

	updateView(){
		//show current keybinds
		let keybinds = rhythm.settingsManager.getKeybinds();
		console.log(`keybinds: +${keybinds}`);
		for(let i = 0;i<=3;i++){
			document.getElementById(`${i}`).setAttribute("placeholder",`${keybinds[i]}`);
		}

		//show current offset
		let offset = rhythm.settingsManager.offset();
		document.getElementById("offsetInput").setAttribute("placeholder",`${offset}`);
	}

}

rhythm.GlobalLeaderboardController = class {
	
	constructor(){
	console.log("created leaderboard controller");

	//start listening
	rhythm.userStatsManager.beginListening(this.updateLeaderboard.bind(this));
	}

	updateLeaderboard(){

		//create new table
		const newTable = htmlToElement(`
			<div class="progress-table" id="leaderboardTable">
				<div class="table-head">
					<div class="serial">#</div>
					<div class="uid country">User</div>
					<div class="score visit">Total Score</div>
					<div class="accuracy percentage">Accuracy</div>
				</div>
			</div>
		`)

		//populate new table
		for(let i=0; i< rhythm.userStatsManager.length; i++){
			const user = rhythm.userStatsManager.getUserAtIndex(i);
			
			const newEntry = this._createEntry(user,i+1);
			newTable.appendChild(newEntry);
		
		}

		//remove old table
		const oldTable = document.querySelector("#leaderboardTable");
		oldTable.removeAttribute("id");
		oldTable.hidden = true;

		//add new table
		const container = document.getElementById("leaderboardTableContainer");
		container.appendChild(newTable);


	}

	_createEntry(user,place){
		return htmlToElement(
`
<div class="table-row userEntry" id="${user.uid}">
<div class="serial">${place}</div>
<div class="uid country"><a href="stats.html?id=${user.uid}">${user.uid}</a></div>
<div class="score visit">${user.totalScore}</div>
<div class="percentage accuracy">
	<div class="progress">
		<div class="progress-bar color-5" role="progressbar" style="width: ${user.accuracy}%" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
	</div>
</div>
</div>
`
		)
	}
}

rhythm.StatsPageController = class {
	
	constructor(pageUserUid,signedIn) {
		console.log("created statspg controller");
		console.log("pageUserUid: "+pageUserUid);
		this.signedIn = signedIn;
		rhythm.userStatsManager.beginListening(this.updateView.bind(this));
		this.pageUserUid = pageUserUid;
		this.pageUserObject;

	}

	updateView() {
		const title = document.querySelector("#statsTitle");
		console.log("Calling updateview");
		console.log("this.pageUserUid = "+this.pageUserUid);
		this.pageUserObject = rhythm.userStatsManager.getUserByUid(this.pageUserUid);
		console.log("page user: ");
		console.log(this.pageUserObject);

			//if signed in user = the specified uid, set the title to my stats
			if(this.signedIn){
				console.log("signed in");
				title.innerHTML = 
				`
				<h2>My Stats</h2>
				<h1>My Stats</h1>
				`;
			}
			else{
				console.log("not signed in");
				title.innerHTML = 
				`
				<h2>${this.pageUserObject.uid}'s Stats</h2>
				<h1>${this.pageUserObject.uid}'s Stats</h1>
				`;
			}
		
			//updates all the stats
			console.log("updating stats!");
			document.getElementById("songsPlayedText").innerHTML = this.pageUserObject.songsPlayed;
			console.log(this.pageUserObject.totalScore);
			console.log(this.pageUserObject.totalNotes);
			console.log(document.getElementById("songsPlayedText"));
			document.getElementById("totalScoreText").innerHTML = this.pageUserObject.totalScore;
			document.getElementById("accuracyText").innerHTML = `${this.pageUserObject.accuracy}%`;
			document.getElementById("hoursSpentText").innerHTML = this.pageUserObject.hoursSpent;
			document.getElementById("totalHitsText").innerHTML = this.pageUserObject.totalNotes;
			document.getElementById("perfectText").innerHTML = this.pageUserObject.perfect;
			document.getElementById("greatText").innerHTML = this.pageUserObject.great;
			document.getElementById("goodText").innerHTML = this.pageUserObject.good;
			document.getElementById("okText").innerHTML = this.pageUserObject.ok;


	}

}

rhythm.Game = class {
    constructor() {
        let page = window.location.pathname.split("/").pop();
        this.cycles = 0;
        this.score = 0;
        this.noteStreak = 0;
        this.isPaused = false;
        this.totalNotes = 0;
        this.perfectNotes = 0;
        this.greatNotes = 0;
        this.goodNotes = 0;
        if (page == 'Test-Game.html'){
            this.level = [
                [1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1],
                [0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0],
                [0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1],
                [0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0]]
            this.initializeNotes();
            this.interval = setInterval(this.runOneCycle.bind(this), 25);
        }else if (page == 'Test-Game2.html'){
            this.level = [
                [1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1],
                [0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0],
                [0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1],
                [0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0]]
            this.initializeNotes();
            this.interval = setInterval(this.runOneCycle.bind(this), 18.33333);
        }else if (page == 'Test-Game3.html'){
            this.level = [
                [0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1],
                [0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0],
                [1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1],
                [0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0]]
            this.initializeNotes();
            this.interval = setInterval(this.runOneCycle.bind(this), 20);
        }
		this.totalCycles = (Math.max(this.level[0].length, this.level[1].length, this.level[2].length, this.level[3].length) * 20) + 140;
    }

    // Spawns all the notes in at the beginning of the game before any frames occur.
    // This was done instead of adding notes in as needed because that caused lag which wasn't able to be resolved. 
    initializeNotes() {
        let x = null;
		let noteContainer = document.querySelector("#noteContainer");
        for (let i = 0; i < this.level[0].length; i++) {
            if (this.level[0][i] == 1) {
                x = this.createNoteElement("leftNote", (-100 * (i + 1)));
                noteContainer.appendChild(x);
                this.totalNotes++;
            } else if (this.level[1][i] == 1) {
                x = this.createNoteElement("leftMiddleNote", (-100 * (i + 1)));
                noteContainer.appendChild(x);
                this.totalNotes++;
            } else if (this.level[2][i] == 1) {
                x = this.createNoteElement("rightMiddleNote", (-100 * (i + 1)));
                noteContainer.appendChild(x);
                this.totalNotes++;
            } else if (this.level[3][i] == 1) {
                x = this.createNoteElement("rightNote", (-100 * (i + 1)));
                noteContainer.appendChild(x);
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
		document.querySelector("#perfectNotes").innerHTML = `Perfect Notes: ${this.perfectNotes}`;
		document.querySelector("#greatNotes").innerHTML = `Great Notes: ${this.greatNotes}`;
		document.querySelector("#goodNotes").innerHTML = `Good Notes: ${this.goodNotes}`;
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
            if (rhythm.validUser && this.cycles == this.totalCycles) {
                console.log("Final Total Notes", this.totalNotes);
                console.log("Final Perfect Notes", this.perfectNotes);
                console.log("Final Great Notes", this.greatNotes);
                console.log("Final Good Notes", this.goodNotes);
				console.log("Final Score: ", this.score);
				document.querySelector("#perfectNotes").hidden = false;
				document.querySelector("#greatNotes").hidden = false;
				document.querySelector("#goodNotes").hidden = false;
				this.postToPersonalStats();
            }
        }
    }

    // Pauses the game. 
    pause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            document.querySelector("#beatIt").pause();
        } else {
            document.querySelector("#beatIt").play();        
        }
    }

    endGame() {
        clearInterval(this.interval);
    }

    postToLeaderboard() {

    }

    postToPersonalStats() {
		let stats = rhythm.settingsManager.getPlayerStats();
		console.log("Previous Total Notes: ", stats[0]);
		let totalNotes = stats[0];
		console.log("Previous Perfect Notes: ", stats[1]);
		let perfectNotes = stats[1];
		console.log("Previous  Great Notes: ", stats[2]);
		let greatNotes = stats[2];
		console.log("Previous Good Notes: ", stats[3]);
		let goodNotes = stats[3];
		console.log("Previous Total Score: ", stats[4]);
		let totalScore = stats[4];
		console.log("Previous Songs Played: ", stats[5]);
		let totalSongs = stats[5];
		console.log("Previous Hours Played: ", stats[6])
		let totalHours = stats[6];
		let newTotal = totalNotes + this.totalNotes;
		let newPerfect = perfectNotes + this.perfectNotes
		let newGreat = greatNotes + this.greatNotes
		let newGood = goodNotes + this.goodNotes
		rhythm.settingsManager._ref.update({
			[rhythm.FB_KEY_TOTAL_NOTES]: (newTotal),
			[rhythm.FB_KEY_PERFECT]: (newPerfect),
			[rhythm.FB_KEY_GREAT]: (newGreat),
			[rhythm.FB_KEY_GOOD]: (newGood),
			[rhythm.FB_KEY_TOTAL_SCORE]: (totalScore + this.score),
			[rhythm.FB_KEY_SONGS_PLAYED]: (totalSongs + 1),
			[rhythm.FB_KEY_HOURS_SPENT]: (totalHours + 0.064),
			[rhythm.FB_KEY_ACCURACY]: ((((newPerfect + newGreat + newGood) * 100)/(newTotal)).toFixed(3)),
		})
		.then( () => {console.log("Post to stats successful?")})
		.catch( (error) => {console.log("error: ", error)})

    }

	// Creates a note giving it the classes note and noteType while also setting its height to height. 
	createNoteElement (noteType, height) {
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
	handleScoringNotes(noteType) {
		if (!this.isPaused){
			let Notes = document.querySelectorAll(noteType);
			Notes.forEach((note) => {
				if (note.dataset.scored == "false") {
					let y = parseInt(note.dataset.height);
					if (y >= 500 && y <= 505) {
						note.dataset.scored = "hit";
						console.log("perfect");
						this.noteStreak++;
						this.perfectNotes++;
						this.updateScore(25);
					} else if (y >= 485 && y <= 520) {
						note.dataset.scored = "hit";
						console.log("great");
						this.noteStreak++;
						this.greatNotes++;
						this.updateScore(10);
					} else if (y >= 465 && y <= 540) {
						note.dataset.scored = "hit";
						console.log("good");
						this.noteStreak++;
						this.goodNotes++;
						this.updateScore(5);
					}
				}
			})
		}
	}

	handlePressed(press){
		document.querySelector(".baseNote" + press).style = "filter: hue-rotate(40deg) grayscale(0%);"
		setTimeout(() => {
			document.querySelector(".baseNote" + press).style = "filter: grayscale(100%);"
		}, 110)
	}
}

rhythm.GamePageController = class {
	constructor() {
		console.log("Game page");

		document.querySelector("#pause").onclick = () => {
			this.publicGame.pause();
		}

		document.querySelector("#restart").onclick = () => {
			location.reload();
		}

		document.querySelector("#mainMenu").onclick = () => {
			location.replace("https://rhythm-heaven-292e7.web.app/"); // Needs to be changed when deployed
		}

		document.querySelector("#begin").onclick = () => {
			this.publicGame = new rhythm.Game();
			if (rhythm.validUser) {
				rhythm.settingsManager.beginListening(this.initializeKeyBinds.bind(this));
			} else {
				this.initializeKeyBinds();
			}
			document.querySelector("#beatIt").play();
			document.querySelector("#begin").hidden = true;
			document.querySelector("#pause").hidden = false;
			document.querySelector("#restart").hidden = false;
			document.querySelector("#mainMenu").hidden = false;
    }
	}

	// initialized the keyboard event listener to call handleScoringNotes
	initializeKeyBinds() {
		let keybinds = ["d", "f", "j", "k"];
		console.log("valid user: ", rhythm.validUser);
		if (rhythm.validUser) {
			let keybinds = rhythm.settingsManager.getKeybinds();
			console.log("Key Binds: ", keybinds);
		}
		document.addEventListener("keydown", (event) => {
			if (this.publicGame) {
				switch(event.key) {
					case keybinds[0]:
						this.publicGame.handleScoringNotes(".leftNote");
						this.publicGame.handlePressed("1");
						return;
					case keybinds[1]:
						this.publicGame.handleScoringNotes(".leftMiddleNote");
						this.publicGame.handlePressed("2");
						return;
					case keybinds[2]:
						this.publicGame.handleScoringNotes(".rightMiddleNote");
						this.publicGame.handlePressed("3");
						return;
					case keybinds[3]:
						this.publicGame.handleScoringNotes(".rightNote");
						this.publicGame.handlePressed("4");
						return;
					case "p":
						this.publicGame.pause();
						return;
					case "Escape":
						this.publicGame.pause();
					default:
						return;
				}
			}
		})
	}
}

rhythm.main();