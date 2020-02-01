// ===========================
// Helper Functions 
// ===========================


// DOM STUFF
const submitButton = document.querySelector('#submit-button')
const searchBar = document.querySelector("#barcode")
const responseContainer = document.querySelector("#response-container")
const productName = document.querySelector('#product-name')
const heading = document.querySelector('#heading')
const responseDescription = document.querySelector('#response-description')
const dietaryRequirementsSelectForm = document.querySelector("#dietary-preferences")
let options = document.getElementsByTagName('option')
const line = document.querySelector('.line')

//http://127.0.0.1:5000/query?barcode=737628064502&conditions={"gluten":1,"vegan":1,"vegetarian":0}

// Helper function to make requests 
// Local Url with Python File
//const url = "http://127.0.0.1:5000/query?barcode="

const hostApiUrl = "https://cors-anywhere.herokuapp.com/https://cardiffhack2020.herokuapp.com/?conditions="

const getFromApi = function(barcodeInput, funcToCall, jsonObj) {
	const convertedObj = JSON.stringify(jsonObj)
	const queryUrl = hostApiUrl + convertedObj + "&barcode=" + barcodeInput
	axios.get(queryUrl)
	.then(function(res) {
		funcToCall(res)
	})
}

submitButton.addEventListener("click", function() {
	line.style.display = "block"
	// VALUES ARRAY 
	let values = []
	let requirements = []

	Object.keys(options).forEach(function(item) {
		requirements.push(options[item].value)
		
		if (options[item].selected) {
			values.push(1)
		} else {
			values.push(0)
		}
	})

	//console.log(values)
	//console.log(requirements)
	var result = {};
	requirements.forEach((key, i) => result[key] = values[i]);
	console.log(result)
	// Declare barcode value
	const barcode = searchBar.value
	// Call Function to API
	getFromApi(barcode, renderResponse, result)
})

// DISPLAY RESULTS 

const renderResponse = function(responseObject) {
	console.log(responseObject)
	// =====
	// ADD IF STATEMENT TO CHECK IF INPUT VALUE IS NOT 1 DIGIT 2 DIGIT or 100 
	//=======
	// IF PRODUCT NOT FOUND
	if (responseObject.data.code === 0) {
		alert("Sorry! We couldn't find a product match.\n\nPlease try again !");
	} 
	// IF PRODUCT FOUND
	else {
		// Display response content
		responseContainer.style.display = "grid";
		// Create resopnse product name
		productName.innerHTML = "<span class='can-i-eat'> Can I eat ... </span>"  + responseObject.data.name + "?"
		// Create image tag 
		const image = document.createElement('img')
		// CHECK FOR RED, GREEN, YELLOW
		// Img class
		image.className = "trafficLight"
		// Green 
		if (responseObject.data.sem === "GREEN") {
			// Set SRC
			image.src = "https://svgur.com/i/HXk.svg"
			heading.innerHTML = "All Clear"
			responseDescription.innerHTML = "You can eat this!"
			// Create Product Image
			createProductImage(responseObject)
		} 
		// YELLOW
		else if (responseObject.data.sem === "YELLOW") {
			image.src = "https://svgur.com/i/HXt.svg"
			heading.innerHTML = "Hmmm ... "
			responseDescription.innerHTML = "Some of the ingredients could be a problem for you! See below. \n"
			const ingredients = document.createElement("p");
			ingredients.innerHTML = "Ingredients: " + responseObject.data.ingredients.maybe
			ingredients.className = "ingredients"
			responseContainer.appendChild(ingredients)
			// Create Product Image
			createProductImage(responseObject)
		}
		 // RED
		else {
			image.src = "https://svgur.com/i/HZW.svg"
			heading.innerHTML = "Don't Go There!"
			responseDescription.innerHTML = "You cannot eat this!"
			// Create Product Image
			createProductImage(responseObject)
		}
		responseContainer.fontFamily = 'Playflair Display'
		responseContainer.appendChild(image) 
		document.querySelector('#response-container').scrollIntoView({
			behavior: 'smooth'
		})
	}
}



// Create Image - Helper Function

const createProductImage = function(responseObject) {
	// Check if Image is present
	if (responseObject.data.image) {
		const productImage = document.createElement("img")
		productImage.src = responseObject.data.image
		productImage.className = "product-image"
		responseContainer.appendChild(productImage)
	} 
}

