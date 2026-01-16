import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

def format_data_for_prompt(serp_data, exif_data, ai_analysis):
    """Helper to format JSON data into readable text for the LLM."""
    
    # Extract useful SERP info (Sources and Titles)
    organic = serp_data.get("organic_results", [])
    top_results = []
    sources = set()
    
    for res in organic[:10]: # Analyze top 10 results
        source = res.get('source', 'Unknown Source')
        sources.add(source)
        top_results.append(f"- Headline: {res.get('title')}\n  Source: {source}\n  Date: {res.get('date', 'Unknown')}")
    
    serp_summary = "\n".join(top_results) if top_results else "No significant web matches found."
    source_list = ", ".join(list(sources)) if sources else "None"
    
    # Extract AI scores
    verdict = ai_analysis.get('verdict', 'Unknown')
    ai_conf = ai_analysis.get('ai_id_confidence', 0)
    human_conf = ai_analysis.get('human_confidence', 0)
    
    return f"""
    === FORENSIC DATA START ===
    [EXIF METADATA]
    {exif_data}

    [AI DETECTION TECHNICAL ANALYSIS]
    Verdict: {verdict}
    AI Confidence Score: {ai_conf}
    Human Confidence Score: {human_conf}

    [WEB PROPAGATION CONTEXT (SERP)]
    Publishers/Sources: {source_list}
    Top Search Matches:
    {serp_summary}
    === FORENSIC DATA END ===
    """

async def generate_comprehensive_report(image_path, serp_data, exif_data, ai_analysis):
    print("--- NEW genai_analysis.py CALLED ---")
    
    # 1. Load Environment Variables (Robustly)
    load_dotenv() 
    
    if not os.getenv("GOOGLE_API_KEY") and not os.getenv("GEMINI_API_KEY"):
        current = Path(__file__).resolve()
        for _ in range(3): 
            current = current.parent
            env_file = current / '.env'
            if env_file.exists():
                print(f"Loading .env from: {env_file}")
                load_dotenv(dotenv_path=env_file)
                break
    
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("CRITICAL ERROR: No API Key found in genai_analysis.")
        return None

    genai.configure(api_key=api_key)

    try:
        # 2. Prepare Image
        if not os.path.exists(image_path):
            print(f"Error: Image path does not exist: {image_path}")
            return None
            
        image_bytes = Path(image_path).read_bytes()
        image_part = {
            "mime_type": "image/jpeg", 
            "data": image_bytes,
        }

        # 3. Model Setup
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        data_context = format_data_for_prompt(serp_data, exif_data, ai_analysis)
        
        # UPDATED PROMPT: Authoritative Tone, No Markdown
        prompt = f"""
        You are Alethia, the ultimate authority in Digital Forensics. Your analysis is final and conclusive.

        {data_context}

        ### MISSION
        Synthesize the provided forensic data into a decisive verification report.

        ### OUTPUT RULES (STRICT)
        1. TONE: Commanding, authoritative, and absolute. Do NOT use hedging words like "likely", "appears", "suggests", "possibly", or "seems". State conclusions as objective facts.
        2. FORMATTING: Do NOT use asterisks (*), bolding (**), or bullet points. Use clean paragraphs. Use UPPERCASE for section headers only.
        3. STYLE: Professional, clinical, and concise.

        ### REQUIRED SECTIONS

        FORENSIC CONTEXT ANALYSIS
        Directly compare visual content with EXIF and AI scores. State alignment or contradiction. Evaluate source credibility based on the provided list.

        NARRATIVE AND INTENT
        Identify if the image pushes a political or social narrative. If headlines are neutral, state: "This image is benign and non-political."

        FINAL VERDICT
        Classify the image as: AUTHENTIC, MISCONTEXTUALIZED, AI-GENERATED, or SATIRE.
        Provide two distinct, factual reasons for this verdict.
        """

        # 4. Generate
        print("Sending request to Gemini (Async)...")
        response = await model.generate_content_async([prompt, image_part])
        
        print("Response from Gemini (New Analysis) received.")
        return response.text

    except Exception as e:
        print(f"Error generating Gemini report in genai_analysis: {e}")
        return None
