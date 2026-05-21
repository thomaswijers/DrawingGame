$(document).ready(function () {
    $.getJSON("data/Paintings.json", function (data) {
        let paintingID = Number(localStorage.getItem("selectedPainting"));
        const idToFind = paintingID == 0 || paintingID == undefined ? Math.floor(Math.random() * data.length) : paintingID;
        const painting = data.find(p => p.id === idToFind);
        console.log(painting);

        const selectedPainting = $("#selected-painting");
        selectedPainting.append(`<img src="${painting.url}" alt="${painting.title}" />`);
    });

    $("#switch-panel").click(function () {
        $("#confirm-column").fadeOut(400);
        setTimeout(function () {
            $("#interactive-column").css({
                display: "flex",
                opacity: 0
            }).animate({ opacity: 1 }, 400);
        }, 500);
    });

    $("#no-interactive").click(function(){
        $(this).removeClass("btn-outline");
        $("#yes-interactive").addClass("btn-outline");
        $("#start-game").removeClass("d-none");
    });
    
    $("#yes-interactive").click(function(){
        $(this).removeClass("btn-outline");
        $("#no-interactive").addClass("btn-outline");
        $("#start-game").removeClass("d-none");
    });
});