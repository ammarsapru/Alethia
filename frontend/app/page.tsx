"use client";
import Image from "next/image";
import { useState } from "react";
import BiasPieChart from "./biasPieChart";
import SourceList from "./sourceList";
import React from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [biasPercentages, setBiasPercentages] = useState<Record<string, number>>({});
  const [sourceList, setSourceList] = useState<Record<string, { url: string; summary: string }[]>>({});
  const [imageDescription, setImageDescription] = useState<any | null>(null);
  const [earliestDate, setEarliestDate] = useState<string | null>(null);
  // ✅ Enable mock mode for testing without uploading
  const MOCK_MODE = false;
  const mocksourceList = {
    "bbc.com": [
      "https://bbc.com/news/article1",
      "https://bbc.com/news/article2"
    ],
    "cnn.com": [
      "https://cnn.com/story1"
    ],
    "aljazeera.com": [
      "https://www.aljazeera.com/news/2024/04/20/special-report-photo",
      "https://www.aljazeera.com/news/2024/05/02/image-analysis"
    ]
  };

  const mockBiasPercentages = {
    "left": 20,
    "left-center": 10,
    "center": 35,
    "right-center": 15,
    "right": 20
  };
  const mock_Description = `Response from Gemini:

Here’s a concise description of the image:

A close-up, high-quality reproduction of Leonardo da Vinci’s “Mona Lisa.”  
• The sitter is shown seated, hands gently clasped, dark hair framing her face and the famous enigmatic smile intact.  
• Muted earth-tone palette—browns, greens, and soft blues—renders the receding landscape behind her.  

The painting is housed in an ornate, gold-colored baroque/rococo frame with intricate carvings and an antique patina.  
Even, diffuse lighting eliminates harsh shadows, so both the artwork and frame details are clearly visible.`;

  const mockResult = {
    image_url: "/example.png",
    total_matches: 5,
    summary: "This image has appeared on multiple news sites and may have been altered.",
    bias_percentages: {
      left: 25,
      center: 50,
      right: 25,
    },
    knowledge_graph: {
      title: "Naturalism in Art",
      type: "Art Movement",
      description: "Naturalism is a style and theory of representation based on the accurate depiction of detail.",
      image_subject: "A painting showing realistic depiction of rural life, in 19th century style.",
      usage_context: "Used in articles discussing Renaissance and Naturalistic movements in art.",
      source_summary: "Referenced in educational resources and historical art sites.",
      likely_origin: "19th century Europe, likely France or Italy.",
      location_guess: "Europe",
      additional_notes: "The image is often used in classrooms and artistic discussions about realism vs romanticism."
    }
  };
  const mockDate = "2024-04-2012"; // Example date for the image
  const mock_knowledge_graph = mockResult.knowledge_graph;
  const mock_percentages = mockResult.bias_percentages;
  const handleUpload = async (uploadFile: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/search/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setIsLoading(false);
      setResult(data);
      setBiasPercentages(data.biases);
      setSourceList(data.source_clusters);
      setImageDescription(data.image_description);
      setEarliestDate(data.earliest_date);
      // let sourceList = result.source_clusters;
      // let knowledgeGraph = result.knowledge_graph;

      console.log("Upload successful:", data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }

  };


  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-[#06132a] w-screen overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-row p-4 w-full  border-gray-600 items-center justify-center">
          <div className="flex flex-row items-center justify-center">
            <Image
              src="/alethia_white.png"
              alt="Alethia Logo"
              width={50}
              height={50}
              className="m-2 rounded-lg"
            />
            <h1 className="text-3xl font-lubrifont  text-white ">Alethia</h1>
          </div>

        </div>

        {/* Main Upload Section */}
        <div className="m-4 flex flex-col items-center w-full">


          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile) {
                setFile(droppedFile);
                handleUpload(droppedFile);
              }
            }}
            className={`m-4 cursor-pointer text-white border ${isDragging ? "border-amber-500 bg-[#1f2632]" : "border-gray-600"} p-10  px-40 items-center justify-center flex flex-col hover:bg-amber-400 hover:text-black transition-colors duration-300 rounded-lg`}
          >
            <label className="flex flex-col items-center justify-center pointer-cursor">
              {file ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#10ec1fc4] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2h9l6 6v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                  </svg>
                  <span className="mt-1 text-sm text-[#10ec1fc4] font-medium">{file.name}</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className=" cursor-pointer h-8 w-8 text-[#f3b530c4] mb-2" fill="currentColor" viewBox="0 0 640 512" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                  <span className="text-white cursor-pointer">Click or Drag to Upload an Image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    handleUpload(selectedFile);
                  }
                }}
              />
            </label>
          </div>

          {/* Result Section */}
          {(MOCK_MODE ? mockResult : result) && (
            <div className="flex flex-col m-6 p-6 rounded-lg bg-inherit shadow-md w-3/4 ">

              <div className="flex flex-row justify-between m-2">

                <div className="flex flex-col mt-6 p-4 rounded-lg border border-gray-600 w-1/2">

                  <h1 className="text-lg text-white">Uploaded Iamge</h1>

                  <div className="flex justify-center mb-4 mr-4">
                    <img
                      src={(MOCK_MODE ? mockResult : result).image_url}
                      alt="Uploaded"
                      className=" max-w-lg min-h-[350px] h-[400px] rounded-md border border-[#f3b530c4]"
                    />

                  </div>

                </div>
                <div className="ml-4 w-1/2 min-h-[350px] h-[500px] p-4 bg-inherit rounded shadow mt-6 border border-gray-600">
                  <BiasPieChart data={MOCK_MODE ? mockBiasPercentages : biasPercentages} />
                </div>

              </div>
              <div className="flex flex-col m-2 p-4 rounded-lg border border-gray-600">

                <h1 className="text-lg text-white">Verification Report</h1>

                <div className="flex flex-row justify-between m-2">

                  <div className="flex flex-col w-1/3">

                    <h1 className="text-lg text-white">Total Matches:</h1>

                    <span className="text-white">
                      {(MOCK_MODE ? mockResult : result).total_matches}
                    </span>

                    <h1 className="text-lg text-white">Earliest date of publication</h1>

                    <span className="text-white">
                      {(MOCK_MODE ? mockDate : earliestDate)}
                    </span>

                  </div>

                  <div className="flex flex-col w-2/3  m-2 p-3">
                    <h1 className="text-lg text-white mb-2 mt-0">
                      Image Analysis:
                    </h1>
                    <span className="text-white">
                      {(MOCK_MODE ? mock_Description : imageDescription)}
                    </span>
                  </div>

                </div>

              </div>
              <div className="flex flex-col m-2 p-4 rounded-lg ">
                <h1 className="text-lg text-white mb-2">Sources</h1>
                <SourceList data={MOCK_MODE ? mocksourceList : sourceList} />
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <img
              src="/flame.png"
              className="w-12 h-12 animate-bounce mt-[-2.5rem]"
              alt="Torch flame"
            />
            <img src="/torch.png" className="w-24 h-24" alt="Torch base" />
          </div>
        </div>
      )}
    </>
  );
}
