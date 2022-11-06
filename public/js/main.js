var rhythm = rhythm || {};
rhythm.FbAuthManager = null;
rhythm.FB_COLLECTION_USERSTATS = "userStats";
rhythm.FB_COLLECTION_SONGS = "songs";


function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
   }

rhythm.main = function () {
    firebase.auth().onAuthStateChanged((user) => {
		if (user) {
		  var displayName = user.displayName;
		  var email = user.email;
		  var phoneNumber = user.phoneNumber;
		  var photoURL = user.photoURL;
		  var isAnonymous = user.isAnonymous;
		  var uid = user.uid;
		  var providerData = user.providerData;
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
}

rhythm.GlobalLeaderboardController = class {
	constructor(){

	}

	updateList(){

	}

	_createEntry(uid){
		return htmlToElement(
`
<div class="table-row" id="${uid}">
<div class="serial">05</div>
<div class="country"> <img src="img/elements/f5.jpg" alt="flag">Australia</div>
<div class="visit">645032</div>
<div class="percentage">
	<div class="progress">
		<div class="progress-bar color-5" role="progressbar" style="width: 40%" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
	</div>
</div>
</div>
`
		)
	}
}



rhythm.main();