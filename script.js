// Đọc file KMZ và hiển thị dữ liệu
document.getElementById('file-input').addEventListener('change', function(event) {
    var file = event.target.files[0];
    if (file && file.name.endsWith('.kmz')) {
        // Hiển thị thông báo loading
        document.getElementById('loading').style.display = 'block';

        var reader = new FileReader();
        reader.onload = function(e) {
            JSZip.loadAsync(e.target.result).then(function(zip) {
                return zip.file(/.*\.kml/)[0].async("string");  // Lấy file KML từ KMZ
            }).then(function(kmlContent) {
                // Tạo Blob để đọc KML
                var kmlBlob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
                var kmlUrl = URL.createObjectURL(kmlBlob);

                omnivore.kml(kmlUrl).on('ready', function() {
                    var data = this.toGeoJSON();
                    displayDataInTable(data.features);
                    
                    // Ẩn thông báo loading sau khi hiển thị xong
                    document.getElementById('loading').style.display = 'none';
                });
            }).catch(function(error) {
                console.error("Error reading KMZ file:", error);
                alert("An error occurred while processing the file.");
                
                // Ẩn thông báo loading nếu có lỗi
                document.getElementById('loading').style.display = 'none';
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Please upload a valid KMZ file.");
    }
});

// Hiển thị dữ liệu lên bảng
function displayDataInTable(features) {
    var tableBody = document.querySelector("#data-table tbody");
    tableBody.innerHTML = '';  // Xóa dữ liệu cũ
    features.forEach(function(feature) {
        var name = feature.properties.name || 'N/A';
        var description = feature.properties.description || 'N/A';
        var coordinates = feature.geometry.coordinates;
        var lat = coordinates[1];
        var lon = coordinates[0];

        // Tạo hàng mới cho bảng
        var row = document.createElement('tr');

        row.innerHTML = `
            <td>${name}</td>
            <td>${description}</td>
            <td>${lat}, ${lon}</td>
            <td><button onclick="openGoogleMaps(${lat}, ${lon})">Open in Google Maps</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Thêm chức năng tìm kiếm
    document.getElementById('search').addEventListener('input', function() {
        searchTable(this.value.toLowerCase());
    });
}

// Mở Google Maps với tọa độ được cung cấp
function openGoogleMaps(lat, lon) {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Mở ứng dụng Google Maps trên di động
        window.open(`geo:${lat},${lon}?q=${lat},${lon}`, '_blank');
    } else {
        // Mở Google Maps trên trình duyệt máy tính
        window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
    }
}

// Tìm kiếm nội dung trong bảng
function searchTable(query) {
    var rows = document.querySelectorAll("#data-table tbody tr");
    rows.forEach(function(row) {
        var cells = row.getElementsByTagName('td');
        var match = false;
        for (var i = 0; i < cells.length - 1; i++) {
            if (cells[i].textContent.toLowerCase().indexOf(query) > -1) {
                match = true;
                break;
            }
        }
        row.style.display = match ? '' : 'none';
    });
}
