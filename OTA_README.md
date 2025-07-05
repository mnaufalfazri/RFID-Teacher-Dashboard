# Sistem Pembaruan OTA (Over-The-Air) untuk ESP32

## Deskripsi
Sistem pembaruan OTA memungkinkan ESP32 untuk memperbarui firmware secara otomatis melalui jaringan WiFi tanpa perlu koneksi fisik ke komputer.

## Fitur
- ✅ Pemeriksaan otomatis pembaruan setiap 5 menit
- ✅ Download dan instalasi firmware otomatis
- ✅ Progress indicator selama proses update
- ✅ Validasi checksum untuk keamanan
- ✅ Rollback otomatis jika update gagal
- ✅ Tampilan status di OLED selama proses

## Komponen Backend

### Endpoint API
1. **GET /api/ota/check** - Cek pembaruan tersedia
2. **GET /api/ota/download** - Download firmware
3. **POST /api/ota/upload** - Upload firmware baru (admin)
4. **GET /api/ota/info** - Info firmware saat ini
5. **DELETE /api/ota/firmware** - Hapus firmware

### File Structure
```
backend/
├── routes/otaRoutes.js
├── uploads/firmware/
│   ├── firmware-*.bin
│   └── metadata.json
└── server.js
```

## Komponen ESP32

### Konfigurasi
- **FIRMWARE_VERSION**: "1.0.0" (dapat diubah)
- **OTA_CHECK_INTERVAL**: 300000ms (5 menit)
- **otaEndpoint**: URL backend untuk OTA

### Fungsi Utama
- `checkForOTAUpdate()` - Cek pembaruan dari server
- `performOTAUpdate()` - Lakukan proses update
- Progress callback untuk tampilan real-time

## Cara Penggunaan

### 1. Upload Firmware Baru (Admin)
```bash
curl -X POST http://localhost:5000/api/ota/upload \
  -F "firmware=@firmware.bin" \
  -F "version=1.1.0"
```

### 2. Cek Status Firmware
```bash
curl http://localhost:5000/api/ota/info
```

### 3. ESP32 Otomatis
- ESP32 akan otomatis cek pembaruan setiap 5 menit
- Jika ada update, akan download dan install otomatis
- Device akan restart setelah update berhasil

## Keamanan
- Validasi file .bin saja yang diterima
- Checksum SHA256 untuk verifikasi integritas
- Batas ukuran file maksimal 5MB
- Cek status tamper sebelum update
- Hanya update saat WiFi terhubung

## Monitoring
- Log detail di Serial Monitor ESP32
- Status tampil di OLED selama proses
- Response HTTP code untuk debugging
- Progress percentage real-time

## Troubleshooting

### Update Gagal
- Cek koneksi WiFi
- Pastikan server backend berjalan
- Verifikasi file firmware valid
- Cek space memory ESP32

### ESP32 Tidak Cek Update
- Pastikan `wifiConnected = true`
- Cek `systemTampered = false`
- Verifikasi interval timing
- Cek URL endpoint benar

## Development Notes
- Gunakan versioning semantic (x.y.z)
- Test firmware di development environment dulu
- Backup firmware lama sebelum upload baru
- Monitor device setelah update untuk memastikan stabilitas

## Dependencies
### Backend
- express
- multer
- crypto (built-in)
- fs (built-in)
- path (built-in)

### ESP32
- WiFi.h
- HTTPClient.h
- Update.h
- HTTPUpdate.h
- ArduinoJson.h

## Status Implementation
✅ Backend OTA routes
✅ ESP32 OTA functions
✅ Automatic checking
✅ Progress display
✅ Error handling
✅ Security validation

Sistem OTA siap digunakan untuk pembaruan firmware ESP32 secara remote!