
const fileName = document.getElementById("filename")

dropContainer.ondragover = dropContainer.ondragenter = function (evt) {
    evt.preventDefault();
};

dropContainer.ondrop = function (evt) {
    evt.preventDefault()
    fileInput.files = evt.dataTransfer.files;
    
    // If you want to use some of the dropped files
    const dT = new DataTransfer();
    dT.items.add(evt.dataTransfer.files[0]);
    dT.items.add(evt.dataTransfer.files[3]);
    fileInput.files = dT.files;
    evt.preventDefault();
};

document.getElementById("fileInput").addEventListener('change', () => {
    fileName.innerText =  document.querySelector('input[type=file]').files[0].name
})

function downloadTemplate(e) {
    console.log("clicked")
    fetch('/getTemplate').then( res => res.blob() )
    .then( blob => {
        let fileURL = URL.createObjectURL(blob);

        // create <a> element dynamically
        let fileLink = document.createElement('a');
        fileLink.href = fileURL;

        // suggest a name for the downloaded file
        fileLink.download = 'template.csv';

        // simulate click
        fileLink.click();
    }).catch(err => console.error(err))
}
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file!');
        return;
    }

    if (!document.getElementById("email").value.length) {
        alert('Please enter email');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const fileData = event.target.result;

        const requestData = {
            fileName: file.name,
            email: document.querySelector("#email").value,
            fileData: Array.from(new Uint8Array(fileData))
        };

        fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(res => res.text())
            .then(response => {
                document.getElementById('status').classList.remove('hidden')
                document.getElementById('status').innerText = response;
            })
            .catch(error => {
                document.getElementById('status').classList.remove('hidden')
                console.error('Error:', error);
                document.getElementById('status').innerText = 'Error uploading file.';
            });
    };

    reader.readAsArrayBuffer(file);
}
