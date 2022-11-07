import {initializeApp} from 'firebase/app';
import {getMessaging, getToken, onMessage} from 'firebase/messaging';

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
const firebase = require('firebase');
require('firebase/firestore');
//user = currently signed in user



function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
   }

rhythm.main = function () {
	rhythm.UserStatsManager = new rhythm.UserStatsManager();
	const app = initializeApp(firebaseConfig);
	const db = getFirestore(app);

	firebase.initializeApp();

	
    firebase.auth().onAuthStateChanged((user) => {
		if (user) {
		  var displayName = user.displayName;
		  var email = user.email;
		  var phoneNumber = user.phoneNumber;
		  var photoURL = user.photoURL;
		  var isAnonymous = user.isAnonymous;
		  var uid = user.uid;
		  var providerData = user.providerData;
		  rhythm.settingsManager = new rhythm.SettingsManager(uid);
		  // ...
		  console.log("The user is signd in " , uid);
		  console.log('displayName :>> ', displayName);
		  console.log('email :>> ', email);
		  console.log('photoURL :>> ', photoURL);
		  console.log('phoneNumber :>> ', phoneNumber);
		  console.log('isAnonymous :>> ', isAnonymous);
		  console.log('uid :>> ', uid);
		} else {
		  // User is signed out
		  // ...
		  console.log("There is no user signed in");
		}
	  });

	rhythm.initializePage(user.uid);
}

rhythm.initializePage = function (signedInUserUid) {
	const urlParams = new URLSearchParams(window.location.search);

	if(document.querySelector("#loginPage")) {
		console.log("on login page");
		rhythm.loginPageController = new rhythm.LoginPageController();
		rhythm.loginPageController.startFirebaseUI();
	}

	if(document.querySelector("#signOutPage")) {
		if(user){
		console.log(`sign out`);
		firebase.auth().signOut().then(() => {
			// Sign-out successful.
			console.log("You are now signed out");
		  }).catch((error) => {
			// An error happened.
			console.log("sign out error");
		  });
		}
		//no user signed in
		else {
			window.location.replace("/log-in.html");
		}
	}

	if(document.querySelector("#globalLeaderboard")) {
		console.log("on ldb");
		rhythm.globalLeaderboardController = new rhythm.GlobalLeaderboardController();
		globalLeaderboardController.updateLeaderboard();
	}

	if(document.querySelector("#settingsPage")) {
		rhythm.settingsPageController = new rhythm.SettingsPageController();
		settingsPageController.updateView();
	}

	if(document.querySelector("#statsPage")) {
		console.log("on stats page");
		//creates a new page controller based on the user id given in the URL
		if(urlParams == "me"){
			urlParams = signedInUserUid;
		}
		rhythm.statsPageController = new rhythm.StatsPageController(urlParams);
		statsPageController.updateView();
	}

}

rhythm.LoginPageController = class {

	constructor() {
	const inputEmailEl = document.querySelector("#inputEmail");
	const inputPasswordEl = document.querySelector("#inputPassword");

    document.querySelector("#signUpButton").onclick = (event) => {
		console.log(`Create account for Email: ${inputEmailEl.value} Password: ${inputPasswordEl.value}`)
		
		firebase.auth().createUserWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value)
		.then((userCredential) => {
		  // Signed in 
		  var user = userCredential.user;
		  // ...
		})
		.catch((error) => {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log("Create Account error", errorCode, errorMessage);
		  // ..
		});



	}

    document.querySelector('#signOutButton').onclick = (event) => {
        console.log(`sign out`);
		firebase.auth().signOut().then(() => {
			// Sign-out successful.
			console.log("You are now signed out");
		  }).catch((error) => {
			// An error happened.
			console.log("sign out error");
		  });
    }

    document.querySelector("#signInButton").onclick = (event) => {
		console.log(`Log in for Email: ${inputEmailEl.value} Password: ${inputPasswordEl.value}`)
		
		firebase.auth().signInWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value)
		.then((userCredential) => {
		  // Signed in
		  var user = userCredential.user;
		  // ...
		})
		.catch((error) => {
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  console.log("Create Account error", errorCode, errorMessage);
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
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhythm.FB_COLLECTION_USERSTATS);
	    this._unsubscribe = null;
	}

	add(uid,accuracy,hoursSpent,totalScore,totalNotes,ok,good,perfect,great) {
		this._ref.add({
			[rhit.FB_KEY_TOTAL_SCORE]: totalScore,
			[rhit.FB_KEY_ACCURACY]:accuracy,
			[rhit.FB_KEY_HOURS_SPENT]: hoursSpent,
			[rhit.FB_KEY_TOTAL_NOTES]: totalNotes,
			[rhit.FB_KEY_OK]: ok,
			[rhit.FB_KEY_GOOD]: good,
			[rhit.FB_KEY_GREAT]: great,
			[rhit.FB_KEY_PERFECT]: perfect
		})
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding document: ", error);
		})
		docRef.id = uid;
	}

	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_TOTAL_SCORE, "desc").limit(50);

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
			docSnapshot.get(rhit.FB_KEY_ACCURACY),
			docSnapshot.get(rhit.FB_KEY_HOURS_SPENT),
			docSnapshot.get(rhit.FB_KEY_TOTAL_SCORE),
			docSnapshot.get(rhit.FB_KEY_TOTAL_NOTES),
			docSnapshot.get(rhit.FB_KEY_SONGS_PLAYED),
			docSnapshot.get(rhit.FB_KEY_OK),
			docSnapshot.get(rhit.FB_KEY_GOOD),
			docSnapshot.get(rhit.FB_KEY_PERFECT),
			docSnapshot.get(rhit.FB_KEY_GREAT)
		);
		return userAtIndex;
	  }
	
	getUserByUid(uid) {
		const db = firebase.firestore().collection(rhythm.FB_COLLECTION_USERSTATS);
		
		const docRef = doc(db, FB_COLLECTION_USERSTATS, uid);
        //const docSnap = await getDoc(docRef);

		
		const userByUid = new rhythm.User(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_ACCURACY),
			docSnapshot.get(rhit.FB_KEY_HOURS_SPENT),
			docSnapshot.get(rhit.FB_KEY_TOTAL_SCORE),
			docSnapshot.get(rhit.FB_KEY_TOTAL_NOTES),
			docSnapshot.get(rhit.FB_KEY_SONGS_PLAYED),
			docSnapshot.get(rhit.FB_KEY_OK),
			docSnapshot.get(rhit.FB_KEY_GOOD),
			docSnapshot.get(rhit.FB_KEY_PERFECT),
			docSnapshot.get(rhit.FB_KEY_GREAT)
		);
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
		this._ref.update({
			[rhythm.FB_KEY_KEYBINDS[0]]: a,
			[rhythm.FB_KEY_KEYBINDS[1]]: b,
			[rhythm.FB_KEY_KEYBINDS[2]]: c,
			[rhythm.FB_KEY_KEYBINDS[3]]: d,
		})
		.then(() => {
			console.log("Document successfully updated!");
		})
		.catch(function(error) {
			console.error("Error updating document: ", error);
		});
	}

	getKeybinds(){
		return [this._documentSnapshot.get(rhythm.FB_KEY_KEYBINDS[0]),
		this._documentSnapshot.get(rhythm.FB_KEY_KEYBINDS[1]),
		this._documentSnapshot.get(rhythm.FB_KEY_KEYBINDS[2]),
		this._documentSnapshot.get(rhythm.FB_KEY_KEYBINDS[3])
		];
	}

	updateOffset(offset){
		this._ref.update({
			[rhythm.FB_KEY_OFFSET]: offset
		})
		.then(() => {
			console.log("Document successfully updated!");
		})
		.catch(function(error) {
			console.error("Error updating document: ", error);
		});
	}

	get offset(){
		return this._documentSnapshot.get(rhit.FB_KEY_OFFSET);
	}

}


rhythm.SettingsPageController = class {

	constructor(){
		//no user signed in, then redirect
		if(rhythm.settingsManager == null){
			window.location.href = "/log-in.html";
		}

		document.querySelector("#submitKeybindsButton").addEventListener("click", (event) => {
		let binds = [0,0,0,0];

			for(let i=0;i<3;i++){
				binds[i] = getElementById(`${i}`).value;
			}
			
		rhythm.settingsManager.updateKeybinds(binds[0],binds[1],binds[2],binds[3]);
		this.updateView();
		}

		document.querySelector("#submitOffsetButton").addEventListener("click", (event) => {

		let offset = getElementById(`offsetInput`).value.parseInt();
		rhythm.settingsManager.updateOffset(offset);
		this.updateView();
		}	
	}

	updateView(){
		//show current keybinds
		let keybinds = rhythm.settingsManager.getKeybinds();
		for(let i = 0;i<3;i++){
			getElementById(`${i}`).style.placeholder = keybinds[i];
		}

		//show current offset
		let offset = rhythm.settingsManager.offset();
		getElementById("offsetInput").style.placeholder = offset;
	}

}


rhythm.GlobalLeaderboardController = class {
	
	constructor(){
	console.log("created leaderboard controller");

	//start listening
	rhythm.UserStatsManager.beginListening(this.updateList.bind(this));
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
			
			const newEntry = this._createEntry(user);
			newTable.appendChild(newEntry);
		
		}

		//remove old table
		const oldTable = document.querySelector("#leaderboardTable");
		oldTable.removeAttribute("id");
		oldTable.hidden = true;

		//add new table
		const container = document.getElementById("leaderboardTableContainer");
		container.appendChild(newEntry);


	}

	_createEntry(user){
		return htmlToElement(
`
<div class="table-row userEntry" id="${user.uid}">
<div class="serial"></div>
<div class="uid country">${user.uid}</div>
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
	constructor(pageUserUid) {
		this.pageUserObject = getUserByUid(pageUserUid);
		rhythm.userStatsManager.beginListening(this.updateView.bind(this));
	}

	updateView() {
		const title = document.querySelector("#statsTitle");

			//if signed in user = the specified uid, set the title to my stats
			if(user.uid == this.pageUserObject.uid){
				title.innerHtml = 
				`
				<h2>My Stats</h2>
				<h1>My Stats</h1>
				`;
			}
			else{
				title.innerHtml = 
				`
				<h2>${pageUserObject.uid}'s Stats</h2>
				<h1>${pageUserObject.uid}'s Stats</h1>
				`;
			}
		
			//updates all the stats
			document.querySelector("#songsPlayedText").innerHtml = pageUserObject.songsPlayed;
			document.querySelector("#totalScoreText").innerHtml = pageUserObject.totalScore;
			document.querySelector("#accuracyText").innerHtml = `${pageUserObject.accuracy}%`;
			document.querySelector("#hoursSpentText").innerHtml = pageUserObject.hoursSpent;
			document.querySelector("#totalHitsText").innerHtml = pageUserObject.totalNotes;
			document.querySelector("#perfectText").innerHtml = pageUserObject.perfect;
			document.querySelector("#greatText").innerHtml = pageUserObject.great;
			document.querySelector("#goodText").innerHtml = pageUserObject.good;
			document.querySelector("#okText").innerHtml = pageUserObject.ok;


	}

}

rhythm.main();