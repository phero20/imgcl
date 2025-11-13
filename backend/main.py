import io
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2, preprocess_input, decode_predictions
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = MobileNetV2(weights="imagenet") 


def prepare_image(image: Image.Image):
    """Resize + convert to array + preprocess"""
    image = image.resize((224, 224)) 
    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)  
    img_array = preprocess_input(img_array)
    return img_array
    
@app.get("/")
def home():
    return {"message": "Image Classification API is running!"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image into Pillow
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    # Prepare image
    processed_img = prepare_image(img)

    # Predict
    preds = model.predict(processed_img)
    decoded = decode_predictions(preds, top=1)[0][0]

    label = decoded[1]        # class name
    confidence = float(decoded[2])  # probability

    return {
        "prediction": label,
        "confidence": confidence
    }