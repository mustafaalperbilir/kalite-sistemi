// POST isteği atarak veritabanına sahte bir veri ekliyoruz
fetch('http://localhost:5000/api/accreditations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        program_name: 'Fizyoterapi ve Rehabilitasyon',
        accreditation_type: 'FTR-AD',
        date_info: '30.09.2025 - 30.09.2027',
        status: 'TAMAMLANDI'
    })
})
.then(response => response.json())
.then(data => console.log('✅ Veritabanına Eklenen Kayıt:', data))
.catch(error => console.error('Hata:', error));