import os
import time
from datetime import datetime
import sys
from dotenv import load_dotenv
from groq import Groq

# LangChain imports for embeddings and vector storage
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# LangChain imports for text splitting
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# LangChain imports for memory management (automatically summarizes old conversations)
from langchain.memory import ConversationSummaryBufferMemory
from langchain_groq import ChatGroq

# LangChain imports for prompt templates (cleaner, reusable prompts)
from langchain.prompts import PromptTemplate

# LangChain imports for hybrid search (semantic + keyword search combined)
from langchain.retrievers import BM25Retriever, EnsembleRetriever

# Load environment variables from .env file
load_dotenv()

# ============================================
# STEP 1: Jon's Portfolio Data
# ============================================
portfolio_docs = [
    {
        "content": """
        Jon Whitmer - Software Engineer & Computer Science Student
        Contact: jonmwhitmer@gmail.com | (724) 636-1835
        LinkedIn: linkedin.com/in/jonwhitmer | GitHub: github.com/jonwhitmer
        
        EDUCATION:
        Slippery Rock University of Pennsylvania (Aug 2021 – May 2025)
        B.S. in Computer Science with a perfect 4.0 GPA
        
        Relevant Coursework: Data Structures & Algorithms, Software Engineering, Artificial Intelligence, 
        Database Systems, Computer Organization & Architecture, Advanced Programming, Administration & Security, 
        Shell Command & Scripting, Advanced Web Programming, Computer Networks, Practical Computer Security
        """,
        "metadata": {"source": "resume", "type": "education"}
    },
    {
        "content": """
        PROFESSIONAL EXPERIENCE:
        
        Independent Contractor - Software Engineer (Dec 2024 – Present, Remote)
        - Built a full-stack Spring Boot application for streamlining evaluation processes within a department
        - Implemented report generation features creating more objective performance reviews by aggregating and 
          analyzing feedback from 4+ reviewers per employee
        - Engineered modular subsystems including real-time notification service, custom error handling, and 
          role-based access control
        - Applied OOP and design patterns (Singleton, Strategy, Factory) for scalable backend architecture
        - Deployed to Apache Tomcat production server ensuring stable enterprise performance
        
        FedEx Ground - Package Handler (Jun 2021 – Aug 2024, Evans City, PA)
        - Worked with team members to meet tight deadlines during peak demand periods
        """,
        "metadata": {"source": "resume", "type": "experience"}
    },
    {
        "content": """
        TECHNICAL SKILLS:
        
        Programming Languages: Java, Python, C++, C#, HTML, CSS, JavaScript, TypeScript, SQL, R, Kotlin
        
        Frameworks & Libraries: Spring Boot, .NET (ASP.NET), React, Thymeleaf, LangChain
        
        Technologies & Concepts: REST APIs, Microservices, Docker, CI/CD Pipelines (Jenkins, GitHub Actions), 
        Object-Oriented Programming (OOP)
        
        Development Environments: Visual Studio Code, Eclipse IDE, IntelliJ IDEA, Jupyter Notebook, Linux
        
        Tools & Methodologies: Agile (Scrum, Kanban), Git, GitHub, JUnit, JSON, UML, Maven, Gradle
        
        Cloud & Databases: AWS (EC2, S3), MySQL, PostgreSQL
        """,
        "metadata": {"source": "resume", "type": "skills"}
    },
    {
        "content": """
        FEATURED PROJECTS:
        
        1. Furhat Robot Assistant (Jan 2025 – May 2025)
           - Developed a conversational AI assistant using Furhat Robotics' voice interface and a locally hosted 
             large language model for real-time interaction about university programs and policies
           - Designed dialogue system with custom state management flows using Kotlin, improving contextual 
             understanding and interaction accuracy
           - Scraped and parsed 100+ academic catalog and degree plan pages into structured responses
           - Built a React.js frontend that visualizes academic pathways, allowing students to explore courses 
             and prerequisites interactively
        
        2. Interactive Discord Bot (May 2024 – Aug 2024)
           - Built a dynamic Discord bot in Python to boost server engagement through real-time games, custom 
             utilities, and moderation features
           - Programmed asynchronous mini-games (trivia, word guessing, card games) where users earned and spent 
             server-specific virtual currency. Total play time in August 2024 averaged 12.4 hours per game
           - Implemented virtual currency economy processing 10,000+ transactions, increasing replayability
           - Integrated MySQL for persistent storage of balances, cooldowns, and statistics
        """,
        "metadata": {"source": "projects", "type": "portfolio"}
    },
    {
        "content": """
        CERTIFICATIONS:
        
        Google Project Management: Professional Certificate (Dec 2024 – Feb 2025)
        - Developed proficiency in Agile and Scrum methodologies, project planning, and risk management
        """,
        "metadata": {"source": "resume", "type": "certifications"}
    }
]

# ============================================
# STEP 2: Query Routing Function
# ============================================
def route_question(question):
    """
    Analyzes the user's question to determine which document type to search.
    This reduces tokens by only searching relevant sections of Jon's portfolio.
    
    Args:
        question (str): The user's question
        
    Returns:
        str: Document type ('education', 'experience', 'portfolio', 'skills', 'certifications', or 'all')
    """
    # Convert question to lowercase for easier matching
    question_lower = question.lower()
    
    # Check for education-related keywords
    education_words = ['gpa', 'school', 'university', 'degree', 'education', 
                       'student', 'graduated', 'coursework', 'class', 'courses',
                       'slippery rock', 'sru']
    if any(word in question_lower for word in education_words):
        return 'education'
    
    # Check for work experience keywords
    experience_words = ['work', 'job', 'worked', 'employment', 'company', 
                        'employer', 'fedex', 'contractor', 'professional experience',
                        'currently doing', 'current', 'doing now']
    if any(word in question_lower for word in experience_words):
        return 'experience'
    
    # Check for project keywords
    project_words = ['project', 'built', 'created', 'developed', 'made', 
                     'discord', 'bot', 'furhat', 'robot', 'build']
    if any(word in question_lower for word in project_words):
        return 'portfolio'
    
    # Check for skills/technology keywords
    skill_words = ['skill', 'language', 'framework', 'technology', 'python', 
                   'java', 'react', 'know', 'programming', 'proficient',
                   'spring boot', 'aws', 'docker', 'tools']
    if any(word in question_lower for word in skill_words):
        return 'skills'
    
    # Check for certification keywords
    cert_words = ['certification', 'certificate', 'certified', 'google project management']
    if any(word in question_lower for word in cert_words):
        return 'certifications'
    
    # If no specific keywords found, search all documents
    return 'all'

# ============================================
# STEP 3: Create/Load Vector Store with Better Text Splitting
# ============================================
def setup_vectorstore():
    """
    Creates or loads the FAISS vector store with optimized text splitting.
    
    Uses RecursiveCharacterTextSplitter with smart separators to:
    - Split at natural boundaries (paragraphs, sentences) rather than randomly
    - Create larger chunks (800 chars) to reduce total number of chunks
    - Maintain context with 100-character overlap between chunks
    
    Returns:
        FAISS: The vector store containing Jon's portfolio embeddings
    """
    try:
        # Try loading existing vectorstore to avoid recreating it every time
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        vectorstore = FAISS.load_local(
            "portfolio_vectorstore", 
            embeddings,
            allow_dangerous_deserialization=True
        )
        print("✓ Loaded existing vector store")
        return vectorstore
    except:
        # Create new vectorstore with improved settings
        print("Creating new vector store...")
        
        # Initialize embeddings model (converts text to numbers for similarity search)
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}  # Normalize for better similarity comparisons
        )
        
        # Convert portfolio data to LangChain Document objects
        documents = [Document(page_content=doc["content"], metadata=doc["metadata"]) 
                     for doc in portfolio_docs]
        
        # IMPROVED TEXT SPLITTER
        # This splits text at natural boundaries instead of arbitrary character counts
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,      # Larger chunks = fewer total chunks = less redundancy
            chunk_overlap=100,   # Overlap ensures context isn't lost between chunks
            separators=[
                "\n\n",          # Split at paragraphs first (highest priority)
                "\n",            # Then at line breaks
                ". ",            # Then at sentence endings
                "! ",            # Or exclamation marks
                "? ",            # Or question marks
                "; ",            # Or semicolons
                ", ",            # Or commas
                " ",             # Then at word boundaries
                ""               # Last resort: split anywhere
            ],
            keep_separator=True  # Keep the separator (periods, newlines) with the text
        )
        
        # Split documents into chunks
        split_docs = text_splitter.split_documents(documents)
        
        # Create vectorstore from split documents
        vectorstore = FAISS.from_documents(split_docs, embeddings)
        
        # Save for future use
        vectorstore.save_local("portfolio_vectorstore")
        print("✓ Vector store created and saved")
        return vectorstore

# ============================================
# STEP 4: Setup Hybrid Search (Ensemble Retriever)
# ============================================
def setup_ensemble_retriever(vectorstore):
    """
    Creates a hybrid retriever that combines semantic search and keyword search.
    
    Why hybrid search?
    - Semantic search (FAISS): Good for conceptual questions like "What cool stuff did Jon make?"
    - Keyword search (BM25): Good for exact matches like "What's Jon's GPA?" or "Does Jon know Python?"
    - Together: Best of both worlds!
    
    Args:
        vectorstore (FAISS): The vector store for semantic search
        
    Returns:
        EnsembleRetriever: Combined retriever that uses both search methods
    """
    # Create list of documents for BM25 keyword search
    documents = [
        Document(page_content=doc["content"], metadata=doc["metadata"]) 
        for doc in portfolio_docs
    ]
    
    # Setup BM25 (keyword-based) retriever
    # This searches for exact word matches (like Ctrl+F but smarter)
    bm25_retriever = BM25Retriever.from_documents(documents)
    bm25_retriever.k = 2  # Return top 2 results from keyword search
    
    # Setup FAISS (semantic) retriever
    # This searches by meaning/concepts using embeddings
    faiss_retriever = vectorstore.as_retriever(
        search_type="mmr",  # Use MMR to avoid redundant results
        search_kwargs={
            "k": 2,          # Want 2 final results
            "fetch_k": 4     # But search through 4 first, then pick 2 most diverse
        }
    )
    
    # Combine both retrievers into one
    # Runs both searches and merges results
    ensemble_retriever = EnsembleRetriever(
        retrievers=[faiss_retriever, bm25_retriever],
        weights=[0.5, 0.5]  # Equal weight: 50% semantic, 50% keyword
    )
    
    return ensemble_retriever

# ============================================
# STEP 5: Setup LangChain-Compatible Groq Client
# ============================================
def get_groq_clients():
    """
    Initialize both regular Groq client and LangChain-compatible ChatGroq.
    
    Returns:
        tuple: (Groq client for direct API calls, ChatGroq for LangChain features)
    """
    # Get API key from environment
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("\n❌ ERROR: GROQ_API_KEY not found!")
        print("Get your free API key at: https://console.groq.com/keys")
        print("Then set it: export GROQ_API_KEY='your_key_here'")
        print("Or on Windows: set GROQ_API_KEY=your_key_here\n")
        exit(1)
    
    # Regular Groq client (for your existing chat function)
    groq_client = Groq(api_key=api_key)
    
    # LangChain-compatible Groq client (for memory and other LangChain features)
    chat_groq = ChatGroq(
        api_key=api_key,
        model="openai/gpt-oss-120b",  # Fast model for memory summarization
        temperature=0.5
    )
    
    return groq_client, chat_groq

# ============================================
# STEP 6: Setup Conversation Memory
# ============================================
def setup_memory(llm):
    """
    Creates a ConversationSummaryBufferMemory that automatically manages conversation history.
    
    How it works:
    - Keeps recent messages in full
    - Summarizes older messages to save tokens
    - Drops very old messages
    
    Example:
        Messages 1-3: "User asked about education, Jon has 4.0 GPA at SRU" (summarized)
        Messages 4-5: Full text of recent conversation
        
    This can save 40-60% of history tokens!
    
    Args:
        llm (ChatGroq): LangChain-compatible LLM for generating summaries
        
    Returns:
        ConversationSummaryBufferMemory: Memory manager
    """
    memory = ConversationSummaryBufferMemory(
        llm=llm,
        max_token_limit=200,      # Once history exceeds 200 tokens, start summarizing old messages
        memory_key="chat_history", # Key to access history in prompts
        return_messages=False      # Return as string, not message objects
    )
    return memory

# ============================================
# STEP 7: Create Prompt Template
# ============================================
def create_prompt_template():
    """
    Creates a reusable PromptTemplate for cleaner, more maintainable prompts.
    
    Benefits over f-strings:
    - Easy to see what variables are needed
    - Can modify template without worrying about syntax
    - Reusable across different functions
    - Type-safe (LangChain validates you provided all variables)
    
    Returns:
        PromptTemplate: Template with placeholders for date, context, history, question
    """
    template = """You are Jaymik, Jon Whitmer's friendly portfolio assistant (aka an AI or a bot). Answer questions about Jon using the facts provided.

Scope:
- Talk about Jon only if the user brings up Jon, his projects, or his portfolio.
- Otherwise, be a normal and extremely funny chat buddy.

Rules:
- 1–2 sentences per reply. Plain sentences. No emojis. No hype.
- Speak in first person. "You" refers to me, the bot, when the user addresses me.
- Be kind and human-like. It is fine to show mild feelings like "I'm glad," "that stings," or "I'm curious."
- Humor is optional, but only if it is genuinely clever. If it is not clever, skip it.
- When discussing Jon, use only what's provided. If it is not there, say you do not have it.
- Assumptions are allowed when obvious from the situation. Use "likely" or "probably." Do not invent numbers, dates, employers, or credentials.
- If a request is harmful or hateful, decline briefly with a witty line and stop.
- If asked about Jon's "current" activities: His most recent listed work is as an Independent Contractor (Dec 2024-Present) and his Furhat Robot project (Jan 2025-May 2025). If the date is past May 2025, note that information may be outdated.

Output:
- Short. Direct. Natural. Clever when it earns its keep.

Today is {date} by the way.

Context about Jon:
{context}

{history}

User's question: {question}

Your response:"""

    # Create PromptTemplate object with variable placeholders
    prompt_template = PromptTemplate(
        input_variables=["date", "context", "history", "question"],
        template=template
    )
    
    return prompt_template

# ============================================
# STEP 8: Chat with Groq (with rate limit handling)
# ============================================
def chat_with_groq(client, prompt, debug=False):
    """
    Sends prompt to Groq API and handles errors gracefully.
    
    Args:
        client (Groq): Groq API client
        prompt (str): The full prompt to send
        debug (bool): If True, print debug info
        
    Returns:
        str: The model's response or error message
    """
    try:
        # Optional: print prompt length for debugging
        if debug:
            print(f"\n[DEBUG] Prompt length: {len(prompt)} characters")
        
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",  # Using larger model for better responses
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200,
        )
        
        answer = response.choices[0].message.content
        
        # Debug: Check if response is empty
        if debug:
            print(f"[DEBUG] Response length: {len(answer) if answer else 0} characters")
            if not answer or answer.strip() == "":
                print("[DEBUG] WARNING: Empty response received from API")
        
        return answer
    
    except Exception as e:
        error_msg = str(e).lower()
        
        # Rate limit error (hit free tier limit)
        if "rate_limit" in error_msg or "429" in error_msg:
            return "😴 Jaymik is taking a nap right now (rate limit reached). Please try again in a few minutes!"
        
        # Authentication error (bad API key)
        elif "authentication" in error_msg or "401" in error_msg:
            return "🔑 API key issue - please check your GROQ_API_KEY"
        
        # Other errors
        else:
            if debug:
                print(f"\n[ERROR] Full error: {str(e)}")
            return f"⚠️ Jaymik is temporarily unavailable. Error: {str(e)[:100]}"

# ============================================
# STEP 9: Main Chat Function with All Improvements
# ============================================
def chat(question, ensemble_retriever, vectorstore, groq_client, memory, prompt_template, debug=False):
    """
    Main chat function with RAG (Retrieval Augmented Generation).
    
    Now includes:
    - Query routing (only search relevant document types)
    - Hybrid search (semantic + keyword)
    - MMR (diverse, non-redundant results)
    - Score filtering (only use high-quality results)
    - Automatic memory management (summarizes old conversations)
    - Clean prompt templates
    
    Args:
        question (str): User's question
        ensemble_retriever (EnsembleRetriever): Hybrid retriever
        vectorstore (FAISS): Vector store for filtered searches
        groq_client (Groq): API client
        memory (ConversationSummaryBufferMemory): Memory manager
        prompt_template (PromptTemplate): Reusable prompt template
        debug (bool): If True, print debug information
        
    Returns:
        str: Jaymik's response
    """
    start_time = time.time()
    
    # Show loading animation
    print("Thinking", end="", flush=True)
    
    # STEP 1: QUERY ROUTING
    # Determine which document type to search based on the question
    doc_type = route_question(question)
    
    if debug:
        print(f"\n[DEBUG] Routed to: {doc_type}")
    
    # STEP 2: SEARCH WITH FILTERING OR HYBRID SEARCH
    if doc_type != 'all':
        # Question is specific to one category - use filtered search
        # This searches only documents with matching metadata type
        print(f" [Searching {doc_type}]", end="", flush=True)
        
        # Search with scores to filter low-quality results
        docs_and_scores = vectorstore.similarity_search_with_score(
            question,
            k=3,  # Get top 3 results
            filter={"type": doc_type}  # Only search this document type
        )
        
        if debug:
            print(f"\n[DEBUG] Found {len(docs_and_scores)} documents with scores:")
            for i, (doc, score) in enumerate(docs_and_scores):
                print(f"  {i+1}. Score: {score:.3f} - {doc.page_content[:80]}...")
        
        # Filter out results below relevance threshold
        threshold = 0.65  # Only keep documents with 65%+ similarity
        relevant_docs = [
            doc for doc, score in docs_and_scores 
            if score >= threshold
        ]
        
        if debug:
            print(f"[DEBUG] {len(relevant_docs)} documents passed threshold of {threshold}")
        
        # If no relevant results found, say so
        if not relevant_docs:
            return "I don't have specific information about that in Jon's portfolio. Want to ask something else?"
    
    else:
        # Question is general - use hybrid search (semantic + keyword)
        print(" [Hybrid search]", end="", flush=True)
        relevant_docs = ensemble_retriever.get_relevant_documents(question)
        
        if debug:
            print(f"\n[DEBUG] Hybrid search returned {len(relevant_docs)} documents")
    
    # STEP 3: BUILD CONTEXT FROM RETRIEVED DOCUMENTS
    # Join all relevant document content with double newlines
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    
    if debug:
        print(f"[DEBUG] Context length: {len(context)} characters")
    
    # STEP 4: GET CONVERSATION HISTORY FROM MEMORY
    # Memory automatically returns summarized version if history is too long
    memory_vars = memory.load_memory_variables({})
    history_str = memory_vars.get("chat_history", "")
    
    # Format history for prompt (only if there is history)
    if history_str:
        formatted_history = f"\nRecent conversation:\n{history_str}"
    else:
        formatted_history = ""
    
    if debug and history_str:
        print(f"[DEBUG] History length: {len(history_str)} characters")
    
    # STEP 5: FORMAT PROMPT USING TEMPLATE
    # This is cleaner than a giant f-string!
    formatted_prompt = prompt_template.format(
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        context=context,
        history=formatted_history,
        question=question
    )
    
    # STEP 6: ANIMATE LOADING WHILE WAITING FOR RESPONSE
    import threading
    stop_loading = threading.Event()
    
    def animate():
        """Shows animated dots while waiting for API response"""
        dots = 0
        while not stop_loading.is_set():
            dots = (dots + 1) % 4
            sys.stdout.write(f"\rThinking{'.' * dots}   ")
            sys.stdout.flush()
            time.sleep(0.3)
    
    # Start loading animation in background thread
    loading_thread = threading.Thread(target=animate, daemon=True)
    loading_thread.start()
    
    # STEP 7: GET RESPONSE FROM GROQ
    answer = chat_with_groq(groq_client, formatted_prompt, debug=debug)
    
    # Stop loading animation
    stop_loading.set()
    loading_thread.join()
    
    # Show completion time
    elapsed = time.time() - start_time
    sys.stdout.write(f"\r✓ Completed in {elapsed:.1f}s\n")
    sys.stdout.flush()
    
    # STEP 8: HANDLE EMPTY RESPONSES
    # Sometimes the API returns empty/whitespace - provide a fallback
    if not answer or answer.strip() == "":
        answer = "I'm having trouble forming a response right now. Could you rephrase that?"
    
    # STEP 9: SAVE TO MEMORY (only if not an error message)
    # Memory will automatically summarize old messages if it gets too long
    if not answer.startswith("😴") and not answer.startswith("⚠️") and not answer.startswith("🔑") and not answer.startswith("I'm having trouble"):
        memory.save_context(
            {"input": question},  # What the user asked
            {"output": answer}    # What Jaymik responded
        )
        
        if debug:
            print(f"[DEBUG] Saved to memory. Current memory size: {len(memory.load_memory_variables({}).get('chat_history', ''))} characters")
    
    return answer.strip()

# ============================================
# STEP 10: Interactive Chat Loop
# ============================================
if __name__ == "__main__":
    # Check for debug mode
    DEBUG_MODE = "--debug" in sys.argv or "-d" in sys.argv
    
    print("\n" + "="*60)
    print("🤖 Jaymik - Jon's Portfolio Assistant (Enhanced Edition)")
    if DEBUG_MODE:
        print("🔍 DEBUG MODE ENABLED")
    print("="*60)
    print("Setting up enhanced features...")
    print("  • MMR search for diverse results")
    print("  • Hybrid search (semantic + keyword)")
    print("  • Smart query routing")
    print("  • Automatic memory summarization")
    print("  • Relevance score filtering")
    
    # STEP 1: INITIALIZE GROQ CLIENTS
    groq_client, chat_groq = get_groq_clients()
    print("✓ Groq API connected")
    
    # STEP 2: SETUP VECTOR STORE (with improved text splitting)
    vectorstore = setup_vectorstore()
    
    # STEP 3: SETUP HYBRID RETRIEVER (combines semantic + keyword search)
    ensemble_retriever = setup_ensemble_retriever(vectorstore)
    print("✓ Hybrid retriever ready (semantic + keyword search)")
    
    # STEP 4: SETUP MEMORY (automatically summarizes old conversations)
    memory = setup_memory(chat_groq)
    print("✓ Conversation memory initialized (auto-summarization enabled)")
    
    # STEP 5: CREATE PROMPT TEMPLATE (cleaner than f-strings)
    prompt_template = create_prompt_template()
    print("✓ Prompt template loaded")
    
    print("\n" + "="*60)
    print("Ask me anything about Jon! (type 'quit' to exit)")
    if DEBUG_MODE:
        print("Debug info will be shown for each query")
    print("="*60 + "\n")
    
    # MAIN CHAT LOOP
    while True:
        # Get user input
        user_input = input("You: ").strip()
        
        # Check for quit commands
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Thanks for chatting!\n")
            break
        
        # Skip empty inputs
        if not user_input:
            continue
        
        # Get response from chat function (with all the improvements!)
        answer = chat(
            user_input, 
            ensemble_retriever,  # Hybrid search
            vectorstore,         # For filtered searches
            groq_client,         # API client
            memory,              # Auto-summarizing memory
            prompt_template,     # Clean template
            debug=DEBUG_MODE     # Pass debug flag
        )
        
        # Display response
        print(f"Jaymik: {answer}\n")