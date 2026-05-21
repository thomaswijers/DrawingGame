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

    AddPaintingClickEvent();
}

function AddPaintingClickEvent() {
    $(".single-painting").click(function () {
        const id = $(this).attr("id");
        localStorage.setItem("selectedPainting", id);
        window.location.href = "confirm.html";
    });
}