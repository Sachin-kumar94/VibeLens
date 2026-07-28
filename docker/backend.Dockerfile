FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for OpenCV & PyTorch
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Mock requirements.txt inline or directly install
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    numpy \
    opencv-python-headless \
    onnxruntime \
    torchvision \
    pydantic \
    pymongo \
    redis

COPY . .

EXPOSE 8000

CMD ["uvicorn", "ai-service.main:app", "--host", "0.0.0.0", "--port", "8000"]
