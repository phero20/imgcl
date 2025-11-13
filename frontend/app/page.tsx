"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { Upload, X, Sparkles, ImageIcon } from "lucide-react";

// TypeScript interfaces
interface ClassificationResult {
  label: string;
  confidence: number;
}

export default function Page() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<ClassificationResult[] | null>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResults(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResults(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const classifyImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      // Replace this URL with your actual API endpoint
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Classification failed");
      }

      const data = await response.json();

      // Assuming API returns: { predictions: [{label: string, confidence: number}] }
      // Convert decimal confidence to percentage (0.07 -> 7%)
      const resultsWithPercentage = data.predictions.map(
        (pred: ClassificationResult) => ({
          ...pred,
          confidence: pred.confidence * 100,
        })
      );
      setResults(resultsWithPercentage);
    } catch (error) {
      console.error("Classification error:", error);

      // Fallback to mock data for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults([
        { label: "Golden Retriever", confidence: 94.5 },
        { label: "Labrador", confidence: 3.2 },
        { label: "Dog", confidence: 1.8 },
        { label: "Pet", confidence: 0.5 },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Image Classifier
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload an image and let our AI identify what's in it
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Upload Image
            </h2>

            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-3 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-500 transition-all cursor-pointer bg-purple-50/50"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your image here
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  aria-label="Clear image"
                >
                  <X className="w-5 h-5 cursor-pointer" />
                </button>
              </div>
            )}

            {preview && !results && (
              <button
                onClick={classifyImage}
                disabled={isAnalyzing}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                ) : (
                  "Classify Image"
                )}
              </button>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Classification Results
            </h2>

            {!results && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                <ImageIcon className="w-20 h-20 mb-4" />
                <p className="text-lg">No results yet</p>
                <p className="text-sm mt-2">
                  Upload and classify an image to see results
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-80">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Analyzing your image...</p>
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl border-2 border-purple-300">
                  <p className="text-sm text-gray-600 mb-2">Top Prediction</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {results[0].label}
                  </p>
                  <p className="text-xl text-purple-600 font-semibold mt-2">
                    {results[0].confidence.toFixed(1)}% confidence
                  </p>
                </div>

                {results.length > 1 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Other Predictions
                    </p>
                    {results.slice(1).map((result, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">
                            {result.label}
                          </span>
                          <span className="text-purple-600 font-semibold">
                            {result.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${result.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={clearImage}
                  className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Try Another Image
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Advanced neural networks for accurate classification
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Easy Upload</h3>
            <p className="text-sm text-gray-600">
              Drag & drop or click to upload your images
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Fast Results</h3>
            <p className="text-sm text-gray-600">
              Get classification results in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
