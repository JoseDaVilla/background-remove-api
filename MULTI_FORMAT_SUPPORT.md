# 🎨 Multi-Format Image Support

Your API now accepts **multiple image formats** and always returns **PNG with transparent background**.

## ✅ Supported Input Formats

- **JPG/JPEG** - Most common format
- **PNG** - Already has transparency support
- **WEBP** - Modern web format
- **GIF** - Animated images (processes first frame)
- **BMP** - Bitmap images
- **TIFF** - High-quality format
- **HEIC/HEIF** - iPhone photos

## 🔄 How It Works

1. **Upload** any supported format (JPG, PNG, WEBP, etc.)
2. **Processing** converts and removes background
3. **Output** is always PNG with transparent background

## 🧪 Testing Different Formats

```bash
# Test with JPG
curl -X POST http://localhost:3000/remove-bg -F "image=@photo.jpg" -o result.png

# Test with PNG
curl -X POST http://localhost:3000/remove-bg -F "image=@image.png" -o result.png

# Test with WEBP
curl -X POST http://localhost:3000/remove-bg -F "image=@photo.webp" -o result.png

# Test with GIF
curl -X POST http://localhost:3000/remove-bg -F "image=@animated.gif" -o result.png

# Test with HEIC (iPhone photo)
curl -X POST http://localhost:3000/remove-bg -F "image=@IMG_1234.heic" -o result.png
```

## 📱 React Native - Auto-Detect Format

```javascript
const pickAndProcessImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return;

  const imageUri = result.assets[0].uri;
  
  // Auto-detect MIME type from URI
  const fileExtension = imageUri.split('.').pop().toLowerCase();
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: mimeTypes[fileExtension] || 'image/jpeg',
    name: `photo.${fileExtension}`,
  });

  // Send to API - will always get PNG back
  const response = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 60000,
  });

  // Process response (PNG format)
  // ...
};
```

## ⚠️ Error Handling

```javascript
try {
  const response = await axios.post(API_URL, formData);
} catch (error) {
  if (error.response?.status === 400) {
    const errorData = error.response.data;
    
    if (errorData.error === 'Unsupported image format') {
      Alert.alert(
        'Unsupported Format',
        `Please use: ${errorData.supportedFormats.join(', ')}`
      );
    } else if (errorData.error === 'File too large') {
      Alert.alert(
        'File Too Large',
        `Maximum file size is ${errorData.maxSize}`
      );
    }
  }
}
```

## 🎯 Benefits

1. **Universal Support** - Works with any image from any device
2. **iPhone Compatible** - Supports HEIC/HEIF formats
3. **Modern Formats** - WEBP for better compression
4. **Consistent Output** - Always get PNG with transparency
5. **Better Quality** - No quality loss from multiple conversions

## 📏 File Size Limits

- **Maximum:** 5MB per image
- **Recommended:** 2-3MB for faster processing
- **Tip:** Compress images before upload on mobile

## 💡 Pro Tips

1. **Format Detection:** The API auto-detects format from file content, not extension
2. **Transparency:** PNG output always has transparent background
3. **GIF Handling:** Only first frame is processed (no animation output)
4. **HEIC Support:** Great for iPhone users who upload photos directly
5. **Compression:** Consider compressing large images before upload

---

**Status:** ✅ Multi-format support enabled!  
**Output:** Always PNG with transparent background
