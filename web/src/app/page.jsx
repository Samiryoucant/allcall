import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Download,
  History,
  Palette,
  Settings,
  Home,
  Moon,
  Sun,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function SamirGenApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageHistory, setImageHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load images from database on component mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/images");
      if (!response.ok) {
        throw new Error("Failed to load images");
      }
      const data = await response.json();
      const formattedImages = data.images.map((img) => ({
        id: img.id,
        url: img.image_url,
        prompt: img.prompt,
        timestamp: img.created_at,
      }));
      setGeneratedImages(formattedImages);
      setImageHistory(formattedImages);
    } catch (err) {
      console.error("Error loading images:", err);
      // Fallback to sample data if database fails
      const sampleImages = [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
          prompt: "A futuristic cityscape at sunset",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=512&h=512&fit=crop",
          prompt: "Abstract digital art with neon colors",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&h=512&fit=crop",
          prompt: "Mystical forest with glowing particles",
        },
        {
          id: 4,
          url: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=512&h=512&fit=crop",
          prompt: "Cyberpunk street scene with holographic displays",
        },
      ];
      setGeneratedImages(sampleImages);
      setImageHistory(sampleImages);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      const newImage = {
        id: data.id || Date.now(),
        url: data.imageUrl,
        prompt: prompt,
        timestamp: data.timestamp,
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      setImageHistory((prev) => [newImage, ...prev]);
      setPrompt("");
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  const downloadImage = useCallback(async (imageUrl, prompt) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `samir-gen-${prompt
        .slice(0, 20)
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  const sidebarItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "styles", label: "Styles", icon: Palette },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]"
          : "bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]"
      }`}
    >
      {/* Top Navigation */}
      <nav
        className={`w-full h-16 ${
          darkMode
            ? "bg-black/20 border-white/10"
            : "bg-white/20 border-black/10"
        } backdrop-blur-xl border-b flex items-center justify-between px-6 relative`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-lg ${
              darkMode
                ? "bg-gradient-to-r from-cyan-400 to-purple-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            } flex items-center justify-center`}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1
            className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Samir Gen
          </h1>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl ${
            darkMode
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-black/10 hover:bg-black/20 text-gray-900"
          } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex w-64 ${
            darkMode
              ? "bg-black/20 border-white/10"
              : "bg-white/20 border-black/10"
          } backdrop-blur-xl border-r flex-col p-6`}
        >
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === item.id
                      ? darkMode
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-lg shadow-cyan-500/25"
                        : "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 shadow-lg shadow-blue-500/25"
                      : darkMode
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-gray-600 hover:bg-black/10 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "home" && (
            <div className="p-6 lg:p-8 space-y-8">
              {/* Prompt Section */}
              <div className="max-w-2xl mx-auto">
                <div
                  className={`${
                    darkMode
                      ? "bg-black/20 border-white/20"
                      : "bg-white/30 border-white/50"
                  } backdrop-blur-xl rounded-2xl border p-6 shadow-2xl`}
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        className={`w-full h-24 px-4 py-3 rounded-xl ${
                          darkMode
                            ? "bg-white/10 border-white/20 text-white placeholder-white/50"
                            : "bg-white/50 border-black/20 text-gray-900 placeholder-gray-500"
                        } backdrop-blur-sm border resize-none focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "focus:ring-cyan-400/50"
                            : "focus:ring-blue-500/50"
                        } transition-all duration-300`}
                      />
                    </div>

                    <button
                      onClick={generateImage}
                      disabled={isGenerating || !prompt.trim()}
                      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                        darkMode
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                      } hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Generate</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className={`mt-4 p-4 rounded-xl ${
                      darkMode
                        ? "bg-red-500/20 border-red-500/30 text-red-300"
                        : "bg-red-500/20 border-red-500/30 text-red-700"
                    } border backdrop-blur-sm`}
                  >
                    {error}
                  </div>
                )}
              </div>

              {/* Generated Images Grid */}
              <div className="max-w-6xl mx-auto">
                <h2
                  className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Generated Images
                </h2>

                {generatedImages.length === 0 ? (
                  <div
                    className={`${
                      darkMode
                        ? "bg-black/20 border-white/10"
                        : "bg-white/20 border-black/10"
                    } backdrop-blur-xl rounded-2xl border p-12 text-center`}
                  >
                    <Sparkles
                      className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-white/50" : "text-gray-400"}`}
                    />
                    <p
                      className={`text-lg ${darkMode ? "text-white/70" : "text-gray-600"}`}
                    >
                      No images generated yet. Enter a prompt above to get
                      started!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {generatedImages.map((image) => (
                      <div
                        key={image.id}
                        className={`group ${
                          darkMode
                            ? "bg-black/20 border-white/10 hover:border-cyan-400/50"
                            : "bg-white/30 border-white/50 hover:border-blue-500/50"
                        } backdrop-blur-xl rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                          darkMode
                            ? "hover:shadow-cyan-500/25"
                            : "hover:shadow-blue-500/25"
                        }`}
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <button
                              onClick={() =>
                                downloadImage(image.url, image.prompt)
                              }
                              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 rounded-full ${
                                darkMode
                                  ? "bg-white/20 hover:bg-white/30 text-white"
                                  : "bg-black/20 hover:bg-black/30 text-white"
                              } backdrop-blur-sm hover:scale-110`}
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <p
                          className={`text-sm ${darkMode ? "text-white/70" : "text-gray-600"} line-clamp-2`}
                        >
                          {image.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-6 lg:p-8">
              <h2
                className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Generation History
              </h2>

              {imageHistory.length === 0 ? (
                <div
                  className={`${
                    darkMode
                      ? "bg-black/20 border-white/10"
                      : "bg-white/20 border-black/10"
                  } backdrop-blur-xl rounded-2xl border p-12 text-center`}
                >
                  <History
                    className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-white/50" : "text-gray-400"}`}
                  />
                  <p
                    className={`text-lg ${darkMode ? "text-white/70" : "text-gray-600"}`}
                  >
                    No generation history yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {imageHistory.map((image) => (
                    <div
                      key={image.id}
                      className={`group ${
                        darkMode
                          ? "bg-black/20 border-white/10 hover:border-cyan-400/50"
                          : "bg-white/30 border-white/50 hover:border-blue-500/50"
                      } backdrop-blur-xl rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                        darkMode
                          ? "hover:shadow-cyan-500/25"
                          : "hover:shadow-blue-500/25"
                      }`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <button
                            onClick={() =>
                              downloadImage(image.url, image.prompt)
                            }
                            className={`opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 rounded-full ${
                              darkMode
                                ? "bg-white/20 hover:bg-white/30 text-white"
                                : "bg-black/20 hover:bg-black/30 text-white"
                            } backdrop-blur-sm hover:scale-110`}
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p
                        className={`text-sm ${darkMode ? "text-white/70" : "text-gray-600"} line-clamp-2 mb-2`}
                      >
                        {image.prompt}
                      </p>
                      {image.timestamp && (
                        <p
                          className={`text-xs ${darkMode ? "text-white/50" : "text-gray-500"}`}
                        >
                          {new Date(image.timestamp).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === "styles" || activeTab === "settings") && (
            <div className="p-6 lg:p-8">
              <h2
                className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {activeTab === "styles" ? "Art Styles" : "Settings"}
              </h2>

              <div
                className={`${
                  darkMode
                    ? "bg-black/20 border-white/10"
                    : "bg-white/20 border-black/10"
                } backdrop-blur-xl rounded-2xl border p-12 text-center`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-white/50" : "text-gray-400"}`}
                >
                  {activeTab === "styles" ? (
                    <Palette className="w-16 h-16" />
                  ) : (
                    <Settings className="w-16 h-16" />
                  )}
                </div>
                <p
                  className={`text-lg ${darkMode ? "text-white/70" : "text-gray-600"}`}
                >
                  {activeTab === "styles"
                    ? "Style presets coming soon!"
                    : "Settings panel coming soon!"}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 ${
          darkMode
            ? "bg-black/20 border-white/10"
            : "bg-white/20 border-black/10"
        } backdrop-blur-xl border-t px-6 py-3`}
      >
        <div className="flex justify-around">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-300 ${
                  activeTab === item.id
                    ? darkMode
                      ? "text-cyan-300"
                      : "text-blue-600"
                    : darkMode
                      ? "text-white/70"
                      : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
