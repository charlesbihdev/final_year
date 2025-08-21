from PIL import Image, ImageEnhance
import torch
import io
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1

# Optimized MTCNN with more lenient settings for better detection
mtcnn = MTCNN(
    image_size=160, 
    margin=20,  # Increased margin to capture more of the face
    min_face_size=20,  # Lower minimum face size for better detection
    thresholds=[0.6, 0.7, 0.7],  # More lenient thresholds
    factor=0.709,  # Slightly more aggressive scaling
    post_process=False,  # Disable post-processing for speed
    device='cpu'  # Use CPU for consistency
)
resnet = InceptionResnetV1(pretrained='vggface2').eval()

def preprocess_image(image_bytes):
    """Preprocess image to handle iPhone-specific issues"""
    try:
        # Open image and convert to RGB
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Resize if image is too large (iPhone photos are often 3000+ px)
        max_size = 1024
        width, height = img.size
        if max(width, height) > max_size:
            scale = max_size / max(width, height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Enhance image quality for better face detection
        # Increase contrast slightly
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        
        # Increase brightness slightly
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.1)
        
        # Convert back to RGB
        img = img.convert('RGB')
        
        return img
        
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        # Fallback to original processing
        return Image.open(io.BytesIO(image_bytes)).convert('RGB')

def get_face_embedding(image_bytes):
    """Get face embedding with improved preprocessing and multiple detection attempts"""
    try:
        # Preprocess the image
        img = preprocess_image(image_bytes)
        
        # First attempt: Try with original image
        face = mtcnn(img)
        
        # If no face detected, try with different preprocessing
        if face is None:
            # Try with increased brightness
            enhancer = ImageEnhance.Brightness(img)
            bright_img = enhancer.enhance(1.3)
            face = mtcnn(bright_img)
        
        # If still no face, try with increased contrast
        if face is None:
            enhancer = ImageEnhance.Contrast(img)
            contrast_img = enhancer.enhance(1.4)
            face = mtcnn(contrast_img)
        
        # If still no face, try with sharpening
        if face is None:
            enhancer = ImageEnhance.Sharpness(img)
            sharp_img = enhancer.enhance(1.5)
            face = mtcnn(sharp_img)
        
        # If still no face, try with different MTCNN settings
        if face is None:
            # Use more lenient MTCNN settings
            lenient_mtcnn = MTCNN(
                image_size=160,
                margin=30,
                min_face_size=15,
                thresholds=[0.5, 0.6, 0.6],  # Even more lenient
                factor=0.8,
                post_process=False,
                device='cpu'
            )
            face = lenient_mtcnn(img)
        
        if face is None:
            return None
            
        # Get embedding
        with torch.no_grad():
            embedding = resnet(face.unsqueeze(0)).numpy()[0]
        
        return embedding
        
    except Exception as e:
        print(f"Error in face embedding: {e}")
        # Fallback to original simple method
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            face = mtcnn(img)
            if face is None:
                return None
            with torch.no_grad():
                embedding = resnet(face.unsqueeze(0)).numpy()[0]
            return embedding
        except:
            return None
