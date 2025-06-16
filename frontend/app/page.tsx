"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const handleUpload = async (uploadFile: File) => {
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
      setResult(data);
      console.log("Upload successful:", data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }
  return (
    <div className="flex flex-row bg-[#021327] w-screen min-h-screen ">

      <div className="w-1/10 h-full bg-inherit flex flex-col items-center justify-center border-2 border-r-[#f3b530c4]">
        <Image
          src="/alethia_improved.png"
          alt="Logo"
          width={100}
          height={100}
          className="rounded-lg shadow-md mt-2"
        />
        <span className="text-white p-2 m-2">Logo</span>
      </div>
      <div className="flex-1 bg-[#021327] flex flex-col items-center justify-center">
        <Image
          src="/alethia_improved.png"
          alt="Logo"
          width={150}
          height={150}
          className="rounded-lg shadow-md"
        />

        <h1 className="font-cinzel text-8xl text-[#f3b530c4]">ALETHIA</h1>

        <div className="flex flex-col  m-3 border-2 border-[#f3b530c4] p-15 bg-inherit rounded-lg">
          <span className="font-bold text-2xl text-[#f3b530c4] m-2 p-2">Trace an image</span>
          <label className="cursor-pointer text-white bg-inherit border-1 border-[#f3b530c4] p-2  items-center justify-center flex hover:bg-amber-400 hover:text-black transition-colors duration-300 rounded-lg">
            <div className="flex flex-col items-center justify-center pointer-events-none">
              {file ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-8 w-8 text-[#10ec1fc4] mb-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 2h9l6 6v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
                    />
                  </svg>
                  <span className="mt-1 text-sm text-[#10ec1fc4] font-medium">{file.name}</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[#f3b530c4] mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4-4m0 0l-4 4m4-4v12"
                    />
                  </svg>
                  <span className="text-[#f3b530c4]">Upload an image</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  handleUpload(selectedFile); // Pass file directly or delay until confirmed
                }
              }}
            />
          </label>
        </div>
        <div className="relative flex flex-col m-2">
          {result && (
            
            <div className="mt-6 text-white w-3/4">
              <h1 className="text-2xl font-bold text-[#f3b530c4] ml-1">Conclusion</h1>
              <h2 className="text-xl font-bold mb-2">SerpAPI Results</h2>
              <p><span className="font-semibold">Best guess:</span> {result.best_guess}</p>
              <p><span className="font-semibold">Total matches:</span> {result.total_results}</p>
              <ul className="mt-2 list-disc list-inside">
                {result.pages.map((p: any) => (
                  <li key={p.link}>
                    <a href={p.link} target="_blank" className="text-blue-400 underline">{p.title}</a>
                    <p className="text-sm text-gray-300">{p.snippet}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
