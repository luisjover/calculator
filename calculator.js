// global variables needed

const numKeys = document.querySelectorAll(".btn-num");
const operatorKeys = document.querySelectorAll(".btn-op");
const clearLog = document.getElementById("clear-log");
const negative = document.getElementById("negative");
const clear = document.getElementById("clear");
const del = document.getElementById("delete");
const equal = document.getElementById("equal");
const btnSci = document.querySelector(".btn-science");
const scienceDiv = document.querySelector(".science");
const musicBtn = document.getElementById("play-stop");
const darkButton = document.getElementById("toDark");
let display = document.querySelector(".display");
let displayLog = [];                  // to unshift display to set display log
let arrOp = [];                       // to push operators and use it later

// event listeners needed
window.addEventListener("load", setClock());
window.addEventListener("keydown", keyDatas);
numKeys.forEach((numKey) => numKey.addEventListener("click", printNumber));
operatorKeys.forEach((operatorKey) => operatorKey.addEventListener("click", printOperator));
clearLog.addEventListener("click", clearLogList);
negative.addEventListener("click", makeNegative);
clear.addEventListener("click", clearAll);
del.addEventListener("click", deleteSimple);
equal.addEventListener("click", equalTo);
btnSci.addEventListener("click", openSci);
scienceDiv.addEventListener("click", sciCal);
musicBtn.addEventListener("click", playStopMusic);
darkButton.addEventListener("click", toDarkMode);

// Initial state of log-state
display.setAttribute("log-state", "solved");

/** In charge of printing numbers and prevent them to exceed the fixed maximum;
 * Also taking care of numbers being printed after a resolved operation
 */
function printNumber(event) {
  if (display.hasAttribute("display-state")) {
    display.textContent = "";
    display.removeAttribute("display-state");
  }
  if (display.hasAttribute("deletable")) {
    display.textContent = "";
    display.removeAttribute("deletable");
  }
  if ((event.target.innerText != 0) || display.innerHTML.toString().length != 0) {
    if (event.target.innerText != 0 || !checkEndOp1()) {
      if (display.innerHTML.toString().length < 20) display.textContent += event.target.innerText;
    } else {
      display.textContent += "0.";
      display.setAttribute("decimal", "passed");
    }
  } else {
    display.textContent += "0.";
    display.setAttribute("decimal", "passed");
  }
}

// In charge of printing numbers coming from keyboard
function printNumberKeyboard(event) {
  if ((event.key != 0) || display.innerHTML.toString().length != 0) {
    if (display.hasAttribute("display-state")) {
      display.textContent = "";
      display.removeAttribute("display-state");
    }
    if (display.hasAttribute("deletable")) {
      display.textContent = "";
      display.removeAttribute("deletable");
    }
    if (display.innerHTML.toString().length < 20)
      display.textContent += event.key;
  }
}

/** In charge of printing operators and prevent rules break as repeat operator or
 * print operator if any number before - calling external function (checkEndOp())
 * also reset other functions as making possible print a new decimal point again
 */
function printOperator(event) {
  if (!display.hasAttribute("deletable")) {
    if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
    if (display.hasAttribute("log-state")) display.removeAttribute("log-state");
    if (display.hasAttribute("decimal")) display.removeAttribute("decimal");

    if (
      display.innerHTML.toString().length > 0 &&
      display.innerHTML.toString().length < 20 &&
      !checkEndOp()
    ) {
      arrOp.push(event.target.innerText);
      display.textContent += event.target.innerText;
    }
  }
}

// In charge of printting operators coming from keyboard
function printOperatorKeyboard(event) {
  if (!display.hasAttribute("deletable")) {
    if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
    if (display.hasAttribute("log-state")) display.removeAttribute("log-state");
    if (display.hasAttribute("decimal")) display.removeAttribute("decimal");

    if (
      display.innerHTML.toString().length > 0 &&
      display.innerHTML.toString().length < 20 &&
      !checkEndOp()
    ) {
      arrOp.push(event.key);
      display.textContent += event.key;
    }
  }
}

/** In charge of prevent more than one decimal point use or use it before any number
 * and make sure another decimal point won´t be printed before a new operator is added
 */
function printDecimal(decimal, zeroDec) {
  if (!display.hasAttribute("deletable")) {
    if (!(display.hasAttribute("display-state") && display.innerHTML.includes("."))) {
      if (display.innerHTML.toString().length === 0) {
        if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
        display.textContent += zeroDec;
        display.setAttribute("decimal", "passed");
      } else if (!checkEndOp() && display.innerHTML.indexOf(".") == -1) {
        if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
        display.textContent += decimal;
        display.setAttribute("decimal", "passed");
      } else if (!checkEndOp() && !display.hasAttribute("decimal")) {
        if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
        display.textContent += decimal;
        display.setAttribute("decimal", "passed");
      } else if (checkEndOp1()) {
        if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
        display.textContent += zeroDec;
        display.setAttribute("decimal", "passed");
      } else if (!checkEndOp() && !display.hasAttribute("decimal")) display.textContent += decimal;
    }
  }
}

//Change the sign of the number on display
function makeNegative() {
  if (!checkEndOp()) {
    if (Math.sign(display.textContent)) display.textContent = -display.textContent;
  }
}

/** In charge of print the result, prevent excess of decimals and be sure display will be refreshed if starting new operation, otherwise keep the value and continue operating;
 * Also push operations and results in Log Array to create the operations log
 * Operation is done by an external function (calcNums()) avoiding Eval() use
 */
function equalTo() {
  if (!display.hasAttribute("deletable")) {
    if (!checkEndOp()) {
      if (!display.hasAttribute("log-state")) {
        displayLog.unshift(display.textContent);
        let strNums = display.innerHTML.toString();
        let result = calcNums(strNums);
        if (result % 1 !== 0) {
          display.textContent = roundNumber(result);
          display.setAttribute("display-state", "toClear");
          display.setAttribute("log-state", "solved");
          displayLog.unshift("Result " + display.textContent);
          arrOp = [];
        } else {
          display.textContent = result;
          display.setAttribute("display-state", "toClear");
          display.setAttribute("log-state", "solved");
          displayLog.unshift("Result " + display.textContent);
          arrOp = [];
        }
      }
      refreshLogList();
    }
  }
}

// Erase all the display content when you press C button and keep all the rules working for that case
function clearAll() {
  display.textContent = "";
  arrOp = [];
  display.setAttribute("display-state", "toClear");
  display.setAttribute("log-state", "solved");
}

// Delete last character and ensure all rules keep working as you keep deleting characters
function deleteSimple() {
  if (!display.hasAttribute("deletable")) {
    if (display.innerHTML.endsWith("0.")) {
      display.textContent = display.textContent.slice(0, -2);
      if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
    } else if (checkEndOp1()) {
      display.textContent = display.textContent.slice(0, -1);
      if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
      if (!checkOpNoDec()) {
        display.setAttribute("log-state", "solved");
        if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
        arrOp.pop();
      } else {
        if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
        arrOp.pop();
      }
    } else {
      if (display.textContent.length === 1) {
        display.setAttribute("display-state", "toClear");
        display.setAttribute("log-state", "solved");
      }
      display.textContent = display.textContent.slice(0, -1);
      if (display.hasAttribute("display-state")) display.removeAttribute("display-state");
    }
  }
}

//---------------------------------------------------------------------------------

//---------------------- EXTERNAL FUNCTIONS ---------------------------------------

// In charge of checking what kind of key is being pressed and call the right function
function keyDatas(event) {
  if (isFinite(event.key)) printNumberKeyboard(event);
  if (["+", "-", "*", "/", "%"].indexOf(event.key) != -1) printOperatorKeyboard(event);
  if (event.key == ".") printDecimal(".", "0.");
  if (event.key == "Enter") equalTo();
  if (event.key == "c") clearAll();
  if (event.keyCode == 8) deleteSimple();
}

// In charge of checking if last character is operator or decimal point*/
function checkEndOp() {
  if (display.innerHTML.endsWith("+")) return true;
  else if (display.innerHTML.endsWith("-")) return true;
  else if (display.innerHTML.endsWith("*")) return true;
  else if (display.innerHTML.endsWith("/")) return true;
  else if (display.innerHTML.endsWith("%")) return true;
  else if (display.innerHTML.endsWith(".")) return true;
  else return false;
}

// Its a checkEndOp version not looking into decimal point for printDecimal function
function checkEndOp1() {
  if (display.innerHTML.endsWith("+")) return true;
  else if (display.innerHTML.endsWith("-")) return true;
  else if (display.innerHTML.endsWith("*")) return true;
  else if (display.innerHTML.endsWith("/")) return true;
  else if (display.innerHTML.endsWith("%")) return true;
  else if (display.innerHTML.endsWith(".")) return false;
  else return false;
}

// In charge of checking if display contains any operator or decimal point*
function checkOp() {
  if (display.innerHTML.includes("+")) return true;
  else if (display.innerHTML.includes("-")) return true;
  else if (display.innerHTML.includes("*")) return true;
  else if (display.innerHTML.includes("/")) return true;
  else if (display.innerHTML.includes("%")) return true;
  else if (display.innerHTML.includes(".")) return true;
  else return false;
}

function checkOpNoDec() {
  if (display.innerHTML.includes("+")) return true;
  else if (display.innerHTML.includes("-")) return true;
  else if (display.innerHTML.includes("*")) return true;
  else if (display.innerHTML.includes("/")) return true;
  else if (display.innerHTML.includes("%")) return true;
  else if (display.innerHTML.includes(".")) return false;
  else return false;
}

// Its a checkOp version without the decimal point and that allow (-) at the beggining (mainly for sci calculator)
function checkOp1() {
  if (display.innerHTML.includes("+")) return true;
  else if (display.innerHTML.startsWith("-")) return false;
  else if (display.innerHTML.includes("-")) return true;
  else if (display.innerHTML.includes("*")) return true;
  else if (display.innerHTML.includes("/")) return true;
  else if (display.innerHTML.includes("%")) return true;
  else return false;
}


function roundNumber(num) {
  let size = num.toString().length;
  let intSize = Math.trunc(num).toString().length;
  let dec = size - intSize;
  if (dec >= 5) return num.toFixed(4)
  else return num;
}

// ------  SPECIAL FUNCTION FOR SOLVE EVAL AND OTHER ISSUES  ------

//It recyve a string with numbers and operators;
function calcNums(str) {
  //We identify when the first number is a negative number;
  let negativo = false;
  if (str[0] === "-") negativo = true;

  //We make a split with operators;
  let arrNums = str.split(/[^A-Za-z.\d]/g);

  /** Inside here we check if first number is a negative number; if that:
   * We delete that space in array
   * We transform the fiorst number in negative number multipying by -1;
   */
  if (negativo === true) {
    arrNums.splice(0, 1);
    arrNums[0] = parseFloat(arrNums[0]);
    arrNums[0] *= -1;
  }

  //Transform that strings in numbers with parseInt;
  for (let num in arrNums) {
    arrNums[num] = parseFloat(arrNums[num]);
  }

  //We declare here the variables we are going to need;
  let num1 = arrNums[0];
  let num2 = 0;
  let result = 0;
  let i = 0;
  let j = 0;
  let res = 0;                   //partial result just for first iterarion;

  /** We use this while and switch pattern to iterate over operators-
   * and do prioritary operations (*, / and %) in natural order first;
   * we use splice method to mutate the arrays and remove "wasted" numbers-
   * and operators and add the result of that numbers to the numbers array;
   */
  while (j < arrOp.length) {
    num1 = arrNums[j];
    num2 = arrNums[j + 1];
    switch (arrOp[j]) {
      case "*":
        res = num1 * num2;
        arrNums.splice(j, 2, res);
        arrOp.splice(j, 1);
        num1 = res;
        j = j;
        break;
      case "/":
        res = num1 / num2;
        arrNums.splice(j, 2, res);
        arrOp.splice(j, 1);
        num1 = res;
        j = j;
        break;
      case "%":
        res = num1 % num2;
        arrNums.splice(j, 2, res);
        arrOp.splice(j, 1);
        num1 = res;
        j = j;
        break;
      default: j++;
    }
    result = num1;

  }


  /** With this second while-switch pattern we iterate over the new operators array-
   * to do the non prioritary operations (+ and -) in their natural order;
   * Finally we return result;
   */
  if (arrOp.includes("+") || arrOp.includes("-")) {
    num1 = arrNums[0];
    while (i < arrOp.length) {
      num2 = arrNums[i + 1];
      switch (arrOp[i]) {
        case "+":
          result = num1 + num2;
          break;
        case "-":
          result = num1 - num2;
          break;
      }
      num1 = result;
      i++;
    }
  }
  return result;
}

/* ----------------------- SCI-CALCULATOR ------------------------*/

function openSci() {
  scienceDiv.classList.toggle("science-show");
}

function sciCal(event) {
  if (event.target.innerText == "√(x)") sqRoot();
  if (event.target.innerText == "log(x)") logE();
  if (event.target.innerText == "sin(x)") sinX();
  if (event.target.innerText == "cos(x)") cosX();
  if (event.target.innerText == "tan(x)") tanX();
  if (event.target.innerText == "º/rad") degRad();
}

function sqRoot() {
  if (
    !checkOp1() &&
    !display.hasAttribute("deletable") &&
    display.textContent != ""
  ) {
    if (!(Math.sign(display.textContent) == -1)) {
      displayLog.unshift("√(" + display.textContent + ")");
      display.textContent = roundNumber(Math.sqrt(display.textContent));
      displayLog.unshift("Result " + display.textContent);
      display.setAttribute("display-state", "toClear");
      display.setAttribute("log-state", "solved");
    } else {
      display.textContent = "NOT POSSIBLE!";
      display.setAttribute("deletable", "not");
      display.setAttribute("display-state", "toClear");
      display.setAttribute("log-state", "solved");
    }
    refreshLogList();
  }
}

function logE() {
  if (
    !checkOp1() &&
    !display.hasAttribute("deletable") &&
    display.textContent != ""
  ) {
    if (!(Math.sign(display.textContent) == -1)) {
      displayLog.unshift("log(" + display.textContent + ")");
      display.textContent = roundNumber(Math.log(display.textContent));
      displayLog.unshift("Result " + display.textContent);
      display.setAttribute("display-state", "toClear");
      display.setAttribute("log-state", "solved");
    } else {
      display.textContent = "NOT POSSIBLE!";
      display.setAttribute("deletable", "not");
      display.setAttribute("display-state", "toClear");
      display.setAttribute("log-state", "solved");
    }
    refreshLogList();
    if (display.textContent == "Infinity" || display.textContent == "-Infinity")
      display.setAttribute("deletable", "not");
  }
}

function sinX() {
  if (
    !checkOp1() &&
    !display.hasAttribute("deletable") &&
    display.textContent != ""
  ) {
    displayLog.unshift("sin (" + display.textContent + ")");
    display.textContent = roundNumber(Math.sin(display.textContent));
    displayLog.unshift("Result " + display.textContent);
    display.setAttribute("display-state", "toClear");
    display.setAttribute("log-state", "solved");
    refreshLogList();
  }
}

function cosX() {
  if (
    !checkOp1() &&
    !display.hasAttribute("deletable") &&
    display.textContent != ""
  ) {
    displayLog.unshift("cos (" + display.textContent + ")");
    display.textContent = roundNumber(Math.cos(display.textContent));
    displayLog.unshift("Result " + display.textContent);
    display.setAttribute("display-state", "toClear");
    display.setAttribute("log-state", "solved");
    refreshLogList();
  }
}

function tanX() {
  if (
    !checkOp1() &&
    !display.hasAttribute("deletable") &&
    display.textContent != ""
  ) {
    displayLog.unshift("tan (" + display.textContent + ")");
    display.textContent = roundNumber(Math.tan(display.textContent));
    displayLog.unshift("Result " + display.textContent);
    display.setAttribute("display-state", "toClear");
    display.setAttribute("log-state", "solved");
    refreshLogList();
  }
}

function degRad() {
  if (
    !checkOp1() &&
    !display.hasAttribute("deletable") &&
    display.textContent != ""
  ) {
    displayLog.unshift(display.textContent + " DEG");
    display.textContent = roundNumber(display.textContent * (Math.PI / 180));
    displayLog.unshift("Result " + display.textContent + " RAD");
    display.setAttribute("display-state", "toClear");
    display.setAttribute("log-state", "solved");
    refreshLogList();
  }
}

// ------  DISPLAY LOG  ------

//Called after equal to add new set of data to log list array, restart the display log and show actual data
function refreshLogList() {
  let logList = document.querySelector(".log-list");
  logList.innerHTML = "";

  let i = 0;
  while (i < displayLog.length && i < 18) {
    let li = document.createElement("li");
    li.textContent = displayLog[i];
    logList.appendChild(li);
    i++;
  }
}

//clear loglist and set display log array to empty
function clearLogList() {
  let logList = document.querySelector(".log-list");
  logList.innerHTML = "";
  displayLog = [];
}

//------------------- SOUND -------------------------

let kS = true;
function playStopMusic() {
  if (kS) {
    let sound = document.createElement("iframe");
    sound.setAttribute("src", "assets/audio/audio.mp3");
    document.body.appendChild(sound);
  } else {
    let iframe = document.getElementsByTagName("iframe");
    if (iframe.length > 0) {
      iframe[0].parentNode.removeChild(iframe[0]);
    }
  }
  kS = !kS;
}

//------------------- CLOCK -------------------------

function setClock() {
  let clockDate = document.querySelector(".date");
  let clockDisplay = document.querySelector(".clock");
  let date = new Date();
  let dateSeconds = date.getSeconds();
  let dateMinutes = date.getMinutes();
  let dateHours = date.getHours();
  let strSeg = dateSeconds.toString();
  if (strSeg.length == 1) dateSeconds = "0" + dateSeconds;
  let strMin = dateMinutes.toString();
  if (strMin.length == 1) dateMinutes = "0" + dateMinutes;
  strHour = dateHours.toString();
  if (strHour.length == 1) dateHours = "0" + dateHours;
  let now = dateHours + " : " + dateMinutes + " : " + dateSeconds;
  let dateWeekDay = date.getDay();
  dateWeekDay = convertDay(dateWeekDay);
  let dateDay = date.getDate();
  let strDay = dateDay.toString();
  if (strDay.length == 1) dateDay = "0" + dateDay;
  let dateMonth = date.getMonth() + 1;
  let strMonth = dateMonth.toString();
  if (strMonth.length == 1) dateMonth = "0" + dateMonth;
  let dateYear = date.getFullYear();
  let strYear = dateYear.toString();
  if (strYear.length == 1) dateYear = "0" + dateYear;
  let today = dateWeekDay + " - " + dateDay + "/" + dateMonth + "/" + dateYear;
  clockDisplay.textContent = now;
  clockDate.textContent = today;
  setTimeout("setClock()", 1000);
}

function convertDay(num) {
  if (num == 1) return "Monday";
  if (num == 2) return "Tuesday";
  if (num == 3) return "Wednesday";
  if (num == 4) return "Thursday";
  if (num == 5) return "Friday";
  if (num == 6) return "Saturday";
  if (num == 0) return "Sunday";
}

// ------  DARK MODE  ------

//Just some classes adition to make dark-mode properly work

function toDarkMode() {
  let corner = document.querySelector(".corner");
  let bodyCol = document.querySelector("body");
  let cal = document.querySelector(".calculator-grid");
  let upper = document.querySelector(".upper-bar");
  let btn = [...document.querySelectorAll(".btn-color")];
  let btn1 = [...document.querySelectorAll(".btn")];
  let btnS = document.querySelector(".btn-s");
  let slider = document.querySelector(".slider");
  let sciBtn = document.querySelectorAll(".sci-btn");
  let clockDiv = document.querySelector(".clock");
  let dateDiv = document.querySelector(".date");

  corner.classList.toggle("dark-corner");
  display.classList.toggle("dark-display");
  bodyCol.classList.toggle("dark-bg");
  cal.classList.toggle("dark-cal");
  upper.classList.toggle("dark-upper");
  btn.forEach((elem) => elem.classList.toggle("dark-btn"));
  btn1.forEach((elem) => elem.classList.toggle("dark-btn1"));
  btnS.classList.toggle("dark-btn-s");
  clearLog.classList.toggle("dark-btn-log");
  slider.classList.toggle("dark-slider");
  btnSci.classList.toggle("dark-btn-science");
  sciBtn.forEach((elem) => elem.classList.toggle("dark-sci-btn"));
  clockDiv.classList.toggle("dark-clock");
  dateDiv.classList.toggle("dark-date");
}