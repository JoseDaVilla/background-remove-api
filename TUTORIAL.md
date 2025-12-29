# React Native - Background Removal API Tutorial

## 🚀 Quick Start Guide

This API removes backgrounds from images using AI. Send an image, get back a PNG with transparent background.

---

## 📡 API Endpoint

```
POST https://background-remove-api-ha42.onrender.com/remove-bg
```

**For Production:** Replace `localhost:3000` with your deployed server URL.

---

## 📤 Request Format

- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Field Name:** `image`
- **Max File Size:** 10MB
- **Supported Formats:** JPG, PNG, WEBP, etc.

---

## 📥 Response Format

- **Content-Type:** `image/png`
- **Body:** Binary PNG image data with transparent background

---

## 🔧 React Native Implementation

### Option 1: Using `fetch` (Built-in)

```javascript
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const API_URL = 'https://background-remove-api-ha42.onrender.com/remove-bg'; // Change for production

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickAndProcessImage = async () => {
    try {
      // 1. Pick image from gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      setOriginalImage(imageUri);
      setLoading(true);

      // 2. Create FormData
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg', // or detect from file
        name: 'photo.jpg',
      });

      // 3. Send to API
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 4. Get blob and convert to base64
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64data = reader.result;
        setProcessedImage(base64data);
        setLoading(false);
      };
      
      reader.readAsDataURL(blob);

    } catch (error) {
      console.error('Error removing background:', error);
      alert('Failed to remove background: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity 
        onPress={pickAndProcessImage}
        style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          Pick Image & Remove Background
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      )}

      {originalImage && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Original:</Text>
          <Image source={{ uri: originalImage }} style={{ width: 300, height: 300 }} />
        </View>
      )}

      {processedImage && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            Background Removed:
          </Text>
          <Image 
            source={{ uri: processedImage }} 
            style={{ width: 300, height: 300, backgroundColor: '#f0f0f0' }} 
          />
        </View>
      )}
    </View>
  );
}
```

---

### Option 2: Using `axios` (Recommended)

**Install axios:**
```bash
npm install axios
```

**Implementation:**
```javascript
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'https://background-remove-api-ha42.onrender.com/remove-bg';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickAndProcessImage = async () => {
    try {
      // 1. Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      setOriginalImage(imageUri);
      setLoading(true);

      // 2. Create FormData
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      // 3. Send to API with axios
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Important for binary data
        timeout: 60000, // 60 second timeout (processing takes 10-30s)
      });

      // 4. Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImage(reader.result);
        setLoading(false);
      };
      reader.readAsDataURL(response.data);

    } catch (error) {
      console.error('Error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 503) {
        alert('Server is busy processing other images. Please try again in a moment.');
      } else if (error.code === 'ECONNABORTED') {
        alert('Request timed out. The image might be too large or server is slow.');
      } else {
        alert('Failed to remove background: ' + error.message);
      }
      
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>
      <TouchableOpacity 
        onPress={pickAndProcessImage}
        disabled={loading}
        style={{ 
          backgroundColor: loading ? '#ccc' : '#007AFF', 
          padding: 15, 
          borderRadius: 8 
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          {loading ? 'Processing...' : 'Pick Image & Remove Background'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      )}

      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        {originalImage && (
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Original:</Text>
            <Image 
              source={{ uri: originalImage }} 
              style={{ width: '100%', height: 200, borderRadius: 8 }} 
              resizeMode="contain"
            />
          </View>
        )}

        {processedImage && (
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Processed:</Text>
            <Image 
              source={{ uri: processedImage }} 
              style={{ 
                width: '100%', 
                height: 200, 
                backgroundColor: '#f0f0f0',
                borderRadius: 8 
              }} 
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </View>
  );
}
```

---

### Option 3: Save to File System (Expo)

```javascript
import * as FileSystem from 'expo-file-system';

const saveProcessedImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Processing failed');

    // Save to file system
    const filename = FileSystem.documentDirectory + `processed_${Date.now()}.png`;
    const blob = await response.blob();
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1]; // Remove data:image/png;base64,
      await FileSystem.writeAsStringAsync(filename, base64data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Saved to:', filename);
      return filename;
    };
    reader.readAsDataURL(blob);

  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📱 Required Permissions

### For Expo:
```bash
npx expo install expo-image-picker
```

### For bare React Native:

**iOS - Info.plist:**
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to remove backgrounds</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take photos</string>
```

**Android - AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.CAMERA"/>
```

---

## 🔌 Network Configuration

### iOS (Development)

Add to `Info.plist` to allow localhost connections:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

### Android (Development)

**For physical device:** Use your computer's IP instead of localhost:
```javascript
const API_URL = 'http://192.168.1.100:3000/remove-bg'; // Your PC's IP
```

**For emulator:** Use `10.0.2.2` instead of `localhost`:
```javascript
const API_URL = 'http://10.0.2.2:3000/remove-bg';
```

---

## ⚙️ Production Deployment

### Update API URL based on environment:

```javascript
const API_URL = __DEV__ 
  ? 'https://background-remove-api-ha42.onrender.com/remove-bg' 
  : 'https://your-api.com/remove-bg';
```

Or use environment variables:
```javascript
import { API_URL } from '@env';

// In .env file:
// API_URL=https://your-production-api.com/remove-bg
```

---

## 🎨 Advanced: Custom Hook

Create a reusable hook:

```javascript
// hooks/useBackgroundRemoval.js
import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://background-remove-api-ha42.onrender.com/remove-bg';

export const useBackgroundRemoval = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeBackground = async (imageUri) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { removeBackground, loading, error };
};

// Usage:
// const { removeBackground, loading, error } = useBackgroundRemoval();
// const result = await removeBackground(imageUri);
```

---

## 🐛 Troubleshooting

### Issue: "Network request failed"
- **Solution:** Check API URL is correct and server is running
- For Android emulator, use `10.0.2.2:3000` instead of `localhost:3000`
- For physical device, use your PC's IP address

### Issue: "Upload failed" or 400 error
- **Solution:** Verify the FormData field name is `'image'`
- Check file size is under 10MB
- Ensure image format is supported

### Issue: Image not displaying
- **Solution:** Add `backgroundColor` to Image component to see transparent areas
- Verify the base64 data includes the proper prefix: `data:image/png;base64,`

### Issue: Slow processing
- **Solution:** Background removal takes 5-15 seconds depending on image size
- Show loading indicator to user
- Consider adding timeout (30-60 seconds)

---

## 📊 API Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success - PNG image returned |
| 400  | Missing image file or invalid format |
| 503  | Server busy - too many requests in queue (retry after 5-10s) |
| 500  | Server error - check server logs |

---

## 💡 Tips & Best Practices

1. **Show Loading State:** Background removal can take 10-30 seconds
2. **Compress Images:** Keep images under 5MB for best results on free tier
3. **Error Handling:** Always wrap API calls in try-catch
4. **Background Color:** Add a checkered or colored background to preview transparency
5. **Timeout:** Set request timeout to 60 seconds minimum
6. **Retry Logic:** Implement retry for 503 errors (server busy)
7. **Image Quality:** Higher quality inputs = better results
8. **File Size:** Smaller images process faster and use less memory

---

## 🎯 Example: Complete Screen

```javascript
// screens/BackgroundRemoverScreen.js
import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = __DEV__ 
  ? 'https://background-remove-api-ha42.onrender.com/remove-bg'
  : 'https://your-api.com/remove-bg';

export default function BackgroundRemoverScreen() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri) => {
    setOriginalImage(uri);
    setProcessedImage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        timeout: 60000, // 60 second timeout
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImage(reader.result);
        setLoading(false);
      };
      reader.readAsDataURL(response.data);

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to remove background. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Remover</Text>

      <TouchableOpacity 
        onPress={handlePickImage}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Pick Image'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Removing background...</Text>
        </View>
      )}

      <View style={styles.imagesContainer}>
        {originalImage && (
          <View style={styles.imageBox}>
            <Text style={styles.label}>Original</Text>
            <Image source={{ uri: originalImage }} style={styles.image} />
          </View>
        )}

        {processedImage && (
          <View style={styles.imageBox}>
            <Text style={styles.label}>Processed</Text>
            <Image 
              source={{ uri: processedImage }} 
              style={[styles.image, styles.processedImage]} 
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageBox: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  processedImage: {
    backgroundColor: '#f0f0f0', // Shows transparent areas
  },
});
```

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "expo-image-picker": "~14.0.0",
    "axios": "^1.6.0"
  }
}
```

Install:
```bash
npx expo install expo-image-picker
npm install axios
```

---

## 🚀 Ready to Use!

Your background removal API is ready! Start building amazing features:
- Profile photo editors
- Product photography apps
- Social media filters
- E-commerce image tools

Happy coding! 🎉
