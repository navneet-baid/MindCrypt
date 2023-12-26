let currentRuleIndex = 0;
let captcha = generateDynamicCaptcha();
let wordleSolution = "";
const cookieName = "wordleSolution";
const cookieExpirationHours = 24; document.getElementById("password-input").addEventListener("input", async function () {
    await checkPassword();
});


const rules = [
    { id: 1, regex: /.{5,}/, message: "Password must be at least 5 characters." },
    { id: 2, regex: /\d/, message: "Password must include a number." },
    { id: 3, regex: /[A-Z]/, message: "Password must include an uppercase letter." },
    { id: 4, customValidation: (input) => includesSpecialSequence(input), message: "Password must include a special character." },
    { id: 5, customValidation: (input) => sumOfDigits(input) === 25, message: "The digits in your password must add up to 25." },
    { id: 6, customValidation: (input) => includesSpecialMonthSequence(input), message: "Password must include a special month sequence." },
    { id: 7, customValidation: (input) => includesRomanNumeral(input), message: "Password must include a roman numeral." },
    { id: 8, customValidation: (input) => includesSpecialBrandSequence(input), message: "Password must include a special brand sequence." },
    { id: 9, customValidation: (input) => productOfRomanNumerals(input) === 35, message: "The roman numerals in your password should multiply to 35." },
    { id: 10, customValidation: (input) => includesTwoLetterSymbol(input), message: "Password must include a two-letter symbol from the periodic table." },
    { id: 11, customValidation: (input) => includesMoonPhaseEmoji(input), message: "Password must include the moon as an emoji." },
    { id: 12, customValidation: (input) => includesDynamicCaptcha(input), message: "Password must include the captcha." },
    {
        id: 13,
        customValidation: (input) => {
            return input.toLowerCase().includes(wordleSolution.toLowerCase());
        },
        message: "Guess today's Wordle solution."
    },
];

// Function to set a cookie
function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie value
function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name + "=") === 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return "";
}

async function getWordleSolution() {
    // Check if Wordle solution is stored in cookies
    const storedWordleSolution = getCookie(cookieName);
    if (storedWordleSolution) {
        return storedWordleSolution;
    }

    const apiUrl = 'https://wordle-game-api1.p.rapidapi.com/word';
    const headers = {
        'X-RapidAPI-Key': '637997a13bmsh97aa6457997d1adp1c21afjsnafc7367ce97c',
        'X-RapidAPI-Host': 'wordle-game-api1.p.rapidapi.com',
    };

    try {
        const response = await fetch(apiUrl, { headers });
        const data = await response.json();

        if (response.ok) {
            // Save Wordle solution in cookies
            wordleSolution = data.word;
            setCookie(cookieName, wordleSolution, cookieExpirationHours);
            return wordleSolution;
        } else {
            console.error('Error fetching Wordle solution:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching Wordle solution:', error.message);
        return null;
    }
}

const levelConditions = {
    1: (input) => true, // Add condition for Level 1
    2: (input) => rules[1].customValidation(input), // Passes Level 2 if Rule 2 is satisfied
    3: (input) => rules[2].customValidation(input), // Passes Level 3 if Rule 3 is satisfied
    4: (input) => includesSpecialSequence(input), // Passes Level 4 if a special sequence is present
    5: (input) => rules[4].customValidation(input), // Passes Level 5 if Rule 5 is satisfied
    6: (input) => includesSpecialMonthSequence(input), // Passes Level 6 if a special month sequence is present
    7: (input) => rules[6].customValidation(input), // Passes Level 7 if Rule 7 is satisfied
    8: (input) => includesSpecialBrandSequence(input), // Passes Level 8 if a special brand sequence is present
    9: (input) => productOfRomanNumerals(input) === 35,
    10: (input) => rules[9].customValidation(input),
    11: (input) => rules[10].customValidation(input),
    12: (input) => rules[11].customValidation(input),
    13: (input) => rules[12].customValidation(input),
    // Add conditions for other levels
};

function generateDynamicCaptcha() {
    // Generate a dynamic captcha (replace this with your captcha generation logic)
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const captchaLength = 6;
    let captcha = "";
    for (let i = 0; i < captchaLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        captcha += characters.charAt(randomIndex);
    }
    return captcha;
}

function checkPassword() {
    console.log(currentRuleIndex)
    const userInput = document.getElementById("password-input").value;
    let ruleResult

    // Check each rule up to the current level
    for (let i = 0; i <= currentRuleIndex && i < rules.length; i++) {
        ruleResult = checkRule(rules[i], userInput);
        // If any rule fails, update the rule list and exit the loop
        if (!ruleResult.passed) {
            updateRuleList(ruleResult);
            return; // Exit the function early
        }
    }


    if (currentRuleIndex < rules.length) {
        updateRuleList(ruleResult);
        currentRuleIndex++; // Move the increment statement here
        checkPassword(); // Recursive call after the increment
    } else {
        updateRuleList(ruleResult);
    }

}

function checkRule(rule, userInput) {
    return {
        id: rule.id,
        passed: rule.regex ? rule.regex.test(userInput) : rule.customValidation(userInput),
        message: rule.message,
    };
}

// Function to update the captcha display
function updateCaptcha() {
    document.querySelector(".captcha").innerText = captcha;
}


function updateRuleList(ruleResult) {
    const ruleList = document.getElementById("rule-list");
    ruleList.innerHTML = "";
    console.log(`${currentRuleIndex},${rules.length}`)
    if (currentRuleIndex === rules.length) {
        let userInput = document.getElementById("password-input").value;
        // Hide the input field
        document.getElementById("password-input").style.display = "none";
        document.getElementById("level-display").style.display = "none";

        // Show a beautiful congratulatory card
        showCongratulatoryCard(userInput);
        return;
    }
    // Display the current rule card
    const currentRuleCard = document.createElement("div");
    currentRuleCard.classList.add("col-md-4", "mb-4", "mx-auto");
    const currentRuleCardContent = `
        <div class="card border-danger  bg-danger">
            <div class="card-body">
                <h5 class="card-title">Rule ${rules[currentRuleIndex].id}</h5>
                <p class="card-text">${rules[currentRuleIndex].message}</p>
                ${currentRuleIndex === 7 ? getSpecialBrandImages() : ''}
                ${currentRuleIndex === 11 ? `<p class="captcha-container"><span class="captcha">${captcha}</span> <i id="refresh-icon" class="fas fa-sync-alt refresh-icon" title="Refresh Captcha"></i></p>` : ''}
            </div>
        </div>
    `;

    currentRuleCard.innerHTML = currentRuleCardContent;
    ruleList.appendChild(currentRuleCard);

    // Display failed rules below the current rule
    for (let i = currentRuleIndex - 1; i >= 0; i--) {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4", "mx-auto");

        // Check the rule result for each previously passed rule
        const prevRuleResult = checkRule(rules[i], document.getElementById("password-input").value);

        // Display failed rules only
        if (!prevRuleResult.passed) {
            const cardContent = `
                <div class="card border-danger bg-danger">
                    <div class="card-body">
                        <h5 class="card-title">Rule ${rules[i].id}</h5>
                        <p class="card-text">${rules[i].message}</p>
                         ${i === 7 ? getSpecialBrandImages() : ''}
                ${i === 11 ? `<p class="captcha">${captcha} <i id="refresh-icon" class="fas fa-sync-alt refresh-icon" title="Refresh Captcha"></i></p>` : ''}
                    </div>
                </div>
            `;
            card.innerHTML = cardContent;
            ruleList.appendChild(card);
        }
    }

    for (let i = currentRuleIndex - 1; i >= 0; i--) {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4", "mx-auto");

        // Check the rule result for each previously passed rule
        const prevRuleResult = checkRule(rules[i], document.getElementById("password-input").value);

        // Display failed rules only
        if (prevRuleResult.passed) {
            const cardContent = `
                <div class="card border-success bg-success">
                    <div class="card-body">
                        <h5 class="card-title">Rule ${rules[i].id}</h5>
                        <p class="card-text">${rules[i].message}</p>
                        ${i === 7 ? getSpecialBrandImages() : ''}
                        ${i === 11 ? `<p class="captcha">${captcha} <i id="refresh-icon" class="fas fa-sync-alt refresh-icon" title="Refresh Captcha"></i></p>` : ''}
                    </div>
                </div>
            `;
            card.innerHTML = cardContent;
            ruleList.appendChild(card);
        }
    }
    if (currentRuleIndex === 11) {
        const refreshIcon = document.getElementById("refresh-icon");
        if (refreshIcon) {
            refreshIcon.addEventListener("click", function () {
                captcha = generateDynamicCaptcha();
                updateCaptcha(); // Update the captcha display
            });
        }
    }
}

function showCongratulatoryCard(crackedPassword) {
    const congratulatoryCard = document.getElementById("congratulatory-card");
    congratulatoryCard.style.display = "block";

    // Update the card content with the cracked password
    const cardContent = `
        <div class="card border-success">
            <div class="card-body">
                <h5 class="card-title">Congratulations!</h5>
                <p class="card-text">You have successfully cracked the password:</p>
                <p class="card-text cracked-password">${crackedPassword}</p>
                <p class="card-text">Share the fun challenge with your friends!</p>
                <button class="share-button" onclick="shareChallenge()">Share Now</button>
            </div>
        </div>
    `;

    congratulatoryCard.innerHTML = cardContent;
}

function shareChallenge() {
    // Check if the Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: 'MindCrypt Challenge - Crack the Code!',
            text: 'A thrilling password game that tests your wits!',
            url: window.location.href
        })
            .then(() => console.log('Challenge shared successfully'))
            .catch((error) => console.error('Error sharing challenge:', error));
    } else {
        // Fallback for browsers/devices that do not support Web Share API
        alert("Challenge shared! Invite your friends to try it!");
    }
}



function getSpecialBrandImages() {
    // Replace these placeholder URLs with the actual URLs of your images
    const imageUrls = [
        "./assets/img/logo1.png",
        "./assets/img/logo2.png",
        "./assets/img/logo3.png",
    ];

    // Create an HTML string for the images
    const imageHtml = imageUrls.map(url => `<img src="${url}" alt="Special Brand Image" class="img-fluid mb-2 col-4">`).join('');

    return `<div class="row">${imageHtml}</div>`;
}


function sumOfDigits(str) {
    const digits = str.match(/\d/g); // Use regex to find all digits
    if (digits) {
        return digits.reduce((acc, digit) => acc + parseInt(digit), 0);
    } else {
        return 0; // Return 0 if no digits are found
    }
}

function includesSpecialSequence(str) {
    // Custom condition for Level 4: Check for a special character sequence
    const specialSequenceRegex = /[!@#$%^&*(),.?":{}|<>]/; // Define your own set of special characters
    return specialSequenceRegex.test(str);
}

function includesSpecialMonthSequence(str) {
    // Custom condition for Level 6: Check if the string includes any month name
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return months.some(month => str.includes(month));
}

function includesRomanNumeral(str) {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return romanNumerals.some(roman => str.includes(roman));
}

function includesSpecialBrandSequence(str) {
    // Custom condition for Level 8
    const specialBrands = ["Shell", "Michelin", "Pringles"]; // Replace with actual special brand names
    return specialBrands.some(brand => str.includes(brand));
}

function productOfRomanNumerals(str) {
    const romanNumerals = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
        VI: 6,
        VII: 7,
        VIII: 8,
        IX: 9,
        X: 10
    };

    const romanNumeralArray = str.match(/(I[VX]|V?I{0,3}|X{0,3})/g); // Match valid Roman numerals
    const product = romanNumeralArray
        .filter(roman => roman in romanNumerals)
        .map(roman => romanNumerals[roman])
        .reduce((acc, value) => acc * value, 1);

    return product;
}

function includesTwoLetterSymbol(str) {
    const periodicTableSymbols = [
        "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
        "Na", "Mg", "Al", "Si", "P", "S", "Cl", "K", "Ar",
        "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Ni", "Co", "Cu",
        "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr",
        "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd",
        "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba",
        "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy",
        "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os",
        "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Th", "Pa", "U",
        "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No",
        "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn",
        "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
    ];

    // Check if any two-letter symbol is present in the string
    return periodicTableSymbols.some(symbol => str.includes(symbol));
}

function includesMoonPhaseEmoji(str) {
    // Custom condition for Level 11
    const moonPhaseEmojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌚"];
    return moonPhaseEmojis.some(emoji => str.includes(emoji));
}
function includesDynamicCaptcha(str) {
    return str.includes(captcha);
}

// Function to show the instructions modal
function showInstructionsModal() {
    var modal = document.getElementById('instructionsModal');
    modal.style.display = 'block';
}

// Function to start the game after clicking "Continue"
function startGame() {
    var modal = document.getElementById('instructionsModal');
    modal.style.display = 'none';
    document.getElementById("gameSection").style.display = "block";
}

// Show instructions modal on page load
document.addEventListener('DOMContentLoaded', async function () {
    showInstructionsModal();
    wordleSolution = await getWordleSolution();
});

// stop keyboard shortcuts
window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && (event.key === "I" || event.key === "i")) {
        event.preventDefault();
    }
    if (event.ctrlKey && (event.key === "U" || event.key === "u")) {
        event.preventDefault();
    }
    if (event.ctrlKey && (event.key === "P" || event.key === "p")) {
        event.preventDefault();
    }
    if ((event.key === 'F12')) {
        event.preventDefault();
    }
    if ((event.key === 'F11')) {
        event.preventDefault()
    }
});
// stop right click
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});