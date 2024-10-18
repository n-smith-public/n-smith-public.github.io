function toggleDropdown(dropdownID) {
    const dropdownContent = document.getElementById(dropdownID);
    if (dropdownContent.style.display === "none" || dropdownContent.style.display === "") {
        dropdownContent.style.display = "block";
    } else {
        dropdownContent.style.display = "none";
    }
}

function toggleAccessibilityMenu() {
    const dropdown = document.getElementById("accessibilityDropdown");
    dropdown.classList.toggle("show");
}

let colorsOn = true;
function toggleCharacterColors() {
    const characterNames = document.querySelectorAll(".character");
    
    if (colorsOn) {
        characterNames.forEach(name => {
            name.style.color = '#000000';
        });
    }
    else {
        applyCharacterColors();
    }

    colorsOn = !colorsOn;
    
    //characterNames.forEach(name => {
    //if (name.style.color == 'black') {
    //    applyCharacterColors();
    //} else {
    //    name.style.color = 'black';
    //}
    //});
}

function applyCharacterColors() {
    const characterNames = document.querySelectorAll(".character");
    characterNames.forEach(name => {
        if (name.classList.contains("black")) name.style.color = '#000000';
        if (name.classList.contains("red")) name.style.color = '#ff3838';
        if (name.classList.contains("blue")) name.style.color = '#7ec7ff';
        if (name.classList.contains("green")) name.style.color = '#59f58d';
        if (name.classList.contains("purple")) name.style.color = '#a82ee8';
        if (name.classList.contains("orange")) name.style.color = '#ff8c38';
        if (name.classList.contains("yellow")) name.style.color = '#d4cb75';
    });
}