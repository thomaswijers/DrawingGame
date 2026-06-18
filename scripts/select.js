$(document).ready(function () {
    fetch('data/Paintings.json')
        .then(response => response.json())
        .then(data => PlacePaintings(data))
        .catch(error => console.error('Error fetching JSON:', error));
});

function PlacePaintings(paintings) {
    const paintingGrid = $("#painting-grid");

    paintings.forEach((painting) => {
        paintingGrid.append(`
            <div id="${painting.id}" class="single-painting">
                <img src="${painting.url}" alt="${painting.title}" />
            </div>
        `);
    });

    AddPaintingClickEvent(paintings.length);
}

function AddPaintingClickEvent(amountOfPaintings) {
    $(".single-painting").click(function () {
        let id = $(this).attr("id");
        if (id == 0) {
            id = Math.floor(Math.random() * amountOfPaintings);
            localStorage.setItem("selectedPainting", id);
        }
        else {
            localStorage.setItem("selectedPainting", id);
        } 
        window.location.href = "confirm.html";
    });
}