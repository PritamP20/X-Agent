// rag.ts - Document indexing
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import "dotenv/config";  
import * as dotenv from "dotenv";
dotenv.config({ path: "./" });

interface IndexingResult {
    success: boolean;
    documentsProcessed: number;
    chunksCreated: number;
    error?: string;
}

export async function indexDocument(pdfPath: string = './Shitpost.pdf'): Promise<IndexingResult> {
    try {
        console.log(`📄 Loading PDF from: ${pdfPath}`);
        const pdfLoader = new PDFLoader(pdfPath);
        const rawDocs = await pdfLoader.load();
        
        if (!rawDocs || rawDocs.length === 0) {
            throw new Error("No documents found in PDF");
        }
        
        console.log(`✅ PDF loaded successfully! Found ${rawDocs.length} pages`);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", ". ", " ", ""] 
        });

        const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
        console.log(`🔪 Document split into ${chunkedDocs.length} chunks`);

        const enrichedDocs = chunkedDocs.map((doc, index) => ({
            ...doc,
            metadata: {
                ...doc.metadata,
                chunkIndex: index,
                source: pdfPath,
                processedAt: new Date().toISOString()
            }
        }));

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : "gemini api key",
            model: "text-embedding-004"
        });
        console.log(" Google Gemini embedding client created");

        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY ? process.env.PINECONE_API_KEY: "pine api key"
        });

        const pineconeIndex = pinecone.Index("xagent");

        console.log("🌲 Storing documents in Pinecone...");
        await PineconeStore.fromDocuments(enrichedDocs, embeddings, {
            pineconeIndex: pineconeIndex,
            maxConcurrency: 5
        });

        console.log(" Documents successfully stored in vector database!");
        
        return {
            success: true,
            documentsProcessed: rawDocs.length,
            chunksCreated: chunkedDocs.length
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("❌ Indexing failed:", errorMessage);
        
        return {
            success: false,
            documentsProcessed: 0,
            chunksCreated: 0,
            error: errorMessage
        };
    }
}

async function main() {

    const result = await indexDocument('./Shitpost.pdf');
    if (result.success) {
        console.log(`🎉 Indexing complete!`);
        console.log(`📊 Stats: ${result.documentsProcessed} documents, ${result.chunksCreated} chunks`);
    } else {
        console.error("💥 Indexing failed:", result.error);
    }
}

// main().catch(console.error);