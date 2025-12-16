# 🎨 Sprite Atlas Unpacker

Một công cụ web để giải nén Sprite Atlas từ file .plist và texture image, phổ biến trong game development (Cocos2d, Unity, etc.).

**Tác giả:** dmthong181096  
**GitHub:** https://github.com/dmthong181096/unpack-texture  
**License:** MIT

## ✨ Tính năng

- **Dual File Input**: Upload cả file .plist và texture image
- **Plist Parser**: Phân tích file .plist format (XML)
- **Sprite Extraction**: Tách từng sprite từ atlas image
- **Rotation Support**: Xử lý sprites bị xoay trong atlas
- **Real-time Preview**: Xem trước sprites đã tách
- **Batch Download**: Tải xuống tất cả sprites cùng lúc
- **Atlas Info**: Hiển thị thông tin chi tiết về atlas

## 🚀 Cách sử dụng

1. Mở `index.html` trong trình duyệt
2. Upload file .plist (hoặc .xml) vào ô bên trái
3. Upload texture image (.png, .jpg) vào ô bên phải
4. Click "Giải nén Sprite Atlas" để xử lý
5. Xem thông tin atlas và preview các sprites
6. Tải xuống từng sprite hoặc tất cả cùng lúc

## 📋 Format hỗ trợ

### Atlas Data Files:
- **Cocos Creator**: .plist, .xml (XML format)
- **Unity TexturePacker**: .tpsheet (Text format), .json (JSON format)

### Image Files:
- **Texture Atlas**: .png, .jpg, .jpeg

### Features:
- **Rotated sprites**: Xử lý sprites bị xoay trong atlas
- **Trimmed sprites**: Hỗ trợ sprites đã được trim
- **Pivot points**: Thông tin pivot cho Unity sprites
- **Borders**: 9-slice border information
- **Source rectangles**: Thông tin vị trí gốc
- **Metadata**: Thông tin chi tiết về atlas

## 📁 Cấu trúc Project

```
texture-unpacker/
├── index.html          # Giao diện chính
├── styles.css          # Styling và responsive design
├── script.js           # Logic xử lý texture
└── README.md          # Tài liệu hướng dẫn
```

## 🛠️ Công nghệ sử dụng

- **HTML5**: Canvas API để xử lý image data
- **CSS3**: Modern styling với gradients và animations
- **Vanilla JavaScript**: Không dependencies, chạy trực tiếp trên browser

## 🔧 Tính năng nâng cao có thể thêm

- Hỗ trợ format khác: Spine Atlas, Starling XML
- Auto-detect format từ file content
- Sprite animation preview
- Batch rename với patterns
- Re-pack sprites thành atlas mới
- Color analysis và optimization
- Export to different formats

## 📱 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers với HTML5 Canvas support

## 🤝 Đóng góp

Đây là một dự án open source! Chúng tôi hoan nghênh mọi đóng góp:

- 🐛 **Bug reports**: Tạo issue trên GitHub
- 💡 **Feature requests**: Đề xuất tính năng mới
- 🔧 **Pull requests**: Cải thiện code
- 📖 **Documentation**: Cải thiện tài liệu
- ⭐ **Star the repo**: Ủng hộ dự án

### Cách đóng góp:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới [MIT License](LICENSE).

## 👨‍💻 Tác giả

**dmthong181096**
- GitHub: [@dmthong181096](https://github.com/dmthong181096)
- Project: [unpack-texture](https://github.com/dmthong181096/unpack-texture)