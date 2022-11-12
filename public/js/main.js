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
rhythm.FB_KEY_KEYBINDS = ["keyBind0","keyBind1","keyBind2","keyBind3"]
rhythm.FB_KEY_OFFSET = "offset";

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
	//settingsManager = null;
	rhythm.userStatsManager = new rhythm.UserStatsManager();
	//const app = initializeApp(firebaseConfig);
	//const db = getFirestore(app);

	//firebase.initializeApp();

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
		  // ...
		  console.log("The user is signd in " , window.signedInUser);
		  console.log('displayName :>> ', displayName);
		  console.log('email :>> ', email);
		  console.log('photoURL :>> ', photoURL);
		  console.log('phoneNumber :>> ', phoneNumber);
		  console.log('isAnonymous :>> ', isAnonymous);
		  console.log('uid :>> ', window.signedInUser);
		} else {
		  // User is signed out
		  // ...
		  console.log("There is no user signed in");
		}
	  })
	  
	setTimeout(console.log,600,("uid after auth: "+window.signedInUser));

	//make sure auth stuff finishes before initializepage is called
	
	setTimeout(rhythm.initializePage,600,window.signedInUser);
	console.log("called initializepage. uid is ..."+window.signedInUser);
	//rhythm.initializePage(uid);
}

rhythm.initializePage = function (signedInUserUid) {
	const urlParams = new URLSearchParams(window.location.search);
	console.log("signedInUserUid): "+ signedInUserUid);

	if(document.querySelector("#loginPage")) {
		console.log("on login page");
		const loginPageController = new rhythm.LoginPageController();
		loginPageController.startFirebaseUI();
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
		  console.log("Create Account error", errorCode, errorMessage);
		  document.getElementById("errorText").innerHTML = `Create account error: +${errorMessage}`;
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
		console.log("settings manager created!");

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

rhythm.main();