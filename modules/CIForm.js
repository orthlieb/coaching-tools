document.addEventListener( 'wpcf7submit', function( event ) {
    var interactiveStyle = document.getElementById("interactive-style").value;
    const pattern = /^(?:100(\.0{1,2})?|(\d?\d(\.\d{1,2})?))([IBE])$/;
    if (pattern.test(interactiveStyle) === false) {
        alert("Interactive Style should be a score followed directly by the letter I or B or E. E.g. 80.4E");
        event.preventDefault();
        return false;
    }
}, false );