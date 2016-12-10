//Made by, and copyright, @trevorsargent 2016

//p rints a line of text to the screen
function println(line) {
	if (line) {
		arr = line.split('\n');
		for (var i = 0; i < arr.length; i++) {
			$("<p>" + arr[i].trim() + "</p>")
				.insertBefore("#placeholder")
		}
	}
}

//a dds a blank line
function line() {
	$("<p></br></p>")
		.insertBefore("#placeholder")
}

// adds a number of blank lines
function lineNum(int) {
	for (var i = 0; i < int; i++) {
		line()
	}
}

// prints the welcome message
function printWelcome(welcomeText) {
	lineNum(8)
	println(welcomeText)
	line()
}

function trimInput(input, string) {
	return input.replace(string, "")
		.trim()
		.replace("the ", "")
		.replace("a ", "")
		.replace("to ", "")
		.trim();
}

// returns a description of a 'place'
function description(place, places) {
	var toReturn = "you're standing in the " + place.name + "."
	if (place.left != undefined) {
		toReturn += "</br>on your left is the " + places[place.left].name + "."
	}
	if (place.right != undefined) {
		toReturn += "</br>on your right is the " + places[place.right].name + "."
	}
	if (place.ahead != undefined) {
		toReturn += "</br>ahead of you is the " + places[place.ahead].name + "."
	}
	if (place.behind != undefined) {
		toReturn += "</br>behind you is the " + places[place.behind].name + "."
	}
	if (!place.settings.beenHere && place.messages.newText != "") {
		toReturn += "</br></br>" + place.messages.newText + "."
	}
	return toReturn
}

//returns a formatted list of everything in a hash
function hashList(hash, error) {
	var toReturn = ""
	if (Object.keys(hash)
		.length > 0) {
		for (var item in hash) {
			toReturn += item + ": (" + hash[item] + ") \n"
		}
		return toReturn
	} else {
		return error
	}
}

// adds an item a hash
function hashAdd(string, list) {
	if (string in list) {
		list[string]++
	} else {
		list[string] = 1
	}
	return list
}

// removes an item from a hash
function hashRemove(string, list) {
	if (string in list) {
		list[string]--
			if (list[string] <= 0) {
				delete list[string]
			}
	}
	return list
}

function canSee(player) {

	if (player.currentLocation.settings.islit) {
		return true
	}
	for (e in player.settings.lamps) {
		if (player.pockets[player.settings.lamps[e]]) {
			return true
		}
	}
	return false
}

//walks to the place
function walkTo(player, destination, places, defaults) {
	player.currentLocation.settings.beenHere = true
	destination = applyPlaceDefaults(placeFromString(placeName, places), defaults)
	player.currentLocation = destination
	return player
}

// returns whether a place is accessabel from another place
function locationIsAccessable(dest, source, places) {
	if (dest === undefined) {
		return false
	}
	if (places[source.ahead] === dest) {

		return true
	}
	if (places[source.behind] === dest) {
		return true
	}
	if (places[source.right] === dest) {
		return true
	}
	if (places[source.left] === dest) {
		return true
	}
	if (places[source.above] === dest) {
		return true
	}
	if (places[source.below] === dest) {
		return true
	}
	return false
}

function unlockLocation(destination, pockets) {
	if (pockets[destination.settings.key] && destination.settings.leaveUnlocked) {
		destination.settings.isLocked = false
	}
	return destination
}

function locationIsLocked(destination, pockets) {
	if (destination.settings.isLocked) {
		if (pockets[destination.settings.key]) {
			return false
		}
		return true
	}
	return false
}

// return an item in exchange for another item, based on the place
function exchange(item, place) {
	if (item in place.exchanges) {
		return place.exchanges[item]
	}
}

function placeFromString(placeName, places) {
	for (var e in places) {
		if (places[e].name == placeName) {
			return places[e]
		}
	}
}

//adds the gramatically appropriate article to the string passed
function addArticle(string) {
	var vowels = ['a', 'e', 'i', 'o', 'u'];
	var article;
	if (vowels.includes(string.charAt(0))) {
		article = "an ";
	} else {
		article = "a "
	}
	return article + " " + string;
}

function applyPlaceDefaults(place, defaults) {
	place.settings = place.settings || {}
	place.settings.beenHere = place.settings.beenHere || defaults.place.settings.beenHere
	place.settings.isLocked = place.settings.isLocked || defaults.place.settings.isLocked
	place.settings.isLit = place.settings.isLit || defaults.place.settings.isLit
	place.messages = place.messages || {}
	place.objects = place.objects || {}
	return place
}

// process the input from each command
function processInput(input, data) {

	// store in inputHistory

	if (input.length > 0) {
		println(">> " + input)
		line()
	}

	//ask for help
	if (input.indexOf("help") > -1) {
		println('possible commands:')
		println('- look around')
		println('- pockets')
		println('- items')
		println('- walk to [name of place]')
		println('- drop [item]')
		println('- take [item]')

		//look around describe where you are
	} else if (input.indexOf(data.commands.observe) > -1) {
		if (canSee(data.player)) {

			println(description(data.player.currentLocation, data.places))
		} else {
			println(data.messages.visibilityError)
		}

		//walk places
	} else if (input.indexOf(data.commands.move) > -1) {
		// input = input.replace("walk to", "").trim().input.replace("the", "").trim()
		placeName = trimInput(input, data.commands.move)
		place = placeFromString(placeName, data.places)
		if (place != undefined) {
			place = applyPlaceDefaults(place, data.defaults)
			if (locationIsAccessable(place, data.player.currentLocation, data.places) && place != undefined) {
				if (!locationIsLocked(place, data.player.pockets)) {
					data.player = walkTo(data.player, placeName, data.places, data.defaults)
					if (data.player.currentLocation.settings.isLocked) {
						println(data.player.currentLocation.messages.successEntryGranted)
					}
					data.player.currentLocation = unlockLocation(data.player.currentLocation, data.player.pockets)
					if (data.player.currentLocation.leaveUnlocked) {
						println(data.player.currentLocation.messages.unlock)
					}
					println(data.messages.moveMessage + placeName)
				} else {
					println(place.messages.locked)
				}
			} else {
				println(data.messages.moveError)
			}
		} else {
			println(data.messages.moveError)
		}


		//take items
	} else if (input.indexOf(data.commands.gainItem) > -1) {
		// TODO: take logic
		item = trimInput(input, data.commands.gainItem)
		if (item in data.player.currentLocation.objects) {
			data.player.currentLocation.objects = hashRemove(item, data.player.currentLocation.objects)
			data.player.pockets = hashAdd(item, data.player.pockets)
			println(data.messages.pickUpSuccess + addArticle(item))
		} else {
			println(data.messages.pickUpError + addArticle(item))
		}

		//drop items
	} else if (input.indexOf(data.commands.loseItem) > -1) {
		item = trimInput(input, data.commands.loseItem)
		if (item in data.player.pockets) {
			data.player.pockets = hashRemove(item, data.player.pockets)
			data.player.currentLocation.objects = hashAdd(item, data.player.currentLocation.objects)
			println(data.messages.dropSuccess + addArticle(item))
		} else {
			println(data.messages.dropError + addArticle(item))
		}

		//take inventory
	} else if (input.indexOf(data.commands.inventory) > -1) {
		if (data.player.pockets != {}) {
			println(hashList(data.player.pockets, data.messages.inventoryError))
		}

		//see what items are in the room.
	} else if (input.indexOf(data.commands.perceiveItems) > -1) {
		println(hashList(data.player.currentLocation.objects))

	} else {
		if (input.length > 0) {
			println(data.messages.commandInvalid)
		}
	}
	return data
}

$(document)
	.ready(function () {

		var data
		let inputHistory = new Array()
		let numInputs = 0
		let selectInput = 0

		$.getJSON("roms/carnival.json", function (json) {
			// console.log(json); // this will show the info it in firebug console
			data = json
			data.player.currentLocation = applyPlaceDefaults(data.places[data.player.settings.startingPlace], data.defaults)
			printWelcome(data.messages.welcomeText);
			//$("#image")
			//.attr("src", data.settings["background-url"])
			$("title")
				.html(data.settings.title)
			$("#logo")
				.html(data.settings.title)
				//on pressing enter after providing a command

		})

		$("form")
			.submit(function () {
				let input = $('#command_line')
					.val()
				input = input.trim();

				inputHistory.push(input)
				numInputs += 1
				selectInput = numInputs

				data = processInput(input, data)

				$("html, body")
					.animate({
						scrollTop: $(document)
							.height()
					}, 500)
				line()
				$("#command_line")
					.val("")
			})

		$(document)
			.on("keyup", function (e) {
				var code = e.which
				if (code == 38) { //up
					if (selectInput > 0) {
						selectInput--
						//alert(inputHistory[selectInput])
						$('#command_line')
							.val(inputHistory[selectInput])
					}
				} else if (code == 40) { //down

					if (selectInput < numInputs) {
						selectInput++
						$('#command_line')
							.val(inputHistory[selectInput])
					} else if (selectInput === numInputs) {
						$('#command_line')
							.val("")
					}
				}
			})

	})
